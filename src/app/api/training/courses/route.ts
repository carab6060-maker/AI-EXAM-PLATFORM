import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  try {
    const where: any = tenantScopedWhere(session);
    const courses = await prisma.trainingCourse.findMany({
      where,
      include: {
        enrollments: {
          where: session.role === 'EMPLOYEE' ? { userId: session.userId } : undefined,
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ courses: courses || [] });
  } catch (err: any) {
    console.error('Error fetching training courses:', err);
    return NextResponse.json({ error: 'Failed to retrieve training courses', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER'])) {
    return forbiddenResponse();
  }

  const {
    title,
    code,
    description,
    category = 'Technical',
    difficulty = 'INTERMEDIATE',
    durationHours = 10,
    status = 'PUBLISHED',
    syllabus,
    companyId: targetCompanyId,
  } = await req.json();

  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !title || !code) {
    return NextResponse.json({ error: 'Course title, unique code, and company are required' }, { status: 400 });
  }

  const cleanCode = code.toUpperCase().trim();

  try {
    const existing = await prisma.trainingCourse.findUnique({
      where: { companyId_code: { companyId, code: cleanCode } },
    });
    if (existing) {
      return NextResponse.json({ error: 'A course with this code already exists in your company' }, { status: 409 });
    }

    const course = await prisma.trainingCourse.create({
      data: {
        companyId,
        title: title.trim(),
        code: cleanCode,
        description: description || null,
        category,
        difficulty,
        durationHours: parseFloat(durationHours.toString()) || 10,
        status,
        syllabusJson: syllabus ? JSON.stringify(syllabus) : null,
        createdById: session.userId,
      },
    });

    try {
      await logAudit({
        session,
        action: 'CREATE_TRAINING_COURSE',
        entity: 'TRAINING_COURSE',
        entityId: course.id,
        details: { title: course.title, code: course.code },
        req,
      });
    } catch (e) {}

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (err: any) {
    console.error('Error creating training course:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create training course' }, { status: 500 });
  }
}
