import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const subjectId = searchParams.get('subjectId');

  const where: any = tenantScopedWhere(session);
  if (status) where.status = status;
  if (subjectId) where.subjectId = subjectId;

  try {
    // If role is EMPLOYEE, filter to exams assigned to them or their department
    if (session.role === 'EMPLOYEE') {
      const profile = await prisma.employeeProfile.findUnique({
        where: { userId: session.userId },
      });

      const assignedExams = await prisma.examAssignment.findMany({
        where: {
          companyId: session.companyId!,
          OR: [
            { targetType: 'ALL_COMPANY' },
            { targetType: 'INDIVIDUAL', employeeProfileId: profile?.id },
            { targetType: 'DEPARTMENT', departmentId: profile?.departmentId },
            { targetType: 'POSITION', positionId: profile?.positionId },
          ],
        },
        select: { examId: true },
      });

      const assignedExamIds = Array.from(new Set(assignedExams.map((a) => a.examId)));

      const exams = await prisma.exam.findMany({
        where: {
          id: assignedExamIds.length > 0 ? { in: assignedExamIds } : undefined,
          status: 'PUBLISHED',
        },
        include: {
          subject: true,
          attempts: {
            where: { userId: session.userId },
            orderBy: { attemptNumber: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ exams: exams || [] });
    } else {
      // Admin view
      const exams = await prisma.exam.findMany({
        where,
        include: {
          subject: true,
          _count: {
            select: {
              examQuestions: true,
              assignments: true,
              attempts: true,
              results: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ exams: exams || [] });
    }
  } catch (err: any) {
    console.error('Prisma exams query error:', err);
    return NextResponse.json({ error: 'Failed to retrieve exams from database', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'])) {
    return forbiddenResponse();
  }

  const {
    title,
    code,
    subjectId,
    description,
    instructions,
    examType = 'CERTIFICATION',
    durationMinutes = 60,
    passScorePercent = 70,
    questionSelectionMode = 'MANUAL', // MANUAL or RANDOM_POOL
    selectedQuestionIds = [],
    randomQuestionCount = 10,
    randomQuestions = false,
    randomOptions = true,
    allowRetakes = true,
    maxAttempts = 3,
    isCertEligible = true,
    scheduleStart,
    scheduleEnd,
    fullScreenRequired = true,
    tabSwitchDetect = true,
    copyPasteRestrict = true,
    companyId: targetCompanyId,
  } = await req.json();

  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !title || !code || !subjectId) {
    return NextResponse.json({ error: 'Exam title, code, subject, and company are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  try {
    let finalQuestionIds: string[] = [];

    if (questionSelectionMode === 'RANDOM_POOL') {
      // Pick random active questions from this subject
      const available = await prisma.question.findMany({
        where: { companyId, subjectId, status: 'ACTIVE' },
        select: { id: true, marks: true },
      });
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      finalQuestionIds = shuffled.slice(0, Math.min(randomQuestionCount, shuffled.length)).map((q) => q.id);
    } else {
      finalQuestionIds = selectedQuestionIds;
    }

    if (finalQuestionIds.length === 0) {
      return NextResponse.json({ error: 'An exam must contain at least one question.' }, { status: 400 });
    }

    // Fetch question marks to calculate totalMarks
    const questionsData = await prisma.question.findMany({
      where: { id: { in: finalQuestionIds } },
      select: { id: true, marks: true },
    });

    const totalMarks = questionsData.reduce((sum, q) => sum + (q.marks || 1), 0);

    const exam = await prisma.exam.create({
      data: {
        companyId,
        subjectId,
        title: title.trim(),
        code: cleanCode,
        description: description || null,
        instructions: instructions || null,
        examType,
        durationMinutes: parseInt(durationMinutes.toString()) || 60,
        passScorePercent: parseFloat(passScorePercent.toString()) || 70,
        totalMarks,
        questionCount: finalQuestionIds.length,
        randomQuestions: !!randomQuestions,
        randomOptions: !!randomOptions,
        allowRetakes: !!allowRetakes,
        maxAttempts: parseInt(maxAttempts.toString()) || 3,
        isCertEligible: !!isCertEligible,
        scheduleStart: scheduleStart ? new Date(scheduleStart) : null,
        scheduleEnd: scheduleEnd ? new Date(scheduleEnd) : null,
        fullScreenRequired: !!fullScreenRequired,
        tabSwitchDetect: !!tabSwitchDetect,
        copyPasteRestrict: !!copyPasteRestrict,
        status: 'PUBLISHED',
        createdById: session.userId,
        examQuestions: {
          create: finalQuestionIds.map((qId, idx) => {
            const qObj = questionsData.find((q) => q.id === qId);
            return {
              questionId: qId,
              orderIndex: idx,
              marks: qObj?.marks || 1.0,
            };
          }),
        },
      },
      include: {
        examQuestions: true,
        subject: true,
      },
    });

    try {
      await logAudit({
        session,
        action: 'CREATE_EXAM',
        entity: 'EXAM',
        entityId: exam.id,
        details: { title: exam.title, code: exam.code, questions: finalQuestionIds.length },
        req,
      });
    } catch (auditErr) {}

    return NextResponse.json({ exam }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating exam in database:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create exam in database' }, { status: 500 });
  }
}
