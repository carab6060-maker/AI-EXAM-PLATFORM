import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';
import { prisma } from '@/lib/prisma';

import { getAuthMeCache, setAuthMeCache } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return unauthorizedResponse();
  }

  const cached = getAuthMeCache(session.userId);
  if (cached) {
    return NextResponse.json({ user: cached });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        status: true,
        company: {
          select: {
            id: true,
            name: true,
            code: true,
            logo: true,
            status: true,
          },
        },
        employeeProfile: {
          select: {
            id: true,
            employeeId: true,
            departmentId: true,
            positionId: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User record not found in database' }, { status: 404 });
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      company: user.company,
      profile: user.employeeProfile,
    };

    setAuthMeCache(session.userId, userData);

    return NextResponse.json({ user: userData });
  } catch (err: any) {
    console.error('Error in /api/auth/me:', err);
    // Graceful fallback from verified session token if DB connection is busy
    const fallbackUser = {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      company: session.companyName
        ? { id: session.companyId, name: session.companyName, code: session.companyCode }
        : null,
    };
    return NextResponse.json({ user: fallbackUser });
  }
}
