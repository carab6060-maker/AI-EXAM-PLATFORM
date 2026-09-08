import { prisma } from './prisma';
import { AuthSession } from './auth';
import { NextRequest } from 'next/server';

interface LogAuditParams {
  session?: AuthSession | null;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  req?: NextRequest;
}

export async function logAudit({
  session,
  action,
  entity,
  entityId,
  details,
  req,
}: LogAuditParams): Promise<void> {
  try {
    const ipAddress =
      req?.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req?.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = req?.headers.get('user-agent') || 'Server';

    await prisma.auditLog.create({
      data: {
        companyId: session?.companyId || null,
        userId: session?.userId || null,
        userEmail: session?.email || 'SYSTEM',
        action,
        entity,
        entityId: entityId || null,
        detailsJson: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}
