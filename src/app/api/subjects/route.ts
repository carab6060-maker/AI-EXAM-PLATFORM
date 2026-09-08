import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

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

  return NextResponse.json({ subjects });
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

  await logAudit({
    session,
    action: 'CREATE_SUBJECT',
    entity: 'SUBJECT',
    entityId: subject.id,
    details: { name: subject.name, code: subject.code },
    req,
  });

  return NextResponse.json({ subject }, { status: 201 });
}
