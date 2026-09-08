import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse } from '@/lib/tenant';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const result = await prisma.result.findUnique({
    where: { id: params.id },
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
        include: {
          subject: true,
          company: true,
        },
      },
      attempt: {
        include: {
          answers: {
            include: {
              question: {
                include: {
                  options: true,
                  topic: true,
                },
              },
            },
          },
        },
      },
      certificate: true,
      aiAnalysis: true,
    },
  });

  if (!result) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 });
  }

  // Check tenant / user access
  if (session.role === 'EMPLOYEE' && result.userId !== session.userId) {
    return forbiddenResponse();
  }
  if (session.role !== 'SUPER_ADMIN' && result.companyId !== session.companyId) {
    return forbiddenResponse();
  }

  return NextResponse.json({ result });
}
