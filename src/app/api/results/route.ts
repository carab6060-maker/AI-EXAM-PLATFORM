import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse, tenantScopedWhere } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const examId = searchParams.get('examId');
  const departmentId = searchParams.get('departmentId');
  const employeeId = searchParams.get('employeeId');

  const where: any = tenantScopedWhere(session);
  if (examId) where.examId = examId;

  if (session.role === 'EMPLOYEE') {
    where.userId = session.userId;
  } else if (employeeId) {
    where.userId = employeeId;
  }

  const results = await prisma.result.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          employeeProfile: {
            include: { department: true, position: true },
          },
        },
      },
      exam: {
        include: { subject: true },
      },
      certificate: true,
      aiAnalysis: true,
    },
    orderBy: { gradedAt: 'desc' },
  });

  return NextResponse.json({ results });
}
