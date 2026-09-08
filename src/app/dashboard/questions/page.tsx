'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  Search,
  Sparkles,
  Filter,
  Check,
  X,
  Trash2,
  CheckCircle2,
  FileSpreadsheet,
  Download,
} from 'lucide-react';
import AIQuestionModal from '@/components/AIQuestionModal';

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    subjectId: '',
    questionText: '',
    type: 'MCQ',
    difficulty: 'MEDIUM',
    marks: 1.0,
    explanation: '',
    tags: '',
    options: [
      { optionText: '', isCorrect: true },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
      { optionText: '', isCorrect: false },
    ],
  });

  const fetchQuestions = async () => {
    try {
      let url = '/api/questions?';
      if (subjectFilter) url += `subjectId=${subjectFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      if (difficultyFilter) url += `difficulty=${difficultyFilter}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setQuestions(json.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const json = await res.json();
        setSubjects(json.subjects || []);
        if (json.subjects?.length > 0 && !newQuestion.subjectId) {
          setNewQuestion((prev) => ({ ...prev, subjectId: json.subjects[0].id }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [subjectFilter, typeFilter, difficultyFilter, search]);

  const handleImportAIBatch = async (batch: any[]) => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batchQuestions: batch }),
    });

    if (res.ok) {
      fetchQuestions();
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import AI questions');
    }
  };

  const handleCreateSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuestion),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchQuestions();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create question');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating question');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      const res = await fetch(`/api/questions?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchQuestions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank & AI Generator</h1>
          <p className="text-xs text-slate-500 mt-1">
            Curate MCQs, True/False, Scenarios, and Multi-Select items with AI automated drafting and review.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start flex-wrap">
          <button
            onClick={() => setShowAIModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> AI Question Generator
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Question
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, tags, keywords..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Question Types</option>
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="SCENARIO">Scenario</option>
            <option value="MULTIPLE_SELECT">Multiple Select</option>
            <option value="SHORT_ANSWER">Short Answer</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>
      </div>

      {/* Question List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading question bank...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No questions found matching your filter criteria.
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm space-y-4 relative">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    {q.type}
                  </span>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                    {q.difficulty}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                    Subject: {q.subject?.name}
                  </span>
                  {q.isAiGenerated && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-purple-100">
                      <Sparkles className="w-3 h-3 text-purple-600" /> AI Synthesized
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">{q.marks} Marks</span>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.questionText}</p>

              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt: any, oIdx: number) => (
                    <div
                      key={opt.id}
                      className={`p-3 text-xs rounded-xl border flex items-start gap-2.5 ${
                        opt.isCorrect
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="flex-1">{opt.optionText}</span>
                      {opt.isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
              )}

              {q.explanation && (
                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100">
                  <span className="font-bold text-slate-800">Explanation / Answer Key Rationale:</span> {q.explanation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* AI Modal */}
      <AIQuestionModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        subjects={subjects}
        onImportQuestions={handleImportAIBatch}
      />

      {/* Add Manual Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Add Manual Question Item</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    value={newQuestion.subjectId}
                    onChange={(e) => setNewQuestion({ ...newQuestion, subjectId: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Question Type</label>
                  <select
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="MCQ">Multiple Choice (Single Answer)</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="SCENARIO">Scenario</option>
                    <option value="MULTIPLE_SELECT">Multiple Select</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Question Text *</label>
                <textarea
                  rows={3}
                  required
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="Enter the full question prompt or scenario..."
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Answer Options & Correct Key</label>
                {newQuestion.options.map((opt, oIdx) => (
                  <div key={oIdx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => {
                        const updated = newQuestion.options.map((o, idx) => ({ ...o, isCorrect: idx === oIdx }));
                        setNewQuestion({ ...newQuestion, options: updated });
                      }}
                      className="accent-blue-600"
                    />
                    <input
                      type="text"
                      required
                      value={opt.optionText}
                      onChange={(e) => {
                        const updated = [...newQuestion.options];
                        updated[oIdx].optionText = e.target.value;
                        setNewQuestion({ ...newQuestion, options: updated });
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + oIdx)} text...`}
                      className="flex-1 text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation / Answer Rationale</label>
                <textarea
                  rows={2}
                  value={newQuestion.explanation}
                  onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
                  placeholder="Why is this answer correct? Explain the principles..."
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
