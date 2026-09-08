'use client';

import React, { useState, useEffect } from 'react';
import { Building, Check, Loader2, Save, Shield, Globe, Mail, Phone } from 'lucide-react';

export default function SettingsPage() {
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    async function loadCompany() {
      try {
        const res = await fetch('/api/companies');
        if (res.ok) {
          const json = await res.json();
          if (json.companies?.length > 0) {
            setCompany(json.companies[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadCompany();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('');

    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });

      if (res.ok) {
        setStatusMessage('Organization profile updated successfully!');
        setTimeout(() => setStatusMessage(''), 4000);
      } else {
        alert('Failed to update company settings');
      }
    } catch (e: any) {
      alert(e.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !company) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organization Profile & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure company branding, contact details, and assessment policies.</p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200">
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-black text-xl">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-full h-full object-contain rounded-2xl" />
            ) : (
              company.code
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{company.name}</h3>
            <p className="text-xs text-slate-500">
              Tenant Code: <span className="font-mono font-bold text-blue-600">{company.code}</span> • Status:{' '}
              <span className="font-bold text-emerald-600">{company.status}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
            <input
              type="text"
              required
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
            <input
              type="text"
              value={company.industry || ''}
              onChange={(e) => setCompany({ ...company, industry: e.target.value })}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={company.email || ''}
              onChange={(e) => setCompany({ ...company, email: e.target.value })}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={company.phone || ''}
              onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Address</label>
          <input
            type="text"
            value={company.address || ''}
            onChange={(e) => setCompany({ ...company, address: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
          <input
            type="text"
            value={company.website || ''}
            onChange={(e) => setCompany({ ...company, website: e.target.value })}
            className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
