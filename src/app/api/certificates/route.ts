import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const where: any = tenantScopedWhere(session);
  if (session.role === 'EMPLOYEE') {
    where.userId = session.userId;
  }

  const certificates = await prisma.certificate.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeProfile: {
            include: { department: true, position: true },
          },
        },
      },
      exam: {
        include: { subject: true },
      },
      company: {
        select: { id: true, name: true, logo: true, code: true },
      },
      result: {
        select: { totalScore: true, maxScore: true, percentage: true },
      },
    },
    orderBy: { issueDate: 'desc' },
  });

  return NextResponse.json({ certificates });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { certificateId, status } = await req.json();
  if (!certificateId || !status) {
    return NextResponse.json({ error: 'Certificate ID and new status are required' }, { status: 400 });
  }

  const cert = await prisma.certificate.findUnique({ where: { id: certificateId } });
  if (!cert) return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });

  if (session.role !== 'SUPER_ADMIN' && cert.companyId !== session.companyId) {
    return forbiddenResponse();
  }

  const updated = await prisma.certificate.update({
    where: { id: certificateId },
    data: { status },
  });

  await logAudit({
    session,
    action: status === 'REVOKED' ? 'REVOKE_CERTIFICATE' : 'UPDATE_CERTIFICATE_STATUS',
    entity: 'CERTIFICATE',
    entityId: certificateId,
    details: { newStatus: status, certNumber: cert.certNumber },
    req,
  });

  return NextResponse.json({ certificate: updated });
}
