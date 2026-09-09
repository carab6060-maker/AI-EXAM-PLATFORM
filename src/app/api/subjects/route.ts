import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  try {
    const where = tenantScopedWhere(session);
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        topics: true,
        _count: {
          select: {
            questions: true,
            exams: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ subjects: subjects || [] });
  } catch (err: any) {
    console.error('Prisma subjects query error:', err);
    return NextResponse.json({ error: 'Failed to retrieve subjects from database', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'])) {
    return forbiddenResponse();
  }

  const { name, code, description, departmentId, category, difficulty, topics, companyId: targetCompanyId } = await req.json();
  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !name || !code) {
    return NextResponse.json({ error: 'Subject name, code, and company are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  try {
    const existing = await prisma.subject.findUnique({
      where: { companyId_code: { companyId, code: cleanCode } },
    });
    if (existing) {
      return NextResponse.json({ error: 'A subject with this code already exists in your company' }, { status: 409 });
    }

    const subject = await prisma.subject.create({
      data: {
        companyId,
        name: name.trim(),
        code: cleanCode,
        description: description || null,
        departmentId: departmentId || null,
        category: category || 'General',
        difficulty: difficulty || 'INTERMEDIATE',
        createdById: session.userId,
        topics: Array.isArray(topics) && topics.length > 0
          ? {
              create: topics.filter((t: string) => t.trim().length > 0).map((t: string) => ({ name: t.trim() })),
            }
          : undefined,
      },
      include: {
        topics: true,
        department: true,
      },
    });

    try {
      await logAudit({
        session,
        action: 'CREATE_SUBJECT',
        entity: 'SUBJECT',
        entityId: subject.id,
        details: { name: subject.name, code: subject.code },
        req,
      });
    } catch (e) {}

    return NextResponse.json({ subject }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating subject in database:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create subject in database' }, { status: 500 });
  }
}
