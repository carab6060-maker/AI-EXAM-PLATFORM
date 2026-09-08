import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const currentEnvUrl = process.env.DATABASE_URL;
  if (currentEnvUrl && currentEnvUrl.trim() !== '') {
    return currentEnvUrl;
  }

  // Fallback paths for SQLite on serverless / Vercel
  const possiblePaths = [
    path.join(process.cwd(), 'prisma', 'dev.db'),
    path.join(process.cwd(), 'dev.db'),
    '/tmp/dev.db',
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return `file:${p}`;
    }
  }

  return 'file:./dev.db';
}

const resolvedUrl = getDatabaseUrl();
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  process.env.DATABASE_URL = resolvedUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
