'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUser(data.user);
      })
      .catch(() => {
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#EEF2F9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #BFDBFE', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'dashSpin 0.8s linear infinite' }} />
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Loading Session...</p>
        <style>{`@keyframes dashSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#EEF2F9', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar userRole={user?.role} />
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', maxWidth: '1400px', width: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
