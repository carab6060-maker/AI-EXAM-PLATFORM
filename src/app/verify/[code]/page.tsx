'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Award, Building, Calendar, CheckCircle2, User, FileText, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function PublicVerifyPage() {
  const params = useParams();
  const rawCode = params?.code as string;

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawCode) return;

    fetch(`/api/certificates/verify/${encodeURIComponent(rawCode)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.found) {
          setError(json.message || 'Certificate verification failed.');
        } else {
          setData(json.certificate);
        }
      })
      .catch((e) => setError('Network error verifying certificate.'))
      .finally(() => setIsLoading(false));
  }, [rawCode]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Award className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm tracking-tight">CertiMatrix Public Registry</span>
        </Link>

        <Link
          href="/login"
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Platform Login
        </Link>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-2xl mx-auto w-full my-8">
        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-300">Verifying credential against official cryptographic registry...</p>
          </div>
        ) : error || !data ? (
          <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-950 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/60">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Invalid or Unverified Credential</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {error || 'No active official certificate record was found matching this credential identifier.'}
            </p>
            <div className="pt-4">
              <span className="font-mono text-xs bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-rose-400">
                {rawCode}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6">
            {/* Status Pill */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    data.status === 'VALID'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                      : 'bg-rose-950 text-rose-400 border border-rose-800/60'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Verified Official Certificate</h3>
                  <p className="text-xs text-slate-400">Authenticity confirmed by issuing organization</p>
                </div>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase ${
                  data.status === 'VALID'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {data.status}
              </span>
            </div>

            {/* Certificate Details */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Credential Identifier
                </span>
                <span className="font-mono text-base font-bold text-indigo-400">{data.certNumber}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Certified Candidate
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{data.recipientName}</p>
                  {data.employeeId && (
                    <p className="text-xs text-slate-400 font-mono">ID: {data.employeeId}</p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Issuing Organization
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{data.companyName}</p>
                  {data.department && (
                    <p className="text-xs text-slate-400">{data.department}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-indigo-950/30 border border-indigo-900/40 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                  Examination & Qualification Standard
                </span>
                <p className="text-base font-bold text-white">{data.examTitle}</p>
                <p className="text-xs text-slate-300">
                  Subject: {data.subjectName} • Score Achieved: {data.percentageScore?.toFixed(1)}%
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 pt-2">
                <div>
                  <span className="text-slate-500 block">Issue Date</span>
                  <span className="font-semibold text-slate-200">{formatDate(data.issueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Expiration Date</span>
                  <span className="font-semibold text-slate-200">
                    {data.expiryDate ? formatDate(data.expiryDate) : 'Permanent / Non-Expiring'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600 py-4">
        CertiMatrix Public Verifiable Credentials Infrastructure • All Rights Reserved
      </footer>
    </div>
  );
}
