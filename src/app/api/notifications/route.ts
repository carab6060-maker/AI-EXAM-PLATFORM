import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth';
import { unauthorizedResponse } from '@/lib/tenant';

// Simple memory cache per user to prevent redundant DB roundtrips on rapid navigations
const notifCache = new Map<string, { data: any; expiresAt: number }>();

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return unauthorizedResponse();

  const now = Date.now();
  const cached = notifCache.get(session.userId);
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data);
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        linkUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = (notifications || []).filter((n) => !n.isRead).length;
    const responsePayload = { notifications: notifications || [], unreadCount };

    notifCache.set(session.userId, { data: responsePayload, expiresAt: now + 20_000 }); // 20s cache

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    // Graceful response if DB is temporarily connecting
    if (cached) return NextResponse.json(cached.data);
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

    notifCache.delete(session.userId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update notification', details: err?.message }, { status: 500 });
  }
}
