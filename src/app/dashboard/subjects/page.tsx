'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Layers, HelpCircle, FileCheck, Check, X, Loader2 } from 'lucide-react';

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newSubj, setNewSubj] = useState({
    name: '',
    code: '',
    description: '',
    category: 'Corporate Governance',
    difficulty: 'INTERMEDIATE',
    topics: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await fetch('/api/subjects');
      if (res.ok) {
        const json = await res.json();
        setSubjects(json.subjects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const topicsArray = newSubj.topics.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubj.name,
          code: newSubj.code,
          description: newSubj.description,
          category: newSubj.category,
          difficulty: newSubj.difficulty,
          topics: topicsArray,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewSubj({
          name: '',
          code: '',
          description: '',
          category: 'Corporate Governance',
          difficulty: 'INTERMEDIATE',
          topics: '',
        });
        fetchSubjects();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create subject');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subject & Topic Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">Structure knowledge domains, curriculum topics, and assessment question banks.</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Create New Subject
        </button>
      </div>

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No subjects created yet.
          </div>
        ) : (
          subjects.map((subj) => (
            <div key={subj.id} className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full uppercase border border-blue-200">
                    {subj.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">{subj.code}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{subj.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{subj.description || 'Subject domain'}</p>

                {subj.topics && subj.topics.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Curriculum Topics ({subj.topics.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {subj.topics.slice(0, 4).map((t: any) => (
                        <span key={t.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-medium border border-slate-200">
                          {t.name}
                        </span>
                      ))}
                      {subj.topics.length > 4 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-slate-400 font-semibold">
                          +{subj.topics.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  {subj._count?.questions || 0} Questions
                </span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {subj._count?.exams || 0} Exams
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">Create New Assessment Subject</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={newSubj.name}
                  onChange={(e) => setNewSubj({ ...newSubj, name: e.target.value })}
                  placeholder="e.g. Enterprise Information Security"
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newSubj.code}
                    onChange={(e) => setNewSubj({ ...newSubj, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SEC-101"
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 font-mono uppercase text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={newSubj.category}
                    onChange={(e) => setNewSubj({ ...newSubj, category: e.target.value })}
                    className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={newSubj.difficulty}
                  onChange={(e) => setNewSubj({ ...newSubj, difficulty: e.target.value })}
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newSubj.description}
                  onChange={(e) => setNewSubj({ ...newSubj, description: e.target.value })}
                  placeholder="Subject learning objectives and scope..."
                  className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Topics (Comma separated)</label>
                <input
                  type="text"
                  value={newSubj.topics}
                  onChange={(e) => setNewSubj({ ...newSubj, topics: e.target.value })}
                  placeholder="e.g. Access Control, Threat Modeling, Incident Response"
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
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
