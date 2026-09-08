import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const { attemptId, incidentType, details } = await req.json();

  if (!attemptId || !incidentType) {
    return NextResponse.json({ error: 'Attempt ID and incident type are required' }, { status: 400 });
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt || attempt.userId !== session.userId) {
    return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
  }

  const currentIncidents: any[] = attempt.antiCheatIncidentsJson
    ? JSON.parse(attempt.antiCheatIncidentsJson)
    : [];

  currentIncidents.push({
    type: incidentType, // TAB_SWITCH, EXIT_FULLSCREEN, COPY_PASTE_ATTEMPT, BLUR
    details: details || null,
    timestamp: new Date().toISOString(),
  });

  await prisma.examAttempt.update({
    where: { id: attemptId },
    data: {
      antiCheatIncidentsJson: JSON.stringify(currentIncidents),
    },
  });

  return NextResponse.json({ success: true, count: currentIncidents.length });
}
