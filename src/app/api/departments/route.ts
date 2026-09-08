import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const where = tenantScopedWhere(session);
  const departments = await prisma.department.findMany({
    where,
    include: {
      teams: true,
      positions: true,
      _count: {
        select: {
          employeeProfiles: true,
          subjects: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ departments });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { name, code, description, companyId: targetCompanyId, teams } = await req.json();
  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !name || !code) {
    return NextResponse.json({ error: 'Department name, code, and company are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  // Create department & teams
  const department = await prisma.department.create({
    data: {
      companyId,
      name: name.trim(),
      code: cleanCode,
      description: description || null,
      teams: Array.isArray(teams) && teams.length > 0
        ? {
            create: teams.filter((t: string) => t.trim().length > 0).map((t: string) => ({ name: t.trim() })),
          }
        : undefined,
    },
    include: {
      teams: true,
    },
  });

  await logAudit({
    session,
    action: 'CREATE_DEPARTMENT',
    entity: 'DEPARTMENT',
    entityId: department.id,
    details: { name: department.name, code: department.code },
    req,
  });

  return NextResponse.json({ department }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Department ID required' }, { status: 400 });

  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 });

  if (session.role !== 'SUPER_ADMIN' && dept.companyId !== session.companyId) {
    return forbiddenResponse();
  }

  await prisma.department.delete({ where: { id } });

  await logAudit({
    session,
    action: 'DELETE_DEPARTMENT',
    entity: 'DEPARTMENT',
    entityId: id,
    req,
  });

  return NextResponse.json({ success: true });
}
