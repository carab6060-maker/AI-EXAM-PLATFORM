'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function RegisterCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    companyCode: '',
    industry: 'Financial Services',
    adminName: '',
    adminEmail: '',
    password: '',
    phone: '',
    website: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Building className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Register Organization</h2>
          <p className="text-xs text-slate-400">Deploy a dedicated multi-tenant examination workspace for your team</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Health Corp"
                  className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Code (Short ID) *</label>
                <input
                  type="text"
                  required
                  name="companyCode"
                  maxLength={10}
                  value={formData.companyCode}
                  onChange={handleChange}
                  placeholder="e.g. ACME"
                  className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 uppercase font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Sector</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="Financial Services">Financial Services & Banking</option>
                  <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                  <option value="Information Technology">Information Technology & Cloud</option>
                  <option value="Government & Defense">Government & Defense</option>
                  <option value="Education & Universities">Education & Universities</option>
                  <option value="Manufacturing & Logistics">Manufacturing & Logistics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Website</label>
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 mb-3">
                Primary Organization Administrator Account
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Full Name *</label>
                  <input
                    type="text"
                    required
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleChange}
                    placeholder="e.g. Jordan Smith"
                    className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Corporate Email *</label>
                  <input
                    type="email"
                    required
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    placeholder="jordan@acme.com"
                    className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Administrator Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="w-full text-xs font-medium bg-slate-950/80 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Enterprise Tenant...
                </>
              ) : (
                <>
                  Complete Registration & Access Workspace <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
