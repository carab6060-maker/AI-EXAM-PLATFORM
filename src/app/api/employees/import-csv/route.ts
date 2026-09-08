import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission, hashPassword } from '@/lib/auth';
import { forbiddenResponse, unauthorizedResponse } from '@/lib/tenant';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER'])) {
    return forbiddenResponse();
  }

  const { employees, companyId: targetCompanyId } = await req.json();
  const companyId = session.role === 'SUPER_ADMIN' ? (targetCompanyId || session.companyId) : session.companyId;

  if (!companyId || !Array.isArray(employees) || employees.length === 0) {
    return NextResponse.json({ error: 'Valid employees array and target company required' }, { status: 400 });
  }

  const defaultPasswordHash = await hashPassword('Employee123!');
  const summary = {
    total: employees.length,
    successCount: 0,
    errors: [] as string[],
  };

  for (let i = 0; i < employees.length; i++) {
    const row = employees[i];
    const { name, email, employeeId, departmentCode, positionName, phone } = row;

    if (!name || !email || !employeeId) {
      summary.errors.push(`Row ${i + 1}: Missing name, email, or employee ID`);
      continue;
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanEmpId = employeeId.trim();

    try {
      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        summary.errors.push(`Row ${i + 1} (${cleanEmail}): User already exists`);
        continue;
      }

      const existingProfile = await prisma.employeeProfile.findFirst({
        where: { companyId, employeeId: cleanEmpId },
      });
      if (existingProfile) {
        summary.errors.push(`Row ${i + 1} (${cleanEmpId}): Employee ID duplicate`);
        continue;
      }

      let departmentId: string | null = null;
      if (departmentCode) {
        const dept = await prisma.department.findFirst({
          where: { companyId, code: departmentCode.toUpperCase().trim() },
        });
        if (dept) departmentId = dept.id;
      }

      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            companyId,
            name: name.trim(),
            email: cleanEmail,
            passwordHash: defaultPasswordHash,
            role: 'EMPLOYEE',
            status: 'ACTIVE',
          },
        });

        await tx.employeeProfile.create({
          data: {
            userId: user.id,
            companyId,
            employeeId: cleanEmpId,
            departmentId,
            phone: phone || null,
          },
        });
      });

      summary.successCount++;
    } catch (err: any) {
      summary.errors.push(`Row ${i + 1}: ${err.message}`);
    }
  }

  await logAudit({
    session,
    action: 'IMPORT_EMPLOYEES_CSV',
    entity: 'EMPLOYEE',
    details: summary,
    req,
  });

  return NextResponse.json({ success: true, summary });
}
