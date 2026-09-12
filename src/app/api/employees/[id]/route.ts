import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission, hashPassword } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, enforceTenantIsolation } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';
import { invalidateEmployeeCache } from '@/lib/cache';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { id } = params;

  try {
    const profile = await prisma.employeeProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
        ...(session.role !== 'SUPER_ADMIN' ? { companyId: session.companyId! } : {}),
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
        team: true,
        position: true,
        examAssignments: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ employee: profile });
  } catch (err: any) {
    console.error('Error fetching employee details:', err);
    return NextResponse.json({ error: 'Failed to retrieve employee record' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { id } = params;

  try {
    // 1. Locate the employee profile first
    const existingProfile = await prisma.employeeProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
        ...(session.role !== 'SUPER_ADMIN' ? { companyId: session.companyId! } : {}),
      },
      include: { user: true },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Employee record not found or unauthorized' }, { status: 404 });
    }

    const data = await req.json();
    const {
      name,
      email,
      password,
      employeeId,
      role,
      status,
      phone,
      skills,
      departmentId,
      positionId,
    } = data;

    // 2. Validate email uniqueness if email is changed
    if (email && email.toLowerCase().trim() !== existingProfile.user.email.toLowerCase()) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (emailConflict && emailConflict.id !== existingProfile.userId) {
        return NextResponse.json({ error: 'Email is already used by another account' }, { status: 409 });
      }
    }

    // 3. Validate employeeId uniqueness if changed
    if (employeeId && employeeId.trim() !== existingProfile.employeeId) {
      const empIdConflict = await prisma.employeeProfile.findFirst({
        where: {
          companyId: existingProfile.companyId,
          employeeId: employeeId.trim(),
          NOT: { id: existingProfile.id },
        },
      });
      if (empIdConflict) {
        return NextResponse.json({ error: 'Employee ID is already assigned to another staff member' }, { status: 409 });
      }
    }

    // 4. Hash password if updated
    let passwordHash: string | undefined = undefined;
    if (password && password.trim().length > 0) {
      passwordHash = await hashPassword(password.trim());
    }

    // 5. Perform transactional database update
    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: existingProfile.userId },
        data: {
          name: name ? name.trim() : undefined,
          email: email ? email.toLowerCase().trim() : undefined,
          role: role || undefined,
          status: status || undefined,
          passwordHash: passwordHash || undefined,
        },
      });

      const updatedProfile = await tx.employeeProfile.update({
        where: { id: existingProfile.id },
        data: {
          employeeId: employeeId ? employeeId.trim() : undefined,
          phone: phone !== undefined ? phone : undefined,
          departmentId: departmentId !== undefined ? (departmentId || null) : undefined,
          positionId: positionId !== undefined ? (positionId || null) : undefined,
          skillsJson: Array.isArray(skills) ? JSON.stringify(skills) : undefined,
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
            },
          },
          department: true,
          position: true,
        },
      });

      return updatedProfile;
    });

    try {
      await logAudit({
        session,
        action: 'UPDATE_EMPLOYEE',
        entity: 'EMPLOYEE',
        entityId: updated.id,
        details: { name: updated.user.name, email: updated.user.email, employeeId: updated.employeeId },
        req,
      });
    } catch (e) {}

    invalidateEmployeeCache();
    return NextResponse.json({ success: true, employee: updated });
  } catch (err: any) {
    console.error('Error updating employee:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { id } = params;

  try {
    // 1. Locate the employee profile first
    const existingProfile = await prisma.employeeProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
        ...(session.role !== 'SUPER_ADMIN' ? { companyId: session.companyId! } : {}),
      },
      include: { user: true },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Employee not found or access denied' }, { status: 404 });
    }

    // Prevent self-deletion
    if (existingProfile.userId === session.userId) {
      return NextResponse.json({ error: 'You cannot delete your own active administrator account' }, { status: 400 });
    }

    // 2. Perform transactional deletion
    await prisma.$transaction(async (tx) => {
      // Remove assignments first if needed
      await tx.examAssignment.deleteMany({
        where: { employeeProfileId: existingProfile.id },
      });

      // Delete the employee profile
      await tx.employeeProfile.delete({
        where: { id: existingProfile.id },
      });

      // Delete user account
      await tx.user.delete({
        where: { id: existingProfile.userId },
      });
    });

    try {
      await logAudit({
        session,
        action: 'DELETE_EMPLOYEE',
        entity: 'EMPLOYEE',
        entityId: existingProfile.id,
        details: { name: existingProfile.user.name, email: existingProfile.user.email },
        req,
      });
    } catch (e) {}

    invalidateEmployeeCache();
    return NextResponse.json({ success: true, message: 'Employee permanently deleted from database' });
  } catch (err: any) {
    console.error('Error deleting employee:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete employee' }, { status: 500 });
  }
}
