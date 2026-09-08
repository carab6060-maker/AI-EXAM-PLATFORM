import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, AuthSession } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { companyName, companyCode, industry, adminName, adminEmail, password, phone, website } = await req.json();

    if (!companyName || !companyCode || !adminName || !adminEmail || !password) {
      return NextResponse.json({ error: 'Please provide all required registration fields' }, { status: 400 });
    }

    const cleanCode = companyCode.toUpperCase().trim().replace(/[^A-Z0-9]/g, '');
    const cleanEmail = adminEmail.toLowerCase().trim();

    // Check existing company code or admin email
    const existingCompany = await prisma.company.findUnique({ where: { code: cleanCode } });
    if (existingCompany) {
      return NextResponse.json({ error: 'Company code already in use. Please choose another code.' }, { status: 409 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email address already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Create Company, Admin, and Initial Department in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newCompany = await tx.company.create({
        data: {
          name: companyName.trim(),
          code: cleanCode,
          industry: industry || 'General Enterprise',
          phone: phone || null,
          website: website || null,
          status: 'ACTIVE',
          plan: 'PRO',
        },
      });

      const newAdmin = await tx.user.create({
        data: {
          companyId: newCompany.id,
          name: adminName.trim(),
          email: cleanEmail,
          passwordHash,
          role: 'COMPANY_ADMIN',
          status: 'ACTIVE',
        },
      });

      const initialDept = await tx.department.create({
        data: {
          companyId: newCompany.id,
          name: 'General Administration',
          code: 'ADMIN',
          description: 'Default organization department',
        },
      });

      return { newCompany, newAdmin, initialDept };
    });

    const sessionPayload: AuthSession = {
      userId: result.newAdmin.id,
      email: result.newAdmin.email,
      name: result.newAdmin.name,
      role: 'COMPANY_ADMIN',
      companyId: result.newCompany.id,
      companyName: result.newCompany.name,
      companyCode: result.newCompany.code,
    };

    const token = signToken(sessionPayload);

    await logAudit({
      session: sessionPayload,
      action: 'REGISTER_COMPANY',
      entity: 'COMPANY',
      entityId: result.newCompany.id,
      details: { companyName, companyCode: cleanCode },
      req,
    });

    const response = NextResponse.json({
      success: true,
      token,
      company: result.newCompany,
      user: {
        id: result.newAdmin.id,
        name: result.newAdmin.name,
        email: result.newAdmin.email,
        role: result.newAdmin.role,
      },
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Company registration error:', error);
    return NextResponse.json({ error: error.message || 'Error creating company' }, { status: 500 });
  }
}
