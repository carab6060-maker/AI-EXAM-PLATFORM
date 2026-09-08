'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Search,
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ResultsListPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPassed, setFilterPassed] = useState('ALL');

  useEffect(() => {
    async function loadResults() {
      try {
        const res = await fetch('/api/results');
        if (res.ok) {
          const json = await res.json();
          setResults(json.results || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const filtered = results.filter((r) => {
    if (filterPassed === 'PASSED') return r.isPassed;
    if (filterPassed === 'FAILED') return !r.isPassed;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assessment Results & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Review employee score distributions, pass/fail status, and diagnostic reports.</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <select
            value={filterPassed}
            onChange={(e) => setFilterPassed(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="PASSED">Passed Only</option>
            <option value="FAILED">Needs Improvement</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading results...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No examination results recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Examination</th>
                  <th className="p-3">Score Achieved</th>
                  <th className="p-3">Outcome</th>
                  <th className="p-3">Correct / Total</th>
                  <th className="p-3">Graded Date</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div>
                        <p className="font-bold text-slate-900">{r.user.name}</p>
                        <p className="text-[11px] text-slate-500">{r.user.email}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{r.exam.title}</p>
                      <p className="text-[10px] text-blue-600">{r.exam.subject?.name}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-black text-slate-900">{r.percentage.toFixed(1)}%</span>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {r.totalScore} / {r.maxScore} pts
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          r.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {r.isPassed ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {r.isPassed ? 'PASSED' : 'DID NOT PASS'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {r.correctCount} correct • {r.wrongCount} incorrect
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(r.gradedAt)}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/dashboard/results/${r.id}`}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-xl transition inline-flex items-center gap-1 border border-blue-200"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
