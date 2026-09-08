import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, AuthSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { SOMALI_USERS, SOMALI_COMPANIES } from '@/lib/enterprise-store';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;

    // 1. Try querying Prisma Database first
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          company: true,
          employeeProfile: {
            include: {
              department: true,
              position: true,
            },
          },
        },
      });
    } catch (dbErr) {
      console.warn('Prisma lookup failed on serverless, switching to resilient fallback store:', dbErr);
    }

    // 2. If DB user not found or DB unavailable, check Resilient Somali Enterprise Store
    if (!user) {
      const fallbackUser = SOMALI_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );

      if (fallbackUser) {
        // Accept valid demo passwords
        const isDemoPassMatch =
          password === 'Password123!' ||
          password === 'SuperAdmin123!' ||
          password === 'admin123' ||
          password === '12345678';

        if (!isDemoPassMatch) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        user = {
          ...fallbackUser,
          company: fallbackUser.company || SOMALI_COMPANIES.find((c) => c.id === fallbackUser.companyId),
        };
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Account is deactivated or suspended' }, { status: 403 });
    }

    if (user.company && user.company.status !== 'ACTIVE' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Company subscription/account is currently suspended' }, { status: 403 });
    }

    // Verify DB password if hash exists
    if (user.passwordHash) {
      const isMatch = await verifyPassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }
    }

    const sessionPayload: AuthSession = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      companyId: user.companyId,
      companyName: user.company?.name,
      companyCode: user.company?.code,
    };

    const token = signToken(sessionPayload);

    try {
      await logAudit({
        session: sessionPayload,
        action: 'LOGIN',
        entity: 'USER',
        entityId: user.id,
        req,
      });
    } catch (auditErr) {
      // Non-blocking
    }

    const response = NextResponse.json({
      success: true,
      token,
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

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error details:', error);
    return NextResponse.json({ error: 'Login process error, please try again.' }, { status: 500 });
  }
}
