import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { forbiddenResponse, unauthorizedResponse } from '@/lib/tenant';
import { generateAIQuestions } from '@/lib/ai';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'])) {
    return forbiddenResponse();
  }

  try {
    const { subject, topic, difficulty = 'MEDIUM', count = 5, type = 'MCQ', language = 'English', marks = 1 } = await req.json();

    if (!subject || !topic) {
      return NextResponse.json({ error: 'Subject and topic are required for AI question generation' }, { status: 400 });
    }

    const safeCount = Math.min(Math.max(1, parseInt(count.toString()) || 5), 30);
    const questions = await generateAIQuestions({
      subject,
      topic,
      difficulty,
      count: safeCount,
      type,
      language,
      marks: parseFloat(marks.toString()) || 1,
    });

    await logAudit({
      session,
      action: 'AI_GENERATE_QUESTIONS',
      entity: 'AI_AGENT',
      details: { subject, topic, count: questions.length, difficulty },
      req,
    });

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        subject,
        topic,
        count: questions.length,
        difficulty,
        type,
      },
    });
  } catch (error: any) {
    console.error('AI question generation endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate AI questions' }, { status: 500 });
  }
}
