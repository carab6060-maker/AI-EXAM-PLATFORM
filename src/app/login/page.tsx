'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F0F5FD',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #F7FAFE 0%, #ECF3FC 55%, #E1EDFA 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Subtle Ambient Background Accents */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          left: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(219, 234, 254, 0.6) 0%, rgba(240, 245, 253, 0) 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 231, 255, 0.5) 0%, rgba(240, 245, 253, 0) 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Main Centered Login Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          padding: '40px 36px 36px',
          boxShadow: '0 20px 45px -10px rgba(28, 55, 90, 0.08), 0 4px 12px -2px rgba(28, 55, 90, 0.03)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Language Switcher Pill (Top Right) */}
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#F1F5F9',
              padding: '3px 6px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              userSelect: 'none',
            }}
          >
            <span style={{ color: '#94A3B8', padding: '0 3px', fontSize: '10px' }}>文A</span>
            <span
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '9999px',
                lineHeight: 1.3,
              }}
            >
              EN
            </span>
            <span
              style={{
                color: '#64748B',
                padding: '2px 6px',
                cursor: 'pointer',
                lineHeight: 1.3,
              }}
            >
              AR
            </span>
          </div>
        </div>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', paddingTop: '10px' }}>
          {/* Vortex / Hexagonal Modern Blue Logo */}
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: '16px' }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="vortexGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E40AF" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <linearGradient id="vortexGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
                <linearGradient id="vortexGrad3" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0284C7" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
              <g transform="translate(30, 30)">
                {/* 6 Curved Geometric Swirl Blades */}
                <path
                  d="M0,-24 C10,-24 19,-17 21,-7 C20,-9 14,-14 6,-14 C-1,-14 -7,-10 -9,-4 C-8,-11 -5,-20 0,-24 Z"
                  fill="url(#vortexGrad1)"
                />
                <path
                  d="M0,-24 C10,-24 19,-17 21,-7 C20,-9 14,-14 6,-14 C-1,-14 -7,-10 -9,-4 C-8,-11 -5,-20 0,-24 Z"
                  fill="url(#vortexGrad2)"
                  transform="rotate(60)"
                />
                <path
                  d="M0,-24 C10,-24 19,-17 21,-7 C20,-9 14,-14 6,-14 C-1,-14 -7,-10 -9,-4 C-8,-11 -5,-20 0,-24 Z"
                  fill="url(#vortexGrad3)"
                  transform="rotate(120)"
                />
                <path
                  d="M0,-24 C10,-24 19,-17 21,-7 C20,-9 14,-14 6,-14 C-1,-14 -7,-10 -9,-4 C-8,-11 -5,-20 0,-24 Z"
                  fill="url(#vortexGrad1)"
                  transform="rotate(180)"
                />
                <path
                  d="M0,-24 C10,-24 19,-17 21,-7 C20,-9 14,-14 6,-14 C-1,-14 -7,-10 -9,-4 C-8,-11 -5,-20 0,-24 Z"
                  fill="url(#vortexGrad2)"
                  transform="rotate(240)"
                />
                <path
                  d="M0,-24 C10,-24 19,-17 21,-7 C20,-9 14,-14 6,-14 C-1,-14 -7,-10 -9,-4 C-8,-11 -5,-20 0,-24 Z"
                  fill="url(#vortexGrad3)"
                  transform="rotate(300)"
                />
                {/* Center Core Circle */}
                <circle cx="0" cy="0" r="4" fill="#1D4ED8" />
              </g>
            </svg>
          </div>

          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 6px',
              letterSpacing: '-0.4px',
            }}
          >
            ExamPlatform
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#64748B',
              margin: '0 0 4px',
              fontWeight: 500,
            }}
          >
            AI-Powered Examination &amp; Certification System
          </p>
          <p
            style={{
              fontSize: '11px',
              color: '#94A3B8',
              margin: 0,
              fontWeight: 500,
            }}
          >
            Powered by Mohamed Abdiaziiz Mohamed
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '12px',
              fontSize: '12px',
              color: '#DC2626',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div style={{ marginBottom: '18px' }}>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '7px',
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.so"
                style={{
                  width: '100%',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '13px 14px 13px 40px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '7px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#94A3B8"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '13px 40px 13px 40px',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0F172A',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F1F5F9';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '6px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit"
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#93C5FD' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.25)';
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Attribution */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <p style={{ fontSize: '11px', color: '#94A3B8', margin: 0, fontWeight: 500 }}>
            Powered by{' '}
            <span style={{ color: '#2563EB', fontWeight: 600 }}>Mohamed Abdiaziiz Mohamed</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
