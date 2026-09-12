'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, RotateCw, Bell, ChevronRight } from 'lucide-react';

interface NavbarProps {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    avatar?: string | null;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Generate dynamic breadcrumb matching screenshot: Workspace > Subjects
  const getBreadcrumbs = () => {
    if (pathname.includes('/subjects')) {
      return { parent: 'Workspace', current: 'Subjects' };
    }
    if (pathname.includes('/companies')) {
      return { parent: 'Workspace', current: 'Companies' };
    }
    if (pathname.includes('/employees')) {
      return { parent: 'Workspace', current: 'Employees' };
    }
    if (pathname.includes('/questions')) {
      return { parent: 'Assessment', current: 'Question Bank' };
    }
    if (pathname.includes('/exams')) {
      return { parent: 'Assessment', current: 'Exams' };
    }
    if (pathname.includes('/results')) {
      return { parent: 'Assessment', current: 'Results' };
    }
    if (pathname.includes('/reports')) {
      return { parent: 'Analytics', current: 'Reports' };
    }
    return { parent: 'Workspace', current: 'Dashboard' };
  };

  const breadcrumbs = getBreadcrumbs();
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SA';

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <header
      style={{
        height: '70px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      {/* Left: Hamburger + Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
          <span style={{ color: '#64748B', fontWeight: 500 }}>{breadcrumbs.parent}</span>
          <ChevronRight size={14} color="#94A3B8" />
          <span style={{ color: '#0F172A', fontWeight: 700 }}>{breadcrumbs.current}</span>
        </div>
      </div>

      {/* Right: Search + Refresh + Notifications + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#F1F5F9',
            borderRadius: '12px',
            padding: '8px 16px',
            width: '260px',
          }}
        >
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder={`Search ${breadcrumbs.current}...`}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: '#0F172A',
              width: '100%',
            }}
          />
        </div>

        {/* Refresh Icon Button */}
        <button
          onClick={handleRefresh}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <RotateCw size={17} />
        </button>

        {/* Notification Bell */}
        <button
          style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: 'none',
            background: 'transparent',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#F1F5F9')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell size={18} />
          {/* Red Notification Dot */}
          <span
            style={{
              position: 'absolute',
              top: '7px',
              right: '8px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#EF4444',
            }}
          />
        </button>

        {/* User Avatar Circle */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#BAE6FD',
            color: '#0369A1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: 800,
            overflow: 'hidden',
          }}
        >
          {user?.avatar ? (
            <img src={user.avatar} alt={user?.name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
