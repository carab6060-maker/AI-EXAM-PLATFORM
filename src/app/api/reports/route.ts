import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'AUDITOR', 'EMPLOYEE'])) {
    return forbiddenResponse();
  }

  try {
    const where = tenantScopedWhere(session);

    const [
      totalEmployees,
      totalExams,
      totalAttempts,
      totalResults,
      passedResults,
      totalCertificates,
      subjects,
      departments,
      recentResults,
    ] = await Promise.all([
      prisma.employeeProfile.count({ where }),
      prisma.exam.count({ where }),
      prisma.examAttempt.count({ where }),
      prisma.result.count({ where }),
      prisma.result.count({ where: { ...where, isPassed: true } }),
      prisma.certificate.count({ where: { ...where, status: 'VALID' } }),
      prisma.subject.findMany({
        where,
        include: {
          exams: {
            include: {
              results: true,
            },
          },
          _count: { select: { questions: true, exams: true } },
        },
      }),
      prisma.department.findMany({
        where,
        include: {
          employeeProfiles: true,
        },
      }),
      prisma.result.findMany({
        where,
        take: 10,
        orderBy: { gradedAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          exam: { select: { title: true } },
        },
      }),
    ]);

    const countResults = totalResults || 0;
    const countPassed = passedResults || 0;
    const passRate = countResults > 0 ? parseFloat(((countPassed / countResults) * 100).toFixed(1)) : 0;
    const failureRate = countResults > 0 ? parseFloat((100 - passRate).toFixed(1)) : 0;

    // Calculate real dynamic stats per subject
    const subjectStats = subjects.map((s) => {
      const allSubjectResults = s.exams.flatMap((e) => e.results);
      const taken = allSubjectResults.length;
      const passed = allSubjectResults.filter((r) => r.isPassed).length;
      const avgScore = taken > 0 ? parseFloat((allSubjectResults.reduce((acc, r) => acc + r.percentage, 0) / taken).toFixed(1)) : 0;
      const subjectPassRate = taken > 0 ? parseFloat(((passed / taken) * 100).toFixed(1)) : 0;

      return {
        subjectId: s.id,
        name: s.name,
        code: s.code,
        category: s.category || 'General',
        assessmentsTaken: taken,
        averageScore: avgScore,
        passRate: subjectPassRate,
      };
    });

    // Calculate real dynamic stats per department
    const departmentStats = departments.map((d) => ({
      departmentId: d.id,
      name: d.name,
      code: d.code,
      employeeCount: d.employeeProfiles.length,
      assessmentsTaken: 0,
      averageScore: 0,
      passRate: 0,
    }));

    return NextResponse.json({
      summary: {
        totalEmployees: totalEmployees || 0,
        totalExams: totalExams || 0,
        totalAttempts: totalAttempts || 0,
        totalResults: countResults,
        passedResults: countPassed,
        passRate,
        failureRate,
        totalCertificates: totalCertificates || 0,
        activeEmployees: totalEmployees || 0,
      },
      subjectStats,
      departmentStats,
      recentResults: recentResults.map((r) => ({
        id: r.id,
        candidateName: r.user.name,
        candidateEmail: r.user.email,
        examTitle: r.exam.title,
        score: r.totalScore,
        maxScore: r.maxScore,
        percentage: r.percentage,
        isPassed: r.isPassed,
        gradedAt: r.gradedAt,
      })),
    });
  } catch (err: any) {
    console.error('Error generating reports:', err);
    return NextResponse.json({ error: 'Failed to generate analytics report', details: err?.message }, { status: 500 });
  }
}
