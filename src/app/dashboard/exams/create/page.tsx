'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileCheck,
  ArrowLeft,
  Check,
  Lock,
  Clock,
  Award,
  Sparkles,
  Layers,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export default function CreateExamPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    subjectId: '',
    description: '',
    instructions: 'Read each scenario carefully. Choose the best response. Submit before the timer expires.',
    examType: 'CERTIFICATION',
    durationMinutes: 45,
    passScorePercent: 70,
    questionSelectionMode: 'MANUAL', // MANUAL or RANDOM_POOL
    selectedQuestionIds: [] as string[],
    randomQuestionCount: 5,
    randomQuestions: true,
    randomOptions: true,
    allowRetakes: true,
    maxAttempts: 3,
    isCertEligible: true,
    fullScreenRequired: true,
    tabSwitchDetect: true,
    copyPasteRestrict: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const sRes = await fetch('/api/subjects');
        const sJson = await sRes.json();
        setSubjects(sJson.subjects || []);

        const qRes = await fetch('/api/questions');
        const qJson = await qRes.json();
        setQuestions(qJson.questions || []);

        if (sJson.subjects?.length > 0) {
          setFormData((prev) => ({
            ...prev,
            subjectId: sJson.subjects[0].id,
            code: `EXAM-${sJson.subjects[0].code}-2026`,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredQuestions = questions.filter((q) => q.subjectId === formData.subjectId);

  const toggleQuestionSelection = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedQuestionIds.includes(id);
      return {
        ...prev,
        selectedQuestionIds: exists
          ? prev.selectedQuestionIds.filter((qId) => qId !== id)
          : [...prev.selectedQuestionIds, id],
      };
    });
  };

  const selectAllQuestions = () => {
    setFormData((prev) => ({
      ...prev,
      selectedQuestionIds: filteredQuestions.map((q) => q.id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.questionSelectionMode === 'MANUAL' && formData.selectedQuestionIds.length === 0) {
      alert('Please select at least one question for this examination.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard/exams');
      } else {
        alert(data.error || 'Failed to create exam');
      }
    } catch (e: any) {
      alert(e.message || 'Error creating exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/exams"
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Enterprise Exam Builder</h1>
          <p className="text-xs text-slate-500">Configure questions, duration, pass criteria, and anti-cheating controls.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-700">
            1. Examination Identification & Subject
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Annual AML & Anti-Fraud Certification 2026"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. EXAM-AML-2026"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Domain *</label>
              <select
                value={formData.subjectId}
                onChange={(e) => {
                  const s = subjects.find((sub) => sub.id === e.target.value);
                  setFormData({
                    ...formData,
                    subjectId: e.target.value,
                    selectedQuestionIds: [],
                    code: s ? `EXAM-${s.code}-2026` : formData.code,
                  });
                }}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Mode</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="CERTIFICATION">Certification Exam (Issued Credential)</option>
                <option value="ASSESSMENT">Standard Assessment</option>
                <option value="PRACTICE">Practice Exam</option>
                <option value="TRAINING_QUIZ">Training Quiz</option>
                <option value="FINAL_EXAM">Final Semester / Annual Exam</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions for Candidates</label>
            <textarea
              rows={2}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Scoring & Anti-Cheating Settings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-700">
            2. Timing, Scoring & Anti-Cheating Controls
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                min="5"
                max="300"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 45 })}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Threshold (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.passScorePercent}
                onChange={(e) => setFormData({ ...formData, passScorePercent: parseFloat(e.target.value) || 70 })}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Allowed Attempts</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 3 })}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.fullScreenRequired}
                onChange={(e) => setFormData({ ...formData, fullScreenRequired: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-700">Full-Screen Lockdown</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tabSwitchDetect}
                onChange={(e) => setFormData({ ...formData, tabSwitchDetect: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-700">Tab-Switch Telemetry</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isCertEligible}
                onChange={(e) => setFormData({ ...formData, isCertEligible: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-700">Generate Verifiable Certificate</span>
            </label>
          </div>
        </div>

        {/* Question Selector */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-indigo-700">
              3. Examination Questions Pool ({filteredQuestions.length} available in Subject)
            </h3>
            <button
              type="button"
              onClick={selectAllQuestions}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Select All Questions
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto border border-slate-200 p-2 rounded-2xl divide-y divide-slate-100">
            {filteredQuestions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No questions exist for this subject yet. Go to Question Bank to add questions or generate them with AI.
              </div>
            ) : (
              filteredQuestions.map((q) => {
                const isSelected = formData.selectedQuestionIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => toggleQuestionSelection(q.id)}
                    className={`p-3 rounded-xl flex items-start gap-3 cursor-pointer transition ${
                      isSelected ? 'bg-indigo-50/70 border border-indigo-200' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {q.type}
                        </span>
                        <span className="text-[10px] text-slate-500">Marks: {q.marks}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-900 leading-snug">{q.questionText}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pt-2">
            <span>Selected Questions: {formData.selectedQuestionIds.length}</span>
            <span>
              Total Exam Marks:{' '}
              {filteredQuestions
                .filter((q) => formData.selectedQuestionIds.includes(q.id))
                .reduce((a, b) => a + (b.marks || 1), 0)}
            </span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/dashboard/exams"
            className="px-6 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Publish & Save Exam
          </button>
        </div>
      </form>
    </div>
  );
}
