'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Layers,
  Award,
  Users,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          setReport(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const exportSubjectCSV = () => {
    if (!report?.subjectStats) return;
    const header = 'Subject Domain,Code,Category,Assessments Completed,Average Score %,Pass Rate %\n';
    const rows = report.subjectStats
      .map(
        (s: any) =>
          `"${s.name}","${s.code}","${s.category}",${s.assessmentsTaken},${s.averageScore}%,${s.passRate}%`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subject_competency_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading comprehensive analytics...</div>;
  }

  const metrics = report?.metrics || {};
  const subjectStats = report?.subjectStats || [];
  const monthlyTrends = report?.monthlyTrends || [];

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Assessment & Audit Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official competency indices, failure analysis, and compliance audit summaries.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={exportSubjectCSV}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Summary Report
          </button>
        </div>
      </div>

      {/* Printable Report Summary Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Executive Competency Summary</h3>
            <p className="text-xs text-slate-500">Official Organizational Assessment Data</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Report Timestamp: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Assessments</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{metrics.totalResults || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average Pass Rate</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{metrics.passRate || 0}%</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Certificates Issued</span>
            <p className="text-xl font-bold text-indigo-600 mt-0.5">{metrics.totalCertificates || 0}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Failure Index</span>
            <p className="text-xl font-bold text-rose-600 mt-0.5">{metrics.failureRate || 0}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Subject Domain Competency Score
            </h4>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectStats}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="averageScore" name="Avg Score %" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Monthly Examination Volume & Pass Rate
            </h4>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Domain Table */}
        <div className="pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Subject Competency Breakdown
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Subject Domain</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Completed Exams</th>
                  <th className="p-3">Average Score</th>
                  <th className="p-3">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectStats.map((s: any) => (
                  <tr key={s.subjectId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3 font-mono text-slate-600">{s.code}</td>
                    <td className="p-3 text-slate-600">{s.category}</td>
                    <td className="p-3 text-slate-600">{s.assessmentsTaken}</td>
                    <td className="p-3 font-bold text-indigo-600">{s.averageScore}%</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
