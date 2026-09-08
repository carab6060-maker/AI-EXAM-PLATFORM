import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      company: true,
      employeeProfile: {
        include: {
          department: true,
          team: true,
          position: true,
        },
      },
    },
  });

  if (!user) {
    return unauthorizedResponse('User record not found');
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      company: user.company,
      profile: user.employeeProfile,
    },
  });
}
