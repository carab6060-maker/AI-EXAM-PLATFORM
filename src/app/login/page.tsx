'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dahabshiil.so');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || 'Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoUser = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#070D1E] flex flex-col justify-center items-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Enterprise Sign In</h2>
          <p className="text-xs text-slate-400">Access your organization's examination and certification portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0D182E] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Corporate Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.so"
                  className="w-full text-xs font-medium bg-[#070D1E] border border-slate-700/80 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs font-medium bg-[#070D1E] border border-slate-700/80 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating Session...
                </>
              ) : (
                <>
                  Sign In to Portal <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">
              Quick 1-Click Role Switcher (Demo Accounts)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoUser('admin@dahabshiil.so', 'Password123!')}
                className="p-2.5 bg-[#070D1E] border border-slate-800 hover:border-blue-500 rounded-xl text-left transition group"
              >
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-blue-400">Company Admin</p>
                <p className="text-[9px] text-slate-400 truncate">Fadumo Ahmed (Dahabshiil)</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('ahmed.k@dahabshiil.so', 'Password123!')}
                className="p-2.5 bg-[#070D1E] border border-slate-800 hover:border-blue-500 rounded-xl text-left transition group"
              >
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-blue-400">Staff Employee</p>
                <p className="text-[9px] text-slate-400 truncate">Ahmed Hassan (Accountant)</p>
              </button>

              <button
                type="button"
                onClick={() => setDemoUser('superadmin@platform.com', 'SuperAdmin123!')}
                className="p-2.5 bg-[#070D1E] border border-slate-800 hover:border-blue-500 rounded-xl text-left transition group"
              >
                <p className="text-[11px] font-bold text-slate-200 group-hover:text-blue-400">Super Admin</p>
                <p className="text-[9px] text-slate-400 truncate">Guled Abdi (Platform)</p>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2 text-xs text-slate-500">
          <p>
            Public Certificate Check:{' '}
            <Link href="/verify/CERT-DAHAB-2026-00042" className="text-slate-400 hover:text-slate-300 underline">
              Verify Credential
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
