'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  Plus,
  Search,
  Clock,
  Award,
  Users,
  CheckCircle2,
  Play,
  Share2,
  Calendar,
  Lock,
} from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadExams() {
      try {
        const uRes = await fetch('/api/auth/me');
        if (uRes.ok) {
          const uJson = await uRes.json();
          setCurrentUser(uJson.user);
        }

        const res = await fetch('/api/exams');
        if (res.ok) {
          const json = await res.json();
          setExams(json.exams || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const isStaff = currentUser?.role === 'EMPLOYEE';

  const handleStartExam = async (examId: string) => {
    try {
      const res = await fetch('/api/exam-session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/dashboard/exam-room/${data.attemptId}`;
      } else {
        alert(data.error || 'Failed to initialize exam session');
      }
    } catch (e: any) {
      alert(e.message || 'Error starting exam');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isStaff ? 'My Assigned Examinations' : 'Exams & Assessment Builder'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStaff
              ? 'Complete your mandatory qualification exams and earn verifiable professional certificates.'
              : 'Construct, schedule, and assign workplace assessments and certification exams.'}
          </p>
        </div>

        {!isStaff && (
          <Link
            href="/dashboard/exams/create"
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" /> Build New Exam
          </Link>
        )}
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No exams available.
          </div>
        ) : (
          exams.map((exam) => {
            const attempt = exam.attempts?.[0];
            const isCompleted = attempt?.status === 'SUBMITTED';

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase">
                      {exam.examType}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-500">{exam.code}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-2">{exam.title}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{exam.subject?.name}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{exam.description || exam.instructions}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.questionCount || exam._count?.examQuestions || 0} Questions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pass: {exam.passScorePercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Anti-Cheat Enabled</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {isStaff ? (
                    isCompleted ? (
                      <Link
                        href={`/dashboard/results`}
                        className="w-full py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-200"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Completed ({attempt.percentage.toFixed(1)}%)
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleStartExam(exam.id)}
                        className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" /> Take Exam Now
                      </button>
                    )
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[11px] text-slate-500">
                        {exam._count?.attempts || 0} Submissions
                      </span>
                      <Link
                        href={`/dashboard/exams/${exam.id}/assign`}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" /> Assign Exam
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
