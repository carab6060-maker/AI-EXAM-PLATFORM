'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Search,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  XCircle,
} from 'lucide-react';
import CertificatePDF from '@/components/CertificatePDF';
import { formatDate } from '@/lib/utils';

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  useEffect(() => {
    async function loadCerts() {
      try {
        const res = await fetch('/api/certificates');
        if (res.ok) {
          const json = await res.json();
          setCertificates(json.certificates || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Professional Certificates & Credentials</h1>
          <p className="text-xs text-slate-500 mt-1">
            Issued verifiable qualification credentials with cryptographic QR code validation.
          </p>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading certificates repository...</div>
        ) : certificates.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No certificates issued yet. Certificates are issued automatically upon passing a certified exam.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Certificate Number</th>
                  <th className="p-3">Candidate</th>
                  <th className="p-3">Certified Qualification</th>
                  <th className="p-3">Score Achieved</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-indigo-600">{cert.certNumber}</td>
                    <td className="p-3 font-bold text-slate-900">{cert.user.name}</td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900">{cert.exam.title}</p>
                      <p className="text-[10px] text-slate-500">{cert.exam.subject?.name}</p>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{cert.result.percentage.toFixed(1)}%</td>
                    <td className="p-3 text-slate-500">{formatDate(cert.issueDate)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cert.status === 'VALID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        {cert.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition flex items-center gap-1"
                        >
                          <Award className="w-3.5 h-3.5" /> View / Download
                        </button>
                        <Link
                          href={`/verify/${cert.certNumber}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                          title="Public Verification Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Certificate PDF View Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-5xl my-8 relative">
            <button
              onClick={() => setSelectedCert(null)}
              className="no-print absolute -top-10 right-0 text-white hover:text-slate-300 p-2 text-xs font-bold flex items-center gap-1"
            >
              <X className="w-5 h-5" /> Close Viewer
            </button>
            <CertificatePDF certificate={selectedCert} />
          </div>
        </div>
      )}
    </div>
  );
}
