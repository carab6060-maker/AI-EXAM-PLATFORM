import { NextRequest, NextResponse } from 'next/server';
import { runDatabaseSeed } from '@/lib/seed-runner';

export async function GET(req: NextRequest) {
  try {
    const result = await runDatabaseSeed();
    return NextResponse.json({
      success: true,
      message: '✅ Database successfully seeded with Somali companies, admins, and sample data!',
      details: result,
      loginCredentials: {
        companyAdmin: {
          email: 'admin@dahabshiil.so',
          password: 'Password123!',
        },
        staffEmployee: {
          email: 'ahmed.k@dahabshiil.so',
          password: 'Password123!',
        },
        superAdmin: {
          email: 'superadmin@platform.com',
          password: 'SuperAdmin123!',
        },
      },
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
