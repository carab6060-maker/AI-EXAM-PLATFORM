import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission, hashPassword } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase().trim();
  const role = searchParams.get('role');
  const status = searchParams.get('status');
  const companyIdParam = searchParams.get('companyId');

  try {
    const where: any = tenantScopedWhere(session);
    if (session.role === 'SUPER_ADMIN' && companyIdParam) {
      where.companyId = companyIdParam;
    }

    if (role && role !== 'ALL') {
      where.user = { ...(where.user || {}), role };
    }

    if (status && status !== 'ALL') {
      where.user = { ...(where.user || {}), status };
    }

    const employees = await prisma.employeeProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            status: true,
            avatar: true,
            createdAt: true,
          },
        },
        department: true,
        team: true,
        position: true,
        _count: {
          select: {
            examAssignments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let filtered = employees || [];
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.user.name.toLowerCase().includes(search) ||
          e.user.email.toLowerCase().includes(search) ||
          e.employeeId.toLowerCase().includes(search) ||
          (e.phone && e.phone.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({ employees: filtered, count: filtered.length });
  } catch (err: any) {
    console.error('Error querying employees from database:', err);
    return NextResponse.json({ error: 'Failed to retrieve employees from database', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const {
    name,
    email,
    password,
    employeeId,
    role = 'EMPLOYEE',
    departmentId,
    positionId,
    teamId,
    phone,
    hireDate,
    skills,
    companyId: targetCompanyId,
  } = await req.json();

  let companyId =
    session.role === 'SUPER_ADMIN'
      ? (targetCompanyId || session.companyId)
      : session.companyId;

  if (!companyId) {
    // If super admin didn't pass companyId, find the first active company
    const firstComp = await prisma.company.findFirst({ where: { status: 'ACTIVE' } });
    if (firstComp) companyId = firstComp.id;
  }

  if (!companyId) {
    return NextResponse.json({ error: 'Company association is required' }, { status: 400 });
  }

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Employee full name is required' }, { status: 400 });
  }

  if (!email || !email.trim()) {
    return NextResponse.json({ error: 'Corporate email address is required' }, { status: 400 });
  }

  if (!employeeId || !employeeId.trim()) {
    return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanEmpId = employeeId.trim();

  try {
    // Check if email already registered
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email address already exists' }, { status: 409 });
    }

    // Check if employee ID already registered in this company
    const existingProfile = await prisma.employeeProfile.findFirst({
      where: { companyId, employeeId: cleanEmpId },
    });
    if (existingProfile) {
      return NextResponse.json({ error: 'Employee ID already registered in this organization' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password || 'Employee123!');

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          companyId,
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          role,
          status: 'ACTIVE',
        },
      });

      const profile = await tx.employeeProfile.create({
        data: {
          userId: user.id,
          companyId,
          employeeId: cleanEmpId,
          departmentId: departmentId || null,
          positionId: positionId || null,
          teamId: teamId || null,
          phone: phone || null,
          hireDate: hireDate ? new Date(hireDate) : new Date(),
          skillsJson: Array.isArray(skills) ? JSON.stringify(skills) : null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              status: true,
              avatar: true,
              createdAt: true,
            },
          },
          department: true,
          position: true,
        },
      });

      return profile;
    });

    try {
      await logAudit({
        session,
        action: 'CREATE_EMPLOYEE',
        entity: 'EMPLOYEE',
        entityId: result.id,
        details: { name, email: cleanEmail, employeeId: cleanEmpId },
        req,
      });
    } catch (e) {}

    return NextResponse.json({ success: true, employee: result }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating employee in database:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create employee in database' }, { status: 500 });
  }
}
