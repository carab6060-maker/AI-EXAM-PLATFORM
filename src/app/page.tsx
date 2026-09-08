'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Award,
  BookOpen,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Lock,
  BarChart3,
  Layers,
  Building,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#070D1E] text-white selection:bg-blue-500 selection:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#070D1E]/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight flex items-center gap-2">
                CertiMatrix <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">Enterprise</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Assessment, Training & Certification SaaS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/verify/CERT-DAHAB-2026-00042"
              className="text-xs font-semibold text-slate-300 hover:text-white transition hidden sm:inline-block"
            >
              Verify Certificate
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              Sign In <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-semibold">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Multi-Tenant Employee Examination & Competency SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Enterprise <span className="text-blue-400">Workforce Assessment</span> & Certification Engine
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Empower your enterprise with multi-tenant company isolation, AI-synthesized question banks, resilient timed examination rooms with anti-cheat telemetry, automated grading, and verifiable PDF certificates with QR authentication.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 hover:scale-[1.02] transition duration-150 flex items-center gap-2"
            >
              Launch Enterprise Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register-company"
              className="px-8 py-3.5 rounded-xl bg-[#0D182E] hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-bold text-sm transition flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-blue-400" /> Register Organization
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          <div className="p-6 rounded-2xl bg-[#0D182E] border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Question Synthesizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate tailored examination items across finance, healthcare, security, and corporate compliance with automated option distractors and explanations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D182E] border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Secure Exam Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-screen lockdown, tab-switch telemetry, automatic real-time autosave, randomized question pools, and server-side answer key protection.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D182E] border border-slate-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Verifiable Certificates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official downloadable PDF certificates with unique alphanumeric credentials and instant public QR code verification.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 CertiMatrix Enterprise Exam Platform. Designed for commercial production use.</p>
      </footer>
    </div>
  );
}
