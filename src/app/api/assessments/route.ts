import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  try {
    const where: any = tenantScopedWhere(session);
    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            code: true,
            totalMarks: true,
            durationMinutes: true,
          },
        },
        submissions: {
          where: session.role === 'EMPLOYEE' ? { userId: session.userId } : undefined,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ assessments: assessments || [] });
  } catch (err: any) {
    console.error('Error fetching assessments:', err);
    return NextResponse.json({ error: 'Failed to retrieve assessments', details: err?.message }, { status: 500 });
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
    description,
    type = 'PRE_HIRE',
    passingScore = 70,
    examId,
    status = 'ACTIVE',
    companyId: targetCompanyId,
  } = await req.json();

  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !title || !code) {
    return NextResponse.json({ error: 'Assessment title, unique code, and company are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  try {
    const existing = await prisma.assessment.findUnique({
      where: { companyId_code: { companyId, code: cleanCode } },
    });
    if (existing) {
      return NextResponse.json({ error: 'An assessment with this code already exists in your company' }, { status: 409 });
    }

    const assessment = await prisma.assessment.create({
      data: {
        companyId,
        title: title.trim(),
        code: cleanCode,
        description: description || null,
        type,
        passingScore: parseFloat(passingScore.toString()) || 70,
        examId: examId || null,
        status,
      },
      include: {
        exam: true,
      },
    });

    try {
      await logAudit({
        session,
        action: 'CREATE_ASSESSMENT',
        entity: 'ASSESSMENT',
        entityId: assessment.id,
        details: { title: assessment.title, code: assessment.code },
        req,
      });
    } catch (e) {}

    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating assessment:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create assessment' }, { status: 500 });
  }
}
