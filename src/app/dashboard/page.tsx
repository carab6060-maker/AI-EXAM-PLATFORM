'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building,
  FileCheck,
  Award,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
} from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardHomePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [myExams, setMyExams] = useState<any[]>([]);
  const [myResults, setMyResults] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const uJson = await userRes.json();
          setCurrentUser(uJson.user);

          if (uJson.user.role === 'SUPER_ADMIN') {
            const compRes = await fetch('/api/companies');
            if (compRes.ok) {
              const compJson = await compRes.json();
              setCompanies(compJson.companies || []);
            }
            const repRes = await fetch('/api/reports');
            if (repRes.ok) {
              setReportData(await repRes.json());
            }
          } else if (['COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'].includes(uJson.user.role)) {
            const repRes = await fetch('/api/reports');
            if (repRes.ok) {
              setReportData(await repRes.json());
            }
          } else {
            // Employee View
            const examRes = await fetch('/api/exams');
            if (examRes.ok) {
              const examJson = await examRes.json();
              setMyExams(examJson.exams || []);
            }
            const resRes = await fetch('/api/results');
            if (resRes.ok) {
              const resJson = await resRes.json();
              setMyResults(resJson.results || []);
            }
          }
        }
      } catch (e) {
        console.error('Dashboard data load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <p className="text-sm font-semibold">Loading dashboard metrics...</p>
      </div>
    );
  }

  // 1. SUPER ADMIN VIEW
  if (currentUser?.role === 'SUPER_ADMIN') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Super Admin Platform Overview</h1>
            <p className="text-xs text-slate-500 mt-1">Multi-tenant SaaS metrics, system activity, and registered enterprise organizations.</p>
          </div>
          <Link
            href="/dashboard/companies"
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" /> Manage Tenants
          </Link>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Organizations"
            value={companies.length}
            subtitle={`${companies.filter((c) => c.status === 'ACTIVE').length} Active Tenants`}
            icon={Building}
            iconBgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="Total Assessments"
            value={reportData?.metrics?.totalAttempts || 0}
            subtitle="Across all companies"
            icon={FileCheck}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Avg Platform Pass Rate"
            value={`${reportData?.metrics?.passRate || 0}%`}
            subtitle="Qualification benchmark"
            icon={TrendingUp}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatsCard
            title="Certificates Issued"
            value={reportData?.metrics?.totalCertificates || 0}
            subtitle="Public verifiable credentials"
            icon={Award}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Registered Enterprise Tenants</h3>
            <Link href="/dashboard/companies" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Company Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Industry</th>
                  <th className="p-3">Staff Users</th>
                  <th className="p-3">Exams</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 font-mono text-slate-600">{c.code}</td>
                    <td className="p-3 text-slate-600">{c.industry || 'Enterprise'}</td>
                    <td className="p-3 text-slate-600">{c._count?.employeeProfiles || 0} staff</td>
                    <td className="p-3 text-slate-600">{c._count?.exams || 0}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        {c.plan}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 2. COMPANY ADMIN / HR VIEW
  if (['COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'EXAMINER'].includes(currentUser?.role)) {
    const metrics = reportData?.metrics || {};
    const subjectStats = reportData?.subjectStats || [];
    const monthlyTrends = reportData?.monthlyTrends || [];

    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Assessment Center</h1>
            <p className="text-xs text-slate-500 mt-1">
              Performance telemetry, active competency exams, and qualification metrics for {currentUser?.company?.name || 'your company'}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/exams/create"
              className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Create New Exam
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Employees"
            value={metrics.totalEmployees || 0}
            subtitle="Active organization staff"
            icon={Users}
            iconBgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Exams Configured"
            value={metrics.totalExams || 0}
            subtitle="Active subject assessments"
            icon={FileCheck}
            iconBgColor="bg-slate-100"
            iconColor="text-slate-700"
          />
          <StatsCard
            title="Average Pass Rate"
            value={`${metrics.passRate || 0}%`}
            subtitle={`${metrics.passedResults || 0} of ${metrics.totalResults || 0} passed`}
            icon={TrendingUp}
            iconBgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatsCard
            title="Certificates Issued"
            value={metrics.totalCertificates || 0}
            subtitle="Valid verifiable credentials"
            icon={Award}
            iconBgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assessment Activity Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Assessment Volume & Score Progression</h3>
                <p className="text-xs text-slate-500">Historical performance across all employee evaluations</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score %" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Competency Bar */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Score by Subject Domain</h3>
            <p className="text-xs text-slate-500">Average competency benchmark</p>

            <div className="space-y-4 pt-2">
              {subjectStats.length === 0 ? (
                <p className="text-xs text-slate-400">No subject evaluation data yet.</p>
              ) : (
                subjectStats.map((subj: any) => (
                  <div key={subj.subjectId} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 truncate max-w-[170px]">{subj.name}</span>
                      <span className="text-blue-600 font-bold">{subj.averageScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, subj.averageScore)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. EMPLOYEE / STAFF VIEW
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome, {currentUser?.name}</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your assigned workplace assessments, scheduled certification exams, and skill milestones.
          </p>
        </div>

        <Link
          href="/dashboard/training"
          className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center gap-1.5 self-start"
        >
          <Sparkles className="w-4 h-4 text-blue-600" /> View AI Training Roadmap
        </Link>
      </div>

      {/* Employee Assigned Exams */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" /> Available & Scheduled Examinations
        </h3>

        {myExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            No exams currently assigned to your account.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myExams.map((exam) => {
              const attempt = exam.attempts?.[0];
              const isCompleted = attempt?.status === 'SUBMITTED';

              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                        {exam.examType}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{exam.title}</h4>
                      <p className="text-xs text-slate-500">{exam.subject?.name}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {exam.durationMinutes} Mins
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{exam.description || exam.instructions}</p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Pass mark: {exam.passScorePercent}%</span>

                    {isCompleted ? (
                      <Link
                        href={`/dashboard/results`}
                        className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1.5 border border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> View Results ({attempt.percentage.toFixed(1)}%)
                      </Link>
                    ) : (
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/exam-session/start', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ examId: exam.id }),
                          });
                          const json = await res.json();
                          if (res.ok) {
                            window.location.href = `/dashboard/exam-room/${json.attemptId}`;
                          } else {
                            alert(json.error || 'Failed to start exam');
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Start Examination
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Results Summary */}
      {myResults.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Recent Assessment History & Certificates
          </h3>

          <div className="divide-y divide-slate-100">
            {myResults.map((r) => (
              <div key={r.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{r.exam?.title}</p>
                  <p className="text-xs text-slate-500">
                    Score: {r.percentage.toFixed(1)}% • {r.isPassed ? 'Passed' : 'Needs Improvement'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {r.certificate && (
                    <Link
                      href="/dashboard/certificates"
                      className="px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-600" /> View Certificate
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/results/${r.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
