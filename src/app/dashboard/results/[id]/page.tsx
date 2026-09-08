'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Download,
  AlertCircle,
  Check,
} from 'lucide-react';
import { formatDate, formatSeconds } from '@/lib/utils';

export default function ResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const res = await fetch(`/api/results/${resultId}`);
        const data = await res.json();
        if (res.ok) {
          setResult(data.result);
        } else {
          alert(data.error || 'Result not found');
          router.push('/dashboard/results');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [resultId, router]);

  if (loading || !result) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading comprehensive result data...</div>;
  }

  const topicBreakdown = result.topicBreakdownJson ? JSON.parse(result.topicBreakdownJson) : {};
  const aiAnalysis = result.aiAnalysis;
  const weakTopics = aiAnalysis?.weakTopicsJson ? JSON.parse(aiAnalysis.weakTopicsJson) : [];
  const strongTopics = aiAnalysis?.strongTopicsJson ? JSON.parse(aiAnalysis.strongTopicsJson) : [];
  const roadmap = aiAnalysis?.improvementRoadmapJson ? JSON.parse(aiAnalysis.improvementRoadmapJson) : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/results"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Examination Result Report</h1>
            <p className="text-xs text-slate-500">
              Candidate: {result.user.name} • {result.exam.title}
            </p>
          </div>
        </div>

        {result.certificate && (
          <Link
            href="/dashboard/certificates"
            className="px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-2"
          >
            <Award className="w-4 h-4 text-amber-600" /> View Issued Certificate
          </Link>
        )}
      </div>

      {/* Outcome Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border flex flex-col sm:flex-row items-center justify-between gap-6 ${
          result.isPassed
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-slate-50 border-emerald-200'
            : 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-slate-50 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg ${
              result.isPassed ? 'bg-emerald-600 shadow-emerald-200' : 'bg-rose-600 shadow-rose-200'
            }`}
          >
            {result.isPassed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>
          <div>
            <span
              className={`text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                result.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {result.isPassed ? 'Official Passed Standard' : 'Did Not Meet Passing Mark'}
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{result.percentage.toFixed(1)}%</h2>
            <p className="text-xs text-slate-600">
              Earned {result.totalScore} of {result.maxScore} marks • Time Spent: {formatSeconds(result.timeSpentSeconds)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 pt-4 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Correct</span>
            <p className="text-lg font-bold text-emerald-600">{result.correctCount}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Incorrect</span>
            <p className="text-lg font-bold text-rose-600">{result.wrongCount}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Unanswered</span>
            <p className="text-lg font-bold text-slate-500">{result.unansweredCount}</p>
          </div>
        </div>
      </div>

      {/* AI Performance Diagnostics */}
      {aiAnalysis && (
        <div className="bg-[#0D182E] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-wider text-blue-300">
              AI Competency Diagnostic & Training Synthesis
            </h3>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal bg-white/5 p-4 rounded-xl border border-white/10">
            {aiAnalysis.overallSummary}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                Demonstrated Mastery Areas
              </span>
              <div className="space-y-1">
                {strongTopics.map((topic: string, i: number) => (
                  <p key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{topic}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Targeted Improvement Deficits
              </span>
              <div className="space-y-1">
                {weakTopics.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No significant deficit detected.</p>
                ) : (
                  weakTopics.map((topic: string, i: number) => (
                    <p key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{topic}</span>
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>

          {roadmap.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">
                Targeted Step-by-Step Learning Action Plan
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roadmap.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1">
                    <span className="text-[10px] font-bold text-blue-400">Step {item.step || idx + 1}</span>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="text-slate-300 text-[11px]">{item.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Question by Question Review */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900">Question Item Review & Answer Rationale</h3>

        <div className="space-y-4 divide-y divide-slate-100">
          {result.attempt?.answers?.map((ans: any, idx: number) => {
            const q = ans.question;
            const selectedIds: string[] = ans.selectedOptionIdsJson ? JSON.parse(ans.selectedOptionIdsJson) : [];

            return (
              <div key={ans.id} className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      Q{idx + 1} • {q.type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ans.isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {ans.isCorrect ? 'Correct (+ ' + ans.marksEarned + ' pts)' : 'Incorrect (0 pts)'}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-bold text-slate-900">{q.questionText}</p>

                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt: any, oIdx: number) => {
                      const isChosen = selectedIds.includes(opt.id);
                      const isRealCorrect = opt.isCorrect;

                      return (
                        <div
                          key={opt.id}
                          className={`p-3 text-xs rounded-xl border flex items-start gap-2 ${
                            isRealCorrect
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                              : isChosen
                              ? 'bg-rose-50 border-rose-300 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                              isRealCorrect
                                ? 'bg-emerald-600 text-white'
                                : isChosen
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1">{opt.optionText}</span>
                          {isRealCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          {isChosen && !isRealCorrect && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <span className="font-bold text-slate-800">Rationale:</span> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
