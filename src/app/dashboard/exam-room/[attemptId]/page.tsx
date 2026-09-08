'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock,
  ShieldAlert,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Maximize2,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { formatSeconds } from '@/lib/utils';

export default function ExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [examData, setExamData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedOptionIds: string[]; textAnswer: string; isFlagged: boolean }>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [incidentCount, setIncidentCount] = useState(0);
  const [antiCheatWarning, setAntiCheatWarning] = useState<string | null>(null);

  // Load Exam Session
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch(`/api/exam-session/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attemptId }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || 'Failed to initialize exam');
          router.push('/dashboard/exams');
          return;
        }

        setExamData(data.exam);
        setTimeRemaining(data.timeRemainingSeconds);

        // Prepopulate saved answers
        const mapped: Record<string, any> = {};
        (data.savedAnswers || []).forEach((a: any) => {
          mapped[a.questionId] = {
            selectedOptionIds: a.selectedOptionIds || [],
            textAnswer: a.textAnswer || '',
            isFlagged: !!a.isFlaggedForReview,
          };
        });
        setAnswers(mapped);
      } catch (e) {
        console.error(e);
      }
    }
    initSession();
  }, [attemptId, router]);

  // Real-time Countdown Timer
  useEffect(() => {
    if (timeRemaining === null) return;
    if (timeRemaining <= 0) {
      handleSubmitExam(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Anti-Cheating Telemetry Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logIncident('TAB_SWITCH', 'Candidate switched browser tabs or minimized window.');
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logIncident('COPY_PASTE_ATTEMPT', 'Candidate attempted to copy examination content.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('copy', handleCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('copy', handleCopy);
    };
  }, [attemptId]);

  const logIncident = async (type: string, details: string) => {
    setIncidentCount((prev) => prev + 1);
    setAntiCheatWarning(`Anti-Cheating Notice: ${details}`);
    setTimeout(() => setAntiCheatWarning(null), 6000);

    try {
      await fetch('/api/exam-session/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, incidentType: type, details }),
      });
    } catch (e) {
      // ignore
    }
  };

  const saveCurrentAnswer = async (questionId: string, selectedIds: string[], text = '', isFlagged = false) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { selectedOptionIds: selectedIds, textAnswer: text, isFlagged },
    }));

    try {
      await fetch('/api/exam-session/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId,
          questionId,
          selectedOptionIds: selectedIds,
          textAnswer: text,
          isFlaggedForReview: isFlagged,
        }),
      });
    } catch (e) {
      console.error('Autosave error:', e);
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string, isMultiSelect = false) => {
    const current = answers[questionId]?.selectedOptionIds || [];
    let updated: string[];

    if (isMultiSelect) {
      updated = current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
    } else {
      updated = [optionId];
    }

    saveCurrentAnswer(
      questionId,
      updated,
      answers[questionId]?.textAnswer || '',
      answers[questionId]?.isFlagged || false
    );
  };

  const toggleReviewFlag = (questionId: string) => {
    const current = answers[questionId] || { selectedOptionIds: [], textAnswer: '', isFlagged: false };
    saveCurrentAnswer(questionId, current.selectedOptionIds, current.textAnswer, !current.isFlagged);
  };

  const handleSubmitExam = async (isAutoTimeout = false) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/exam-session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptId, isAutoTimeout }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/dashboard/results/${data.resultId}`);
      } else {
        alert(data.error || 'Failed to submit examination');
        setIsSubmitting(false);
      }
    } catch (e: any) {
      alert(e.message || 'Error submitting exam');
      setIsSubmitting(false);
    }
  };

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  if (!examData || timeRemaining === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading Secure Exam Engine...</p>
      </div>
    );
  }

  const currentQ = examData.questions[currentQuestionIndex];
  const totalQuestions = examData.questions.length;
  const answeredCount = Object.values(answers).filter(
    (a) => (a.selectedOptionIds && a.selectedOptionIds.length > 0) || (a.textAnswer && a.textAnswer.trim().length > 0)
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Fixed Exam Banner */}
      <header className="bg-slate-900 text-white px-6 py-3 sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 shadow-md">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
            {examData.subjectName} • {examData.code}
          </span>
          <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">{examData.title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Anti Cheat Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-xl border border-slate-700 text-[11px] text-slate-300 font-semibold">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Proctor Active
            {incidentCount > 0 && (
              <span className="text-amber-400 ml-1">({incidentCount} warnings)</span>
            )}
          </div>

          {/* Countdown Clock */}
          <div
            className={`px-4 py-1.5 rounded-xl font-mono text-sm font-black flex items-center gap-2 ${
              timeRemaining < 300
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatSeconds(timeRemaining)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition shadow-md"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Anti-cheat floating alert */}
      {antiCheatWarning && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{antiCheatWarning}</span>
        </div>
      )}

      {/* Main Examination Room */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left / Center: Active Question Card */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold text-xs">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {currentQ.type}
                </span>
                <span className="text-xs font-semibold text-slate-500">Marks: {currentQ.marks}</span>
              </div>

              <button
                onClick={() => toggleReviewFlag(currentQ.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-xl border transition ${
                  answers[currentQ.id]?.isFlagged
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${answers[currentQ.id]?.isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                {answers[currentQ.id]?.isFlagged ? 'Flagged for Review' : 'Flag for Review'}
              </button>
            </div>

            {/* Question Prompt */}
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.questionText}
            </p>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currentQ.type === 'SHORT_ANSWER' || currentQ.type === 'ESSAY' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Write your response:</label>
                  <textarea
                    rows={6}
                    value={answers[currentQ.id]?.textAnswer || ''}
                    onChange={(e) => {
                      saveCurrentAnswer(
                        currentQ.id,
                        [],
                        e.target.value,
                        answers[currentQ.id]?.isFlagged || false
                      );
                    }}
                    placeholder="Type your structured explanation and analysis here..."
                    className="w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              ) : (
                currentQ.options.map((opt: any, idx: number) => {
                  const isSelected = (answers[currentQ.id]?.selectedOptionIds || []).includes(opt.id);
                  const isMulti = currentQ.type === 'MULTIPLE_SELECT';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionSelect(currentQ.id, opt.id, isMulti)}
                      className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm flex-1 leading-relaxed">{opt.optionText}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <span className="text-xs text-slate-500 font-medium">
                Autosaved to cloud database
              </span>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-1.5"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
                >
                  Review & Submit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Palette */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Question Palette</h3>
              <span className="text-xs text-indigo-600 font-bold">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Grid Palette */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {examData.questions.map((q: any, i: number) => {
                const isAnswered =
                  (answers[q.id]?.selectedOptionIds && answers[q.id]?.selectedOptionIds.length > 0) ||
                  (answers[q.id]?.textAnswer && answers[q.id]?.textAnswer.trim().length > 0);
                const isFlagged = answers[q.id]?.isFlagged;
                const isCurrent = i === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center transition relative ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-indigo-600" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">Ready to submit examination?</h3>
            <p className="text-xs text-slate-500">
              You have answered {answeredCount} of {totalQuestions} questions. Once submitted, your exam will be automatically graded and finalized.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Continue Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitExam(false)}
                className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
