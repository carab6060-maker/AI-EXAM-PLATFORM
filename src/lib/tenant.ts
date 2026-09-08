import { AuthSession } from './auth';
import { NextResponse } from 'next/server';

export function enforceTenantIsolation(session: AuthSession, targetCompanyId?: string | null): boolean {
  // Super Admin can access everything
  if (session.role === 'SUPER_ADMIN') {
    return true;
  }

  // Regular tenant users must have a valid companyId and cannot access other tenants
  if (!session.companyId) {
    return false;
  }

  if (targetCompanyId && targetCompanyId !== session.companyId) {
    return false;
  }

  return true;
}

export function tenantScopedWhere(session: AuthSession, additionalWhere: Record<string, any> = {}): Record<string, any> {
  if (session.role === 'SUPER_ADMIN') {
    return { ...additionalWhere };
  }
  return {
    ...additionalWhere,
    companyId: session.companyId,
  };
}

export function unauthorizedResponse(message = 'Unauthorized or insufficient permissions') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbiddenResponse(message = 'Access forbidden: cross-tenant or privilege violation') {
  return NextResponse.json({ error: message }, { status: 403 });
}
