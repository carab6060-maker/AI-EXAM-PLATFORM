import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

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
    return NextResponse.json({ companies });
  }

  // Regular admin only gets their company
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

  return NextResponse.json({ companies: company ? [company] : [] });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== 'SUPER_ADMIN') {
    return forbiddenResponse('Only Super Admins can create new companies directly.');
  }

  const data = await req.json();
  const company = await prisma.company.create({
    data: {
      name: data.name,
      code: data.code.toUpperCase().trim(),
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      industry: data.industry,
      status: data.status || 'ACTIVE',
      plan: data.plan || 'ENTERPRISE',
      logo: data.logo,
    },
  });

  await logAudit({
    session,
    action: 'CREATE_COMPANY',
    entity: 'COMPANY',
    entityId: company.id,
    details: { name: company.name, code: company.code },
    req,
  });

  return NextResponse.json({ company }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const data = await req.json();
  const companyId = data.id || session.companyId;

  if (session.role !== 'SUPER_ADMIN' && session.companyId !== companyId) {
    return forbiddenResponse();
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      website: data.website,
      industry: data.industry,
      status: session.role === 'SUPER_ADMIN' && data.status ? data.status : undefined,
      plan: session.role === 'SUPER_ADMIN' && data.plan ? data.plan : undefined,
      logo: data.logo,
    },
  });

  await logAudit({
    session,
    action: 'UPDATE_COMPANY',
    entity: 'COMPANY',
    entityId: updated.id,
    req,
  });

  return NextResponse.json({ company: updated });
}
