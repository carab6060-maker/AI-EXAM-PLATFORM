'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Eye, EyeOff, Loader2, Shield } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { label: 'Company Admin', email: 'admin@dahabshiil.so', pass: 'Password123!', color: '#3B82F6' },
  { label: 'Employee', email: 'ahmed.k@dahabshiil.so', pass: 'Password123!', color: '#10B981' },
  { label: 'Super Admin', email: 'superadmin@platform.com', pass: 'SuperAdmin123!', color: '#8B5CF6' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@dahabshiil.so');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* Main Login Card */}
      <div style={{ background: '#fff', borderRadius: '18px', padding: '40px 36px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 32px rgba(0,0,0,0.10)', border: '1px solid #E2E8F0' }}>

        {/* Logo & Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 6px 20px rgba(59,130,246,0.3)' }}>
            <Shield size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#1E293B', margin: '0 0 4px', letterSpacing: '-0.3px' }}>ExamPlatform</h1>
          <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>Powered by Mohamed Abdiaziiz Mohamed</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '16px', padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '9px', fontSize: '12px', color: '#DC2626', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.so"
                style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '9px', padding: '11px 14px 11px 36px', fontSize: '13px', fontWeight: 500, color: '#1E293B', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '22px' }}>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '9px', padding: '11px 40px 11px 36px', fontSize: '13px', fontWeight: 500, color: '#1E293B', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex', padding: 0 }}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', background: isLoading ? '#93C5FD' : '#3B82F6', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', letterSpacing: '0.1px', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}
          >
            {isLoading ? (
              <><Loader2 size={16} style={{ animation: 'nsLoginSpin 1s linear infinite' }} /> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
          Powered by <span style={{ color: '#3B82F6', fontWeight: 600 }}>Mohamed Abdiaziiz Mohamed</span>
        </p>
      </div>

      {/* Demo Switcher */}
      <div style={{ marginTop: '16px', background: '#fff', borderRadius: '14px', padding: '14px 18px', width: '100%', maxWidth: '400px', border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', textAlign: 'center', margin: '0 0 10px' }}>
          Quick Demo Access
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {DEMO_ACCOUNTS.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => { setEmail(d.email); setPassword(d.pass); setError(''); }}
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '9px', padding: '9px 10px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: d.color, marginBottom: '2px' }}>{d.label}</div>
              <div style={{ fontSize: '9px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.email.split('@')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      <style>{`@keyframes nsLoginSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

