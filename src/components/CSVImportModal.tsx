'use client';

import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, X, Check, Loader2, Download, AlertCircle } from 'lucide-react';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: { id: string; name: string; code: string }[];
}

export default function CSVImportModal({
  isOpen,
  onClose,
  onSuccess,
  departments,
}: CSVImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (!isOpen) return null;

  const downloadSampleTemplate = () => {
    const header = 'name,email,employeeId,departmentCode,positionName,phone\n';
    const sample = 'David Chen,david.c@company.com,EMP-1090,FIN,Senior Analyst,+1 (555) 345-6789\nMaria Rodriguez,maria.r@company.com,EMP-1091,COMP,Compliance Lead,+1 (555) 987-6543\n';
    const blob = new Blob([header + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      parseCSV(content);
    };
    reader.readAsText(file);
  };

  const parseCSV = (content: string) => {
    setCsvText(content);
    const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      setStatusMessage({ type: 'error', text: 'CSV must contain a header row and at least one data row.' });
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length >= 3) {
        rows.push({
          name: cols[0] || '',
          email: cols[1] || '',
          employeeId: cols[2] || '',
          departmentCode: cols[3] || '',
          positionName: cols[4] || '',
          phone: cols[5] || '',
        });
      }
    }

    setParsedRows(rows);
    setStatusMessage(null);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/employees/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      if (data.summary?.errors?.length > 0) {
        setStatusMessage({
          type: 'error',
          text: `Imported ${data.summary.successCount} of ${data.summary.total} employees. Errors: ${data.summary.errors.join('; ')}`,
        });
      } else {
        setStatusMessage({
          type: 'success',
          text: `Successfully imported all ${data.summary?.successCount || parsedRows.length} employees!`,
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Import failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Bulk Employee CSV Import</h3>
              <p className="text-xs text-slate-500">Upload CSV spreadsheet with staff details and departments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {statusMessage && (
            <div
              className={`p-3 text-xs rounded-xl border flex items-center gap-2 ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Download sample & upload box */}
          <div className="flex items-center justify-between bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <div>
              <p className="text-xs font-bold text-indigo-950">Need the CSV format template?</p>
              <p className="text-[11px] text-slate-600">Download the pre-formatted CSV template with department codes.</p>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-indigo-400 transition bg-slate-50/40">
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Select a CSV file to upload</p>
            <p className="text-[11px] text-slate-500 mb-3">Accepts .csv files up to 5MB</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>

          {parsedRows.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ready to Import ({parsedRows.length} records)
                </h4>
                <span className="text-[11px] text-emerald-600 font-semibold">Validation Passed</span>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {parsedRows.map((r, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between bg-white hover:bg-slate-50">
                    <div>
                      <span className="font-bold text-slate-900">{r.name}</span>{' '}
                      <span className="text-slate-500">({r.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                        {r.employeeId}
                      </span>
                      {r.departmentCode && (
                        <span className="bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {r.departmentCode}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
            onClick={handleImport}
            disabled={isLoading || parsedRows.length === 0}
            className="px-6 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Import {parsedRows.length} Employees
          </button>
        </div>
      </div>
    </div>
  );
}
