import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { examId } = await req.json();
  if (!examId) {
    return NextResponse.json({ error: 'Exam ID is required' }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subject: true,
      examQuestions: {
        include: {
          question: {
            include: {
              options: {
                select: {
                  id: true,
                  optionText: true,
                  orderIndex: true,
                  // DO NOT select isCorrect to protect exam integrity!
                },
              },
            },
          },
        },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!exam || exam.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Exam is not currently published or available' }, { status: 404 });
  }

  // Check Schedule window if set
  const now = new Date();
  if (exam.scheduleStart && now < new Date(exam.scheduleStart)) {
    return NextResponse.json({ error: 'This exam is not yet open according to its schedule.' }, { status: 403 });
  }
  if (exam.scheduleEnd && now > new Date(exam.scheduleEnd)) {
    return NextResponse.json({ error: 'This exam schedule window has expired.' }, { status: 403 });
  }

  // Check existing attempts
  const pastAttempts = await prisma.examAttempt.findMany({
    where: {
      examId,
      userId: session.userId,
    },
    orderBy: { attemptNumber: 'desc' },
  });

  // Check if there is an active in-progress attempt to resume
  const activeAttempt = pastAttempts.find((a) => a.status === 'IN_PROGRESS');
  if (activeAttempt) {
    // Check if time expired
    const timeElapsedSeconds = Math.floor((Date.now() - new Date(activeAttempt.startedAt).getTime()) / 1000);
    const maxAllowedSeconds = exam.durationMinutes * 60;

    if (timeElapsedSeconds < maxAllowedSeconds) {
      // Resume active attempt
      const savedAnswers = await prisma.attemptAnswer.findMany({
        where: { attemptId: activeAttempt.id },
      });

      return NextResponse.json({
        attemptId: activeAttempt.id,
        exam: sanitizeExamForStudent(exam),
        startedAt: activeAttempt.startedAt,
        timeRemainingSeconds: Math.max(0, maxAllowedSeconds - timeElapsedSeconds),
        savedAnswers: savedAnswers.map((a) => ({
          questionId: a.questionId,
          selectedOptionIds: a.selectedOptionIdsJson ? JSON.parse(a.selectedOptionIdsJson) : [],
          textAnswer: a.textAnswer || '',
          isFlaggedForReview: a.isFlaggedForReview,
        })),
        antiCheatSettings: {
          fullScreenRequired: exam.fullScreenRequired,
          tabSwitchDetect: exam.tabSwitchDetect,
          copyPasteRestrict: exam.copyPasteRestrict,
        },
      });
    } else {
      // Auto-submit expired attempt
      await prisma.examAttempt.update({
        where: { id: activeAttempt.id },
        data: { status: 'TIMED_OUT' },
      });
    }
  }

  // Check attempt limits
  const completedCount = pastAttempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'TIMED_OUT').length;
  if (!exam.allowRetakes && completedCount >= 1) {
    return NextResponse.json({ error: 'You have already completed this exam and retakes are not permitted.' }, { status: 403 });
  }
  if (completedCount >= exam.maxAttempts) {
    return NextResponse.json({ error: `You have reached the maximum allowed attempts (${exam.maxAttempts}) for this exam.` }, { status: 403 });
  }

  // Create New Attempt
  const newAttempt = await prisma.examAttempt.create({
    data: {
      companyId: exam.companyId,
      examId: exam.id,
      userId: session.userId,
      attemptNumber: completedCount + 1,
      startedAt: new Date(),
      status: 'IN_PROGRESS',
      maxMarks: exam.totalMarks,
      antiCheatIncidentsJson: JSON.stringify([]),
    },
  });

  await logAudit({
    session,
    action: 'START_EXAM_ATTEMPT',
    entity: 'EXAM_ATTEMPT',
    entityId: newAttempt.id,
    details: { examTitle: exam.title, attemptNumber: newAttempt.attemptNumber },
    req,
  });

  return NextResponse.json({
    attemptId: newAttempt.id,
    exam: sanitizeExamForStudent(exam),
    startedAt: newAttempt.startedAt,
    timeRemainingSeconds: exam.durationMinutes * 60,
    savedAnswers: [],
    antiCheatSettings: {
      fullScreenRequired: exam.fullScreenRequired,
      tabSwitchDetect: exam.tabSwitchDetect,
      copyPasteRestrict: exam.copyPasteRestrict,
    },
  });
}

function sanitizeExamForStudent(exam: any) {
  let questions = exam.examQuestions.map((eq: any) => {
    let options = eq.question.options.map((opt: any) => ({
      id: opt.id,
      optionText: opt.optionText,
    }));

    if (exam.randomOptions) {
      options = options.sort(() => 0.5 - Math.random());
    }

    return {
      id: eq.question.id,
      questionText: eq.question.questionText,
      type: eq.question.type,
      difficulty: eq.question.difficulty,
      marks: eq.marks,
      options,
    };
  });

  if (exam.randomQuestions) {
    questions = questions.sort(() => 0.5 - Math.random());
  }

  return {
    id: exam.id,
    title: exam.title,
    code: exam.code,
    description: exam.description,
    instructions: exam.instructions,
    subjectName: exam.subject.name,
    durationMinutes: exam.durationMinutes,
    passScorePercent: exam.passScorePercent,
    totalMarks: exam.totalMarks,
    questions,
  };
}
