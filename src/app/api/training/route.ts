import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse, tenantScopedWhere } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const where: any = tenantScopedWhere(session);
  if (session.role === 'EMPLOYEE') {
    where.userId = session.userId;
  }

  const recommendations = await prisma.trainingRecommendation.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          employeeProfile: {
            include: { department: true, position: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ recommendations });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { recommendationId, status } = await req.json();
  if (!recommendationId || !status) {
    return NextResponse.json({ error: 'Recommendation ID and status are required' }, { status: 400 });
  }

  const rec = await prisma.trainingRecommendation.findUnique({
    where: { id: recommendationId },
  });

  if (!rec) return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
  if (session.role === 'EMPLOYEE' && rec.userId !== session.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const updated = await prisma.trainingRecommendation.update({
    where: { id: recommendationId },
    data: { status },
  });

  return NextResponse.json({ recommendation: updated });
}
