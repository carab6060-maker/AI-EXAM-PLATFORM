'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, ArrowLeft, Building, Layers, Check, Loader2, Calendar } from 'lucide-react';

export default function AssignExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;

  const [exam, setExam] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [targetType, setTargetType] = useState('ALL_COMPANY'); // ALL_COMPANY, INDIVIDUAL
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [eRes, empRes] = await Promise.all([
          fetch('/api/exams'),
          fetch('/api/employees'),
        ]);

        const eJson = await eRes.json();
        const found = (eJson.exams || []).find((x: any) => x.id === examId);
        setExam(found);

        const empJson = await empRes.json();
        setEmployees(empJson.employees || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/exams/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          targetType,
          employeeProfileIds: selectedEmpIds,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });

      if (res.ok) {
        alert('Exam assigned successfully and notifications delivered to employees!');
        router.push('/dashboard/exams');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to assign exam');
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading assignment controls...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/exams"
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assign Assessment</h1>
          <p className="text-xs text-slate-500">Enroll company employees in "{exam?.title || 'Exam'}".</p>
        </div>
      </div>

      <form onSubmit={handleAssign} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Target Audience Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTargetType('ALL_COMPANY')}
              className={`p-4 rounded-2xl border text-left transition ${
                targetType === 'ALL_COMPANY'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Building className="w-5 h-5 text-indigo-600 mb-2" />
              <p className="text-xs font-bold text-slate-900">All Company Staff</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Mandatory for all employees</p>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('INDIVIDUAL')}
              className={`p-4 rounded-2xl border text-left transition ${
                targetType === 'INDIVIDUAL'
                  ? 'bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Users className="w-5 h-5 text-indigo-600 mb-2" />
              <p className="text-xs font-bold text-slate-900">Individual Staff</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Pick specific employees</p>
            </button>
          </div>
        </div>

        {targetType === 'INDIVIDUAL' && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Select Employees</label>
            <div className="max-h-60 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-xl divide-y divide-slate-100">
              {employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEmpIds.includes(emp.id)}
                    onChange={(e) => {
                      setSelectedEmpIds(
                        e.target.checked ? [...selectedEmpIds, emp.id] : selectedEmpIds.filter((id) => id !== emp.id)
                      );
                    }}
                    className="rounded text-indigo-600"
                  />
                  <span className="text-xs font-medium text-slate-900">{emp.user.name}</span>
                  <span className="text-[10px] text-slate-500">({emp.employeeId} • {emp.designation || 'Staff'})</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Completion Deadline (Optional)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="pt-4 flex justify-end gap-2">
          <Link
            href="/dashboard/exams"
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirm Assignment & Notify Staff
          </button>
        </div>
      </form>
    </div>
  );
}
