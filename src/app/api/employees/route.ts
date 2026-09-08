import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission, hashPassword } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get('departmentId');
  const search = searchParams.get('search')?.toLowerCase();

  const where: any = tenantScopedWhere(session);
  if (departmentId) {
    where.departmentId = departmentId;
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

  let filtered = employees;
  if (search) {
    filtered = employees.filter(
      (e) =>
        e.user.name.toLowerCase().includes(search) ||
        e.user.email.toLowerCase().includes(search) ||
        e.employeeId.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({ employees: filtered });
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

  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !name || !email || !employeeId) {
    return NextResponse.json({ error: 'Name, email, employee ID, and company are required' }, { status: 400 });
  }

  const cleanEmail = email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existingUser) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
  }

  const existingProfile = await prisma.employeeProfile.findFirst({
    where: { companyId, employeeId: employeeId.trim() },
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
        employeeId: employeeId.trim(),
        departmentId: departmentId || null,
        positionId: positionId || null,
        teamId: teamId || null,
        phone: phone || null,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        skillsJson: Array.isArray(skills) ? JSON.stringify(skills) : null,
      },
      include: {
        user: true,
        department: true,
        position: true,
      },
    });

    return profile;
  });

  await logAudit({
    session,
    action: 'CREATE_EMPLOYEE',
    entity: 'EMPLOYEE',
    entityId: result.id,
    details: { name, email: cleanEmail, employeeId },
    req,
  });

  return NextResponse.json({ employee: result }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { id, name, status, role, departmentId, positionId, phone, skills, resetPassword } = await req.json();

  const profile = await prisma.employeeProfile.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!profile) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  if (session.role !== 'SUPER_ADMIN' && profile.companyId !== session.companyId) {
    return forbiddenResponse();
  }

  let newPasswordHash: string | undefined;
  if (resetPassword && resetPassword.trim() !== '') {
    newPasswordHash = await hashPassword(resetPassword.trim());
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: profile.userId },
      data: {
        name: name ? name.trim() : undefined,
        status: status || undefined,
        role: role || undefined,
        passwordHash: newPasswordHash || undefined,
      },
    });

    await tx.employeeProfile.update({
      where: { id },
      data: {
        departmentId: departmentId !== undefined ? departmentId : undefined,
        positionId: positionId !== undefined ? positionId : undefined,
        phone: phone !== undefined ? phone : undefined,
        skillsJson: Array.isArray(skills) ? JSON.stringify(skills) : undefined,
      },
    });
  });

  await logAudit({
    session,
    action: 'UPDATE_EMPLOYEE',
    entity: 'EMPLOYEE',
    entityId: id,
    req,
  });

  return NextResponse.json({ success: true });
}
