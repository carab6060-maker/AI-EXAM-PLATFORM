import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return unauthorizedResponse();
  }

  try {
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
      return NextResponse.json({ error: 'User record not found in database' }, { status: 404 });
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
  } catch (err: any) {
    console.error('Error in /api/auth/me:', err);
    return NextResponse.json({ error: 'Failed to retrieve user profile from database' }, { status: 500 });
  }
}
