import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_ai_exam_jwt_secret_key_2026_super_secure_string_9981';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'HR_MANAGER'
  | 'TRAINING_MANAGER'
  | 'EXAMINER'
  | 'DEPARTMENT_MANAGER'
  | 'AUDITOR'
  | 'EMPLOYEE';

export interface AuthSession {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null;
  companyName?: string;
  companyCode?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: AuthSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthSession;
  } catch (error) {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<AuthSession | null> {
  // Try reading auth token from Authorization Header or Cookie
  const authHeader = req.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    token = req.cookies.get('auth_token')?.value;
  }

  if (!token) return null;

  const session = verifyToken(token);
  if (!session) return null;

  try {
    // Verify user is still active in DB if DB is accessible
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { company: true },
    });

    if (user) {
      if (user.status !== 'ACTIVE') return null;
      if (user.company && user.company.status !== 'ACTIVE' && user.role !== 'SUPER_ADMIN') {
        return null;
      }
    }
  } catch (dbErr) {
    // Prisma offline / Vercel SQLite fallback - trust valid JWT session
    console.warn('DB verify skipped in getSessionFromRequest, using JWT session');
  }

  return {
    userId: session.userId,
    email: session.email,
    name: session.name,
    role: session.role as UserRole,
    companyId: session.companyId,
    companyName: session.companyName,
    companyCode: session.companyCode,
  };
}

export function hasPermission(role: UserRole, requiredRoles: UserRole[]): boolean {
  if (role === 'SUPER_ADMIN') return true;
  return requiredRoles.includes(role);
}

export function unauthorizedResponse(message = 'Unauthorized or insufficient permissions') {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
