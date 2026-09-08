'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Building2, User, LogOut, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
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

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      // fallback redirect
      window.location.href = '/login';
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-slate-900 text-white border-slate-900';
      case 'COMPANY_ADMIN':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'HR_MANAGER':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TRAINING_MANAGER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'EXAMINER':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left Branding / Company Badge */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                CertiMatrix <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">Enterprise</span>
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">Assessment & Training SaaS</span>
            </div>
          </Link>

          {user?.company && (
            <div className="hidden md:flex items-center gap-2 pl-4 ml-4 border-l border-slate-200">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-800">{user.company.name}</span>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold">
                {user.company.code}
              </span>
            </div>
          )}
        </div>

        {/* Right Session & Actions */}
        <div className="flex items-center gap-3">
          <NotificationBell />

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 p-1.5 pl-2 rounded-xl hover:bg-slate-100/80 transition"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight">{user?.name || 'Guest User'}</p>
                <span
                  className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadge(
                    user?.role
                  )}`}
                >
                  {user?.role?.replace('_', ' ') || 'USER'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0) || 'U'
                )}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                    <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
                    >
                      <User className="w-4 h-4 text-slate-400" /> Organization & Profile
                    </Link>
                  </div>

                  <div className="pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" /> Sign Out
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
