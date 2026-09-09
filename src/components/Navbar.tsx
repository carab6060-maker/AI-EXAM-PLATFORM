'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Building2, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import NotificationBell from './NotificationBell';

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    company?: {
      name: string;
      code: string;
      logo?: string | null;
    } | null;
  } | null;
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SUPER_ADMIN:       { bg: '#1E293B', text: '#F8FAFC', border: '#334155' },
  COMPANY_ADMIN:     { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  HR_MANAGER:        { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  TRAINING_MANAGER:  { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
  EXAMINER:          { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
  EMPLOYEE:          { bg: '#F8FAFC', text: '#475569', border: '#E2E8F0' },
};

const AVATAR_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899'];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      window.location.href = '/login';
    }
  };

  const roleStyle = ROLE_COLORS[user?.role || 'EMPLOYEE'] || ROLE_COLORS.EMPLOYEE;
  const avatarColor = user?.name ? getAvatarColor(user.name) : '#3B82F6';
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 30, background: '#fff', borderBottom: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Left: Brand + Company */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg, #3B82F6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(59,130,246,0.3)', flexShrink: 0 }}>
              <Shield size={19} color="white" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                CertiMatrix
                <span style={{ marginLeft: '7px', fontSize: '9px', fontWeight: 700, background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', borderRadius: '5px', padding: '2px 6px', letterSpacing: '0.5px', textTransform: 'uppercase', verticalAlign: 'middle' }}>Enterprise</span>
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 500 }}>Assessment & Training SaaS</div>
            </div>
          </Link>

          {user?.company && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '16px', marginLeft: '8px', borderLeft: '1px solid #E2E8F0' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '7px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={13} color="#64748B" />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', lineHeight: 1 }}>{user.company.name}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: 'monospace', fontWeight: 600, textTransform: 'uppercase' }}>{user.company.code}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Notifications + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <NotificationBell />

          {/* User Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px 6px 6px', borderRadius: '12px', border: '1px solid #E2E8F0', background: profileOpen ? '#F8FAFC' : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
            >
              {/* Avatar */}
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
                {user?.avatar ? <img src={user.avatar} alt={user?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
              <div style={{ textAlign: 'left', display: 'none' }} className="sm:block">
                <div style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1E293B', lineHeight: 1.2 }}>{user?.name || 'Guest'}</div>
                <span style={{ display: 'inline-block', marginTop: '2px', fontSize: '10px', fontWeight: 700, background: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}`, borderRadius: '5px', padding: '1px 6px' }}>
                  {user?.role?.replace(/_/g, ' ') || 'USER'}
                </span>
              </div>
              <ChevronDown size={13} color="#94A3B8" />
            </button>

            {profileOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: '240px', background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', boxShadow: '0 16px 48px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{user?.name}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                  </div>
                  {/* Links */}
                  <div style={{ padding: '6px' }}>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, color: '#475569', textDecoration: 'none', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F8FAFC'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <User size={14} color="#94A3B8" /> Organisation & Profile
                    </Link>
                  </div>
                  <div style={{ padding: '6px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '9px', fontSize: '13px', fontWeight: 500, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FEF2F2'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <LogOut size={14} color="#EF4444" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


