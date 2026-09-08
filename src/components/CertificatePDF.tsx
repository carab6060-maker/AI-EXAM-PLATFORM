'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Award, ShieldCheck, Download, Printer, CheckCircle, ExternalLink } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CertificatePDFProps {
  certificate: {
    id: string;
    certNumber: string;
    issueDate: string;
    expiryDate?: string | null;
    status: string;
    user: {
      name: string;
      email: string;
      employeeProfile?: {
        employeeId: string;
        department?: { name: string } | null;
        position?: { name: string } | null;
      } | null;
    };
    exam: {
      title: string;
      subject: { name: string };
    };
    company: {
      name: string;
      logo?: string | null;
    };
    result: {
      percentage: number;
    };
  };
}

export default function CertificatePDF({ certificate }: CertificatePDFProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${certificate.certNumber}`;

  useEffect(() => {
    QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
      .then((url) => setQrCodeDataUrl(url))
      .catch((e) => console.error(e));
  }, [verifyUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const certElement = document.getElementById('printable-certificate');
      if (!certElement) return;

      const canvas = await html2canvas(certElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${certificate.certNumber}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      window.print();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Certificate Status:</span>
          <span
            className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${
              certificate.status === 'VALID'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {certificate.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Official PDF
          </button>
        </div>
      </div>

      {/* Verifiable Certificate Canvas */}
      <div
        id="printable-certificate"
        className="bg-white text-slate-900 border-8 border-double border-indigo-950 p-8 sm:p-14 rounded-3xl shadow-2xl relative overflow-hidden max-w-4xl mx-auto"
      >
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Award className="w-96 h-96 text-indigo-950" />
        </div>

        {/* Outer Corner Ornaments */}
        <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-600" />
        <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-600" />
        <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-600" />
        <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-600" />

        {/* Header */}
        <div className="text-center relative z-10 space-y-2">
          <div className="flex justify-center items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center shadow-lg">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <h4 className="text-xs font-extrabold uppercase tracking-[0.3em] text-indigo-700">
            {certificate.company.name}
          </h4>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-wide text-slate-900 uppercase">
            Certificate of Competency
          </h1>
          <p className="text-xs text-slate-500 tracking-wider uppercase">
            Official Professional Qualification Standard
          </p>
        </div>

        {/* Main Body */}
        <div className="text-center my-8 relative z-10 space-y-4">
          <p className="text-sm font-medium text-slate-600 italic">This is to officially certify that</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-950 border-b-2 border-indigo-100 inline-block pb-1 px-8">
            {certificate.user.name}
          </h2>
          {certificate.user.employeeProfile?.employeeId && (
            <p className="text-xs text-slate-500 font-mono">
              Employee ID: {certificate.user.employeeProfile.employeeId} •{' '}
              {certificate.user.employeeProfile.department?.name || 'Enterprise Staff'}
            </p>
          )}

          <p className="text-sm text-slate-700 max-w-xl mx-auto leading-relaxed pt-2">
            has successfully fulfilled all examination criteria, demonstrated professional mastery, and passed the rigorous assessment in
          </p>

          <div className="bg-indigo-50/70 border border-indigo-100 py-3 px-6 rounded-2xl inline-block max-w-2xl mx-auto">
            <p className="text-base sm:text-lg font-bold text-indigo-900">{certificate.exam.title}</p>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {certificate.exam.subject.name} • Final Score: {certificate.result.percentage.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Footer with Signatures & QR Code */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 items-end relative z-10 text-xs text-slate-600">
          <div className="text-left space-y-1">
            <p className="font-semibold text-slate-900">Certificate No:</p>
            <p className="font-mono text-indigo-700 font-bold">{certificate.certNumber}</p>
            <p className="text-[11px] text-slate-500">Issued on: {formatDate(certificate.issueDate)}</p>
            {certificate.expiryDate && (
              <p className="text-[11px] text-slate-500">Valid Until: {formatDate(certificate.expiryDate)}</p>
            )}
          </div>

          <div className="text-center flex flex-col items-center">
            {qrCodeDataUrl ? (
              <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm inline-block">
                <img src={qrCodeDataUrl} alt="QR Verification" className="w-20 h-20" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded-xl" />
            )}
            <span className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">Scan to Verify Authenticity</span>
          </div>

          <div className="text-right space-y-1">
            <div className="h-10 border-b border-slate-400 flex items-end justify-end pb-1">
              <span className="font-serif italic text-sm text-indigo-900">Faadumo Axmed Cali</span>
            </div>
            <p className="font-semibold text-slate-900">Saxiixa Rasmiga ah (Authorized Signatory)</p>
            <p className="text-[11px] text-slate-500">Agaasimaha HR & Maamulka Imtixaanaadka</p>
          </div>
        </div>
      </div>
    </div>
  );
}
