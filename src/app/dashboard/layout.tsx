'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('auth_user');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return !localStorage.getItem('auth_user');
      } catch (e) {}
    }
    return true;
  });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          try { localStorage.removeItem('auth_user'); } catch (e) {}
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
        try { localStorage.setItem('auth_user', JSON.stringify(data.user)); } catch (e) {}
      })
      .catch(() => {
        // Keep optimistic user on temporary network blips
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #BFDBFE', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'dashSpin 0.8s linear infinite' }} />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Loading Session...</p>
        <style>{`@keyframes dashSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex' }}>
      <Sidebar user={user} userRole={user?.role} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100vh', overflow: 'hidden' }}>
        <Navbar user={user} />
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', background: '#F8FAFC' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
