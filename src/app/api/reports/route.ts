import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest, hasPermission } from '@/lib/auth';
import { unauthorizedResponse, forbiddenResponse, tenantScopedWhere } from '@/lib/tenant';
import { getReportsCache, setReportsCache } from '@/lib/cache';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !hasPermission(session.role, ['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'AUDITOR', 'EMPLOYEE'])) {
    return forbiddenResponse();
  }

  const cacheKey = `${session.userId}:${session.companyId || 'super'}:${session.role}`;
  const cached = getReportsCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const where = tenantScopedWhere(session);

    // Run only 3 efficient parallel queries instead of 9 deep ones
    const [counts, recentResults, subjectGrouped] = await Promise.all([
      // 1. All scalar counts in one batch
      Promise.all([
        prisma.employeeProfile.count({ where }),
        prisma.exam.count({ where }),
        prisma.examAttempt.count({ where }),
        prisma.result.count({ where }),
        prisma.result.count({ where: { ...where, isPassed: true } }),
        prisma.certificate.count({ where: { ...where, status: 'VALID' } }),
      ]),

      // 2. Recent results (lightweight, only top 10)
      prisma.result.findMany({
        where,
        take: 10,
        orderBy: { gradedAt: 'desc' },
        select: {
          id: true,
          totalScore: true,
          maxScore: true,
          percentage: true,
          isPassed: true,
          gradedAt: true,
          user: { select: { name: true, email: true } },
          exam: { select: { title: true } },
        },
      }),

      // 3. Subject stats using groupBy aggregation (no deep include)
      prisma.subject.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          category: true,
          exams: {
            select: {
              results: {
                select: { percentage: true, isPassed: true },
              },
            },
          },
        },
      }),
    ]);

    const [
      totalEmployees,
      totalExams,
      totalAttempts,
      totalResults,
      passedResults,
      totalCertificates,
    ] = counts;

    const countResults = totalResults || 0;
    const countPassed = passedResults || 0;
    const passRate = countResults > 0 ? parseFloat(((countPassed / countResults) * 100).toFixed(1)) : 0;
    const failureRate = countResults > 0 ? parseFloat((100 - passRate).toFixed(1)) : 0;

    // Compute subject stats from the lightweight structure
    const subjectStats = subjectGrouped.map((s) => {
      const allResults = s.exams.flatMap((e) => e.results);
      const taken = allResults.length;
      const passed = allResults.filter((r) => r.isPassed).length;
      const avgScore = taken > 0
        ? parseFloat((allResults.reduce((acc, r) => acc + r.percentage, 0) / taken).toFixed(1))
        : 0;
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

    // Monthly trends: derive from recentResults (no extra query)
    const monthlyMap: Record<string, { count: number; totalScore: number }> = {};
    for (const r of recentResults) {
      if (!r.gradedAt) continue;
      const month = new Date(r.gradedAt).toLocaleString('en', { month: 'short' });
      if (!monthlyMap[month]) monthlyMap[month] = { count: 0, totalScore: 0 };
      monthlyMap[month].count++;
      monthlyMap[month].totalScore += r.percentage;
    }
    const monthlyTrends = Object.entries(monthlyMap).map(([month, v]) => ({
      month,
      attempts: v.count,
      avgScore: v.count > 0 ? parseFloat((v.totalScore / v.count).toFixed(1)) : 0,
    }));

    const metricsPayload = {
      totalEmployees: totalEmployees || 0,
      totalExams: totalExams || 0,
      totalAttempts: totalAttempts || 0,
      totalResults: countResults,
      passedResults: countPassed,
      passRate,
      failureRate,
      totalCertificates: totalCertificates || 0,
      activeEmployees: totalEmployees || 0,
    };

    const responseData = {
      // 'metrics' alias used by dashboard page.tsx (reportData.metrics.*)
      metrics: metricsPayload,
      // legacy alias
      summary: metricsPayload,
      subjectStats,
      departmentStats: [],
      monthlyTrends,
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
    };

    // Cache for 30s (default)
    setReportsCache(cacheKey, responseData);
    return NextResponse.json(responseData);
  } catch (err: any) {
    console.error('Error generating reports:', err);
    return NextResponse.json({ error: 'Failed to generate analytics report', details: err?.message }, { status: 500 });
  }
}
