import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

import { getCompanyCache, setCompanyCache, invalidateCompanyCache } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const cacheKey = `${session.role}_${session.companyId || 'all'}`;
  const cached = getCompanyCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    if (session.role === 'SUPER_ADMIN') {
      const companies = await prisma.company.findMany({
        include: {
          _count: {
            select: {
              users: true,
              employeeProfiles: true,
              exams: true,
              certificates: true,
              departments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      const resPayload = { companies: companies || [] };
      setCompanyCache(cacheKey, resPayload);
      return NextResponse.json(resPayload);
    } else {
      if (!session.companyId) return forbiddenResponse();
      const company = await prisma.company.findUnique({
        where: { id: session.companyId },
        include: {
          departments: true,
          _count: {
            select: {
              employeeProfiles: true,
              exams: true,
              certificates: true,
            },
          },
        },
      });
      const resPayload = { companies: company ? [company] : [] };
      setCompanyCache(cacheKey, resPayload);
      return NextResponse.json(resPayload);
    }
  } catch (err: any) {
    console.error('Database companies query error:', err);
    if (cached) return NextResponse.json(cached);
    return NextResponse.json({ error: 'Failed to retrieve companies from database', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return forbiddenResponse('Only Super Admins can create new companies directly.');
  }

  const data = await req.json();

  if (!data.name || !data.code) {
    return NextResponse.json({ error: 'Company name and unique code are required' }, { status: 400 });
  }

  try {
    const cleanCode = data.code.toUpperCase().trim();
    const existing = await prisma.company.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return NextResponse.json({ error: 'Company code already registered' }, { status: 409 });
    }

    const company = await prisma.company.create({
      data: {
        name: data.name.trim(),
        code: cleanCode,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        website: data.website || null,
        industry: data.industry || 'Enterprise',
        status: data.status || 'ACTIVE',
        plan: data.plan || 'ENTERPRISE',
        logo: data.logo || null,
      },
    });

    try {
      await logAudit({
        session,
        action: 'CREATE_COMPANY',
        entity: 'COMPANY',
        entityId: company.id,
        details: { name: company.name, code: company.code },
        req,
      });
    } catch (e) {}

    invalidateCompanyCache();
    return NextResponse.json({ success: true, company }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating company in database:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create company in database' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const data = await req.json();
  const companyId = data.id || session.companyId;

  if (session.role !== 'SUPER_ADMIN' && session.companyId !== companyId) {
    return forbiddenResponse();
  }

  try {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: data.name ? data.name.trim() : undefined,
        email: data.email !== undefined ? data.email : undefined,
        phone: data.phone !== undefined ? data.phone : undefined,
        address: data.address !== undefined ? data.address : undefined,
        website: data.website !== undefined ? data.website : undefined,
        industry: data.industry !== undefined ? data.industry : undefined,
        status: session.role === 'SUPER_ADMIN' && data.status ? data.status : undefined,
        plan: session.role === 'SUPER_ADMIN' && data.plan ? data.plan : undefined,
        logo: data.logo !== undefined ? data.logo : undefined,
      },
    });

    invalidateCompanyCache();
    return NextResponse.json({ success: true, company: updated });
  } catch (err: any) {
    console.error('Error updating company in database:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update company in database' }, { status: 500 });
  }
}
