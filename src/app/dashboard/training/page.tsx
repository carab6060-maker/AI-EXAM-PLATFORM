'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Play,
} from 'lucide-react';

export default function TrainingRoadmapPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      const res = await fetch('/api/training');
      if (res.ok) {
        const json = await res.json();
        setRecommendations(json.recommendations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await fetch('/api/training', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId: id, status: newStatus }),
      });
      fetchRecs();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">AI Competency & Training Roadmap</h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalized learning paths automatically formulated based on actual employee assessment weak points.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading learning modules...</div>
        ) : recommendations.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center text-xs text-slate-400 border border-slate-200">
            No active training remediation required. Complete assessments to generate personalized AI recommendations.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:border-slate-300 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      rec.priority === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {rec.priority} Priority Remediation
                  </span>

                  <span className="text-[11px] text-slate-500 font-semibold">{rec.user?.name}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rec.courseTitle}</h3>
                <p className="text-xs font-semibold text-blue-600">Target Deficit: {rec.topicTitle}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{rec.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rec.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {rec.status}
                </span>

                {rec.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => handleStatusUpdate(rec.id, 'COMPLETED')}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                ) : (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Ready for Reassessment
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
