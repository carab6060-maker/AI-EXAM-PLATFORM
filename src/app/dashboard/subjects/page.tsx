'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Loader2, Edit3, Trash2 } from 'lucide-react';

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
      const topicsArray = newSubj.topics
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
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
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '6px',
            }}
          >
            WORKSPACE DIRECTORY
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.5px',
              margin: '0 0 6px 0',
            }}
          >
            Subjects
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Manage assessment topics, examination codes, and domain curricula.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#0284C7',
            color: '#FFFFFF',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(2,132,199,0.25)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#0369A1')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#0284C7')}
        >
          <Plus size={16} />
          <span>Add subject</span>
        </button>
      </div>

      {/* Subjects Table Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '18px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  SUBJECT
                </th>
                <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  DESCRIPTION
                </th>
                <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  QUESTION BANK
                </th>
                <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  EXAMS
                </th>
                <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  STATUS
                </th>
                <th style={{ padding: '18px 24px', fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    Loading subjects...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                    No subjects found. Click "+ Add subject" to create one.
                  </td>
                </tr>
              ) : (
                subjects.map((subj) => (
                  <tr
                    key={subj.id}
                    style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FBFCFE')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Subject Name + Code */}
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                        {subj.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '3px', fontFamily: 'monospace' }}>
                        {subj.code}
                      </div>
                    </td>

                    {/* Description */}
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle', maxWidth: '320px' }}>
                      <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
                        {subj.description || '—'}
                      </div>
                    </td>

                    {/* Question Bank Pill */}
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          background: '#E0F2FE',
                          color: '#0284C7',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {subj._count?.questions || 0} Questions
                      </span>
                    </td>

                    {/* Exams Pill */}
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 12px',
                          borderRadius: '9999px',
                          background: '#E0F2FE',
                          color: '#0284C7',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        {subj._count?.exams || 0} Exams
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#16A34A',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16A34A' }} />
                        Active
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '18px 24px', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          style={{
                            padding: '5px 12px',
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            padding: '5px 8px',
                            background: '#FEF2F2',
                            color: '#EF4444',
                            border: '1px solid #FEE2E2',
                            borderRadius: '8px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(15,23,42,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '18px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                Create New Assessment Subject
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSubj.name}
                  onChange={(e) => setNewSubj({ ...newSubj, name: e.target.value })}
                  placeholder="e.g. Hospital Financial Management"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={newSubj.code}
                    onChange={(e) => setNewSubj({ ...newSubj, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FM-001"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={newSubj.category}
                    onChange={(e) => setNewSubj({ ...newSubj, category: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      fontSize: '13px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newSubj.description}
                  onChange={(e) => setNewSubj({ ...newSubj, description: e.target.value })}
                  placeholder="Financial accounting, budgeting, cash, fixed assets..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    background: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0284C7',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
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
