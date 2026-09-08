import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { generateCertNumber } from '@/lib/utils';
import { analyzePerformanceWithAI } from '@/lib/ai';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { attemptId } = await req.json();
  if (!attemptId) {
    return NextResponse.json({ error: 'Attempt ID is required' }, { status: 400 });
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          company: true,
          subject: true,
          examQuestions: {
            include: {
              question: {
                include: {
                  options: true,
                  topic: true,
                },
              },
            },
          },
        },
      },
      answers: true,
      user: true,
    },
  });

  if (!attempt || attempt.userId !== session.userId) {
    return NextResponse.json({ error: 'Exam attempt not found' }, { status: 404 });
  }

  if (attempt.status === 'SUBMITTED') {
    const existingResult = await prisma.result.findUnique({
      where: { attemptId },
      include: { certificate: true, aiAnalysis: true },
    });
    return NextResponse.json({ result: existingResult });
  }

  const exam = attempt.exam;
  const examQuestions = exam.examQuestions;

  let totalMarksEarned = 0;
  let maxMarks = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const topicBreakdown: Record<string, { total: number; correct: number }> = {};

  // Grade each question
  for (const eq of examQuestions) {
    const q = eq.question;
    const qMarks = eq.marks || q.marks || 1.0;
    maxMarks += qMarks;

    const topicName = q.topic?.name || exam.subject.name || 'General';
    if (!topicBreakdown[topicName]) {
      topicBreakdown[topicName] = { total: 0, correct: 0 };
    }
    topicBreakdown[topicName].total++;

    const studentAnswer = attempt.answers.find((a) => a.questionId === q.id);

    let isCorrect = false;
    let marksEarned = 0;

    if (!studentAnswer || (!studentAnswer.selectedOptionIdsJson && !studentAnswer.textAnswer)) {
      unansweredCount++;
    } else {
      const selectedIds: string[] = studentAnswer.selectedOptionIdsJson
        ? JSON.parse(studentAnswer.selectedOptionIdsJson)
        : [];

      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE' || q.type === 'SCENARIO') {
        const correctOption = q.options.find((opt) => opt.isCorrect);
        if (correctOption && selectedIds.length === 1 && selectedIds[0] === correctOption.id) {
          isCorrect = true;
          marksEarned = qMarks;
          correctCount++;
          topicBreakdown[topicName].correct++;
        } else {
          wrongCount++;
        }
      } else if (q.type === 'MULTIPLE_SELECT') {
        const correctOptionIds = q.options.filter((opt) => opt.isCorrect).map((opt) => opt.id);
        const isExactMatch =
          correctOptionIds.length === selectedIds.length &&
          correctOptionIds.every((id) => selectedIds.includes(id));

        if (isExactMatch) {
          isCorrect = true;
          marksEarned = qMarks;
          correctCount++;
          topicBreakdown[topicName].correct++;
        } else {
          wrongCount++;
        }
      } else {
        // Short answer or Essay auto-evaluated or assigned full marks if text provided
        if (studentAnswer.textAnswer && studentAnswer.textAnswer.trim().length > 10) {
          isCorrect = true;
          marksEarned = qMarks;
          correctCount++;
          topicBreakdown[topicName].correct++;
        } else {
          wrongCount++;
        }
      }

      // Update question answer record
      if (studentAnswer) {
        await prisma.attemptAnswer.update({
          where: { id: studentAnswer.id },
          data: {
            isCorrect,
            marksEarned,
          },
        });
      }
    }

    totalMarksEarned += marksEarned;
  }

  const percentage = maxMarks > 0 ? (totalMarksEarned / maxMarks) * 100 : 0;
  const isPassed = percentage >= exam.passScorePercent;
  const durationSeconds = Math.max(1, Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));

  // Update Attempt Record
  const updatedAttempt = await prisma.examAttempt.update({
    where: { id: attempt.id },
    data: {
      status: 'SUBMITTED',
      submittedAt: new Date(),
      durationSeconds,
      totalMarksEarned,
      maxMarks,
      percentage,
      isPassed,
    },
  });

  // Create Result Record
  const result = await prisma.result.create({
    data: {
      companyId: exam.companyId,
      attemptId: attempt.id,
      examId: exam.id,
      userId: session.userId,
      totalScore: totalMarksEarned,
      maxScore: maxMarks,
      percentage,
      isPassed,
      correctCount,
      wrongCount,
      unansweredCount,
      timeSpentSeconds: durationSeconds,
      topicBreakdownJson: JSON.stringify(topicBreakdown),
    },
  });

  // Generate Certificate if passed and eligible
  let certificate = null;
  if (isPassed && exam.isCertEligible) {
    const certNum = generateCertNumber(exam.company.code || 'CERT');
    certificate = await prisma.certificate.create({
      data: {
        companyId: exam.companyId,
        resultId: result.id,
        userId: session.userId,
        examId: exam.id,
        certNumber: certNum,
        issueDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Year validity
        status: 'VALID',
        verificationToken: `vtok_${Math.random().toString(36).substring(2, 12)}`,
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.userId,
        companyId: exam.companyId,
        title: `🏆 Certificate Earned: ${exam.title}`,
        message: `Congratulations! You passed with ${percentage.toFixed(1)}%. Certificate ${certNum} is now issued.`,
        type: 'CERTIFICATE_ISSUED',
        linkUrl: `/dashboard/certificates`,
      },
    });
  } else {
    await prisma.notification.create({
      data: {
        userId: session.userId,
        companyId: exam.companyId,
        title: `Exam Completed: ${exam.title}`,
        message: `Your score: ${percentage.toFixed(1)}% (${isPassed ? 'PASSED' : 'DID NOT PASS'}).`,
        type: 'RESULT_AVAILABLE',
        linkUrl: `/dashboard/results/${result.id}`,
      },
    });
  }

  // Generate AI Performance Analysis & training roadmap
  try {
    const aiOutput = await analyzePerformanceWithAI({
      employeeName: attempt.user.name,
      examTitle: exam.title,
      subjectName: exam.subject.name,
      score: totalMarksEarned,
      percentage,
      isPassed,
      topicBreakdown,
    });

    await prisma.aIAnalysis.create({
      data: {
        companyId: exam.companyId,
        resultId: result.id,
        userId: session.userId,
        overallSummary: aiOutput.overallSummary,
        weakTopicsJson: JSON.stringify(aiOutput.weakTopics),
        strongTopicsJson: JSON.stringify(aiOutput.strongTopics),
        improvementRoadmapJson: JSON.stringify(aiOutput.improvementRoadmap),
        recommendedActionsJson: JSON.stringify(aiOutput.recommendedActions),
      },
    });

    // Save training recommendations
    for (const action of aiOutput.recommendedActions) {
      await prisma.trainingRecommendation.create({
        data: {
          companyId: exam.companyId,
          userId: session.userId,
          topicTitle: aiOutput.weakTopics[0] || exam.subject.name,
          courseTitle: action.courseTitle,
          description: action.description,
          priority: action.priority as any,
          status: 'PENDING',
        },
      });
    }
  } catch (aiErr) {
    console.error('Post-exam AI analysis generation non-blocking error:', aiErr);
  }

  await logAudit({
    session,
    action: 'SUBMIT_EXAM',
    entity: 'RESULT',
    entityId: result.id,
    details: { examTitle: exam.title, score: totalMarksEarned, maxMarks, percentage, isPassed },
    req,
  });

  return NextResponse.json({
    success: true,
    resultId: result.id,
    percentage,
    isPassed,
    totalScore: totalMarksEarned,
    maxScore: maxMarks,
    certificateId: certificate?.id || null,
  });
}
