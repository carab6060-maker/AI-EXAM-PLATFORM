import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { forbiddenResponse } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER'])) {
    return forbiddenResponse();
  }

  const { examId, targetType, employeeProfileIds, departmentIds, positionIds, dueDate } = await req.json();

  if (!examId || !targetType) {
    return NextResponse.json({ error: 'Exam ID and Target Type are required' }, { status: 400 });
  }

  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

  const companyId = exam.companyId;
  const parsedDueDate = dueDate ? new Date(dueDate) : null;
  const createdAssignments = [];

  if (targetType === 'ALL_COMPANY') {
    const assign = await prisma.examAssignment.create({
      data: {
        companyId,
        examId,
        targetType: 'ALL_COMPANY',
        dueDate: parsedDueDate,
        status: 'ASSIGNED',
      },
    });
    createdAssignments.push(assign);

    // Create notifications for all active employees
    const users = await prisma.user.findMany({
      where: { companyId, status: 'ACTIVE' },
      select: { id: true },
    });

    for (const u of users) {
      await prisma.notification.create({
        data: {
          userId: u.id,
          companyId,
          title: `New Exam Assigned: ${exam.title}`,
          message: `You have been assigned to take "${exam.title}". Pass mark: ${exam.passScorePercent}%.`,
          type: 'EXAM_ASSIGNED',
          linkUrl: '/dashboard/exams',
        },
      });
    }
  } else if (targetType === 'DEPARTMENT' && Array.isArray(departmentIds)) {
    for (const deptId of departmentIds) {
      const assign = await prisma.examAssignment.create({
        data: {
          companyId,
          examId,
          targetType: 'DEPARTMENT',
          departmentId: deptId,
          dueDate: parsedDueDate,
          status: 'ASSIGNED',
        },
      });
      createdAssignments.push(assign);

      // Notify department staff
      const profiles = await prisma.employeeProfile.findMany({
        where: { departmentId: deptId },
        select: { userId: true },
      });
      for (const p of profiles) {
        await prisma.notification.create({
          data: {
            userId: p.userId,
            companyId,
            title: `Department Exam Assigned: ${exam.title}`,
            message: `Your department has been enrolled in "${exam.title}".`,
            type: 'EXAM_ASSIGNED',
            linkUrl: '/dashboard/exams',
          },
        });
      }
    }
  } else if (targetType === 'INDIVIDUAL' && Array.isArray(employeeProfileIds)) {
    for (const profId of employeeProfileIds) {
      const assign = await prisma.examAssignment.create({
        data: {
          companyId,
          examId,
          targetType: 'INDIVIDUAL',
          employeeProfileId: profId,
          dueDate: parsedDueDate,
          status: 'ASSIGNED',
        },
      });
      createdAssignments.push(assign);

      const profile = await prisma.employeeProfile.findUnique({
        where: { id: profId },
        select: { userId: true },
      });
      if (profile) {
        await prisma.notification.create({
          data: {
            userId: profile.userId,
            companyId,
            title: `Exam Assigned: ${exam.title}`,
            message: `You have been individually assigned to complete "${exam.title}".`,
            type: 'EXAM_ASSIGNED',
            linkUrl: '/dashboard/exams',
          },
        });
      }
    }
  }

  await logAudit({
    session,
    action: 'ASSIGN_EXAM',
    entity: 'EXAM',
    entityId: examId,
    details: { targetType, count: createdAssignments.length },
    req,
  });

  return NextResponse.json({ success: true, count: createdAssignments.length });
}
