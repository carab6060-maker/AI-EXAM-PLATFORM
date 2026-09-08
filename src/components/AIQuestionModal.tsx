'use client';

import React, { useState } from 'react';
import { Sparkles, X, Check, Loader2, Trash2 } from 'lucide-react';

interface AIQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: { id: string; name: string; topics?: { id: string; name: string }[] }[];
  onImportQuestions: (questions: any[]) => Promise<void>;
}

export default function AIQuestionModal({
  isOpen,
  onClose,
  subjects,
  onImportQuestions,
}: AIQuestionModalProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [topicName, setTopicName] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [count, setCount] = useState(5);
  const [questionType, setQuestionType] = useState('MCQ');
  const [marks, setMarks] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleGenerate = async () => {
    if (!activeSubject) {
      setErrorMessage('Please select a subject first.');
      return;
    }
    const topic = topicName.trim() || activeSubject.topics?.[0]?.name || 'Core Principles';

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: activeSubject.name,
          topic,
          difficulty,
          count,
          type: questionType,
          marks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      const formatted = (data.questions || []).map((q: any) => ({
        ...q,
        subjectId: activeSubject.id,
        isAiGenerated: true,
      }));
      setGeneratedQuestions(formatted);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with AI engine.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setGeneratedQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveToBank = async () => {
    if (generatedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      await onImportQuestions(generatedQuestions);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving questions.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Enterprise AI Question Generator</h3>
              <p className="text-xs text-slate-500">Draft, review, and approve AI-synthesized examination items</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {errorMessage}
            </div>
          )}

          {/* Generator Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Area</label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                placeholder="e.g. Risk Mitigation, AML Checks"
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="EASY">Beginner / Easy</option>
                <option value="MEDIUM">Intermediate / Medium</option>
                <option value="HARD">Advanced / Hard</option>
                <option value="EXPERT">Expert / Specialist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Question Type</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="MCQ">Multiple Choice (Single Answer)</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SCENARIO">Scenario-Based Case</option>
                <option value="MULTIPLE_SELECT">Multiple Select</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Question Count</label>
              <select
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Questions
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Generated Questions Preview & Review List */}
          {generatedQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Generated Drafts ({generatedQuestions.length}) — Review & Approve
                </h4>
                <span className="text-xs text-amber-600 font-medium">
                  * Questions will not be published until approved
                </span>
              </div>

              <div className="space-y-3">
                {generatedQuestions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white border border-slate-200/90 rounded-2xl relative shadow-sm">
                    <button
                      onClick={() => handleRemoveQuestion(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
                      title="Discard question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        Q{idx + 1} • {q.type}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">Marks: {q.marks}</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-900 pr-8">{q.questionText}</p>

                    {q.options && q.options.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: any, oIdx: number) => (
                          <div
                            key={oIdx}
                            className={`p-2.5 text-xs rounded-xl border flex items-start gap-2 ${
                              opt.isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                                opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="flex-1">{opt.optionText}</span>
                            {opt.isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.explanation && (
                      <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                        💡 Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveToBank}
            disabled={isSaving || generatedQuestions.length === 0}
            className="px-6 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Approve & Import {generatedQuestions.length} Questions to Bank
          </button>
        </div>
      </div>
    </div>
  );
}
