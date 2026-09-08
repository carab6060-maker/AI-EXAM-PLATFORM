import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';
import { SOMALI_USERS, SOMALI_COMPANIES } from '@/lib/enterprise-store';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return unauthorizedResponse();
  }

  let user: any = null;

  try {
    user = await prisma.user.findUnique({
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
  } catch (err) {
    // Fallback if DB offline
  }

  if (!user) {
    const fallbackUser = SOMALI_USERS.find(
      (u) => u.id === session.userId || u.email.toLowerCase() === session.email.toLowerCase()
    );

    if (fallbackUser) {
      user = {
        ...fallbackUser,
        company: fallbackUser.company || SOMALI_COMPANIES.find((c) => c.id === fallbackUser.companyId),
      };
    } else {
      user = {
        id: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        company: {
          id: session.companyId || 'comp-01',
          name: session.companyName || 'Enterprise Organization',
          code: session.companyCode || 'CORP',
        },
      };
    }
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
