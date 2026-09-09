import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

    return NextResponse.json({ notifications: notifications || [], unreadCount });
  } catch (err: any) {
    // Graceful response if DB is temporarily connecting
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  try {
    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true },
      });
    } else if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update notification', details: err?.message }, { status: 500 });
  }
}
