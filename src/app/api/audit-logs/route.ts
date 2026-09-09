import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { forbiddenResponse, unauthorizedResponse, tenantScopedWhere } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'AUDITOR'])) {
    return forbiddenResponse();
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  const entity = searchParams.get('entity');

  const where: any = tenantScopedWhere(session);
  if (action) where.action = action;
  if (entity) where.entity = entity;

  try {
    const logs = await prisma.auditLog.findMany({
      where,
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true, role: true } },
        company: { select: { name: true, code: true } },
      },
    });

    return NextResponse.json({ logs: logs || [] });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    return NextResponse.json({ error: 'Failed to retrieve audit trail', details: err?.message }, { status: 500 });
  }
}
