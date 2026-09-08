import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { attemptId, questionId, selectedOptionIds, textAnswer, isFlaggedForReview } = await req.json();

  if (!attemptId || !questionId) {
    return NextResponse.json({ error: 'Attempt ID and Question ID are required' }, { status: 400 });
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.userId || attempt.status !== 'IN_PROGRESS') {
    return NextResponse.json({ error: 'Active exam attempt not found' }, { status: 403 });
  }

  // Upsert the attempt answer record
  const existingAnswer = await prisma.attemptAnswer.findFirst({
    where: { attemptId, questionId },
  });

  if (existingAnswer) {
    await prisma.attemptAnswer.update({
      where: { id: existingAnswer.id },
      data: {
        selectedOptionIdsJson: selectedOptionIds !== undefined ? JSON.stringify(selectedOptionIds) : undefined,
        textAnswer: textAnswer !== undefined ? textAnswer : undefined,
        isFlaggedForReview: isFlaggedForReview !== undefined ? !!isFlaggedForReview : undefined,
        answeredAt: new Date(),
      },
    });
  } else {
    await prisma.attemptAnswer.create({
      data: {
        attemptId,
        questionId,
        selectedOptionIdsJson: selectedOptionIds ? JSON.stringify(selectedOptionIds) : null,
        textAnswer: textAnswer || null,
        isFlaggedForReview: !!isFlaggedForReview,
      },
    });
  }

  return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
}
