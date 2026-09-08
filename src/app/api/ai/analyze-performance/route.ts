import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { analyzePerformanceWithAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  try {
    const { resultId } = await req.json();
    if (!resultId) {
      return NextResponse.json({ error: 'Result ID required' }, { status: 400 });
    }

    const result = await prisma.result.findUnique({
      where: { id: resultId },
      include: {
        user: true,
        exam: {
          include: { subject: true },
        },
        attempt: {
          include: {
            answers: {
              include: {
                question: {
                  include: { topic: true },
                },
              },
            },
          },
        },
        aiAnalysis: true,
      },
    });

    if (!result) {
      return NextResponse.json({ error: 'Result record not found' }, { status: 404 });
    }

    // Return existing analysis if already performed
    if (result.aiAnalysis) {
      return NextResponse.json({
        analysis: {
          ...result.aiAnalysis,
          weakTopics: JSON.parse(result.aiAnalysis.weakTopicsJson || '[]'),
          strongTopics: JSON.parse(result.aiAnalysis.strongTopicsJson || '[]'),
          improvementRoadmap: JSON.parse(result.aiAnalysis.improvementRoadmapJson || '[]'),
          recommendedActions: JSON.parse(result.aiAnalysis.recommendedActionsJson || '[]'),
        },
      });
    }

    // Compute Topic Breakdown from attempt answers
    const topicBreakdown: Record<string, { total: number; correct: number }> = {};
    result.attempt.answers.forEach((ans) => {
      const topicName = ans.question.topic?.name || result.exam.subject.name || 'General';
      if (!topicBreakdown[topicName]) {
        topicBreakdown[topicName] = { total: 0, correct: 0 };
      }
      topicBreakdown[topicName].total++;
      if (ans.isCorrect) {
        topicBreakdown[topicName].correct++;
      }
    });

    const aiOutput = await analyzePerformanceWithAI({
      employeeName: result.user.name,
      examTitle: result.exam.title,
      subjectName: result.exam.subject.name,
      score: result.totalScore,
      percentage: result.percentage,
      isPassed: result.isPassed,
      topicBreakdown,
    });

    // Save to Database
    const saved = await prisma.aIAnalysis.create({
      data: {
        companyId: result.companyId,
        resultId: result.id,
        userId: result.userId,
        overallSummary: aiOutput.overallSummary,
        weakTopicsJson: JSON.stringify(aiOutput.weakTopics),
        strongTopicsJson: JSON.stringify(aiOutput.strongTopics),
        improvementRoadmapJson: JSON.stringify(aiOutput.improvementRoadmap),
        recommendedActionsJson: JSON.stringify(aiOutput.recommendedActions),
      },
    });

    // Also auto-generate training recommendations if employee has weak topics
    for (const action of aiOutput.recommendedActions) {
      await prisma.trainingRecommendation.create({
        data: {
          companyId: result.companyId,
          userId: result.userId,
          topicTitle: aiOutput.weakTopics[0] || result.exam.subject.name,
          courseTitle: action.courseTitle,
          description: action.description,
          priority: action.priority as any,
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json({
      analysis: {
        ...saved,
        weakTopics: aiOutput.weakTopics,
        strongTopics: aiOutput.strongTopics,
        improvementRoadmap: aiOutput.improvementRoadmap,
        recommendedActions: aiOutput.recommendedActions,
      },
    });
  } catch (error: any) {
    console.error('AI performance analysis error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze result' }, { status: 500 });
  }
}
