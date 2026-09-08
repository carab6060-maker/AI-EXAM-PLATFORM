'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, Lock, Clock, User, Globe } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/audit-logs');
        if (res.ok) {
          const json = await res.json();
          setLogs(json.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Security & Audit Event Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system audit logs tracking logins, exam submissions, certifications, and administrator operations.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No audit events logged yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Entity Target</th>
                  <th className="p-3">IP / Device</th>
                  <th className="p-3">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{formatDateTime(log.createdAt)}</td>
                    <td className="p-3 font-bold text-slate-900">
                      {log.user?.name || log.userEmail}
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{log.entity}</td>
                    <td className="p-3 font-mono text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">
                      {log.detailsJson || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
