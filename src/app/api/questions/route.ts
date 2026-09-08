import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get('subjectId');
  const type = searchParams.get('type');
  const difficulty = searchParams.get('difficulty');
  const search = searchParams.get('search')?.toLowerCase();

  const where: any = tenantScopedWhere(session);
  if (subjectId) where.subjectId = subjectId;
  if (type) where.type = type;
  if (difficulty) where.difficulty = difficulty;

  const questions = await prisma.question.findMany({
    where,
    include: {
      subject: true,
      topic: true,
      options: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  let filtered = questions;
  if (search) {
    filtered = questions.filter(
      (q) =>
        q.questionText.toLowerCase().includes(search) ||
        (q.tags && q.tags.toLowerCase().includes(search)) ||
        q.subject.name.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ questions: filtered });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'])) {
    return forbiddenResponse();
  }

  const {
    subjectId,
    topicId,
    questionText,
    type = 'MCQ',
    difficulty = 'MEDIUM',
    marks = 1.0,
    explanation,
    tags,
    options,
    isAiGenerated = false,
    batchQuestions,
  } = await req.json();

  // Handle batch saving (e.g. approved AI questions)
  if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
    const createdList = [];
    for (const item of batchQuestions) {
      const q = await prisma.question.create({
        data: {
          companyId: session.companyId || (await prisma.subject.findUnique({ where: { id: item.subjectId } }))?.companyId!,
          subjectId: item.subjectId,
          topicId: item.topicId || null,
          questionText: item.questionText,
          type: item.type || 'MCQ',
          difficulty: item.difficulty || 'MEDIUM',
          marks: item.marks || 1.0,
          explanation: item.explanation || null,
          tags: item.tags || null,
          createdById: session.userId,
          isAiGenerated: item.isAiGenerated ?? true,
          options: item.options && item.options.length > 0
            ? {
                create: item.options.map((opt: any, idx: number) => ({
                  optionText: opt.optionText,
                  isCorrect: !!opt.isCorrect,
                  orderIndex: idx,
                })),
              }
            : undefined,
        },
      });
      createdList.push(q);
    }

    await logAudit({
      session,
      action: 'BATCH_CREATE_QUESTIONS',
      entity: 'QUESTION',
      details: { count: createdList.length },
      req,
    });

    return NextResponse.json({ success: true, count: createdList.length }, { status: 201 });
  }

  // Single Question Creation
  if (!subjectId || !questionText) {
    return NextResponse.json({ error: 'Subject and question text are required' }, { status: 400 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

  const question = await prisma.question.create({
    data: {
      companyId: subject.companyId,
      subjectId,
      topicId: topicId || null,
      questionText: questionText.trim(),
      type,
      difficulty,
      marks: parseFloat(marks.toString()) || 1.0,
      explanation: explanation || null,
      tags: tags || null,
      createdById: session.userId,
      isAiGenerated,
      options: Array.isArray(options) && options.length > 0
        ? {
            create: options.map((opt: any, idx: number) => ({
              optionText: opt.optionText.trim(),
              isCorrect: !!opt.isCorrect,
              orderIndex: idx,
            })),
          }
        : undefined,
    },
    include: {
      options: true,
      subject: true,
      topic: true,
    },
  });

  await logAudit({
    session,
    action: 'CREATE_QUESTION',
    entity: 'QUESTION',
    entityId: question.id,
    req,
  });

  return NextResponse.json({ question }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'])) {
    return forbiddenResponse();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) return NextResponse.json({ error: 'Question not found' }, { status: 404 });

  if (session.role !== 'SUPER_ADMIN' && question.companyId !== session.companyId) {
    return forbiddenResponse();
  }

  await prisma.question.delete({ where: { id } });

  await logAudit({
    session,
    action: 'DELETE_QUESTION',
    entity: 'QUESTION',
    entityId: id,
    req,
  });

  return NextResponse.json({ success: true });
}
