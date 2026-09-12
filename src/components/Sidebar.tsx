'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Building2,
  Layers,
  Users,
  KeyRound,
  ClipboardList,
  BookOpen,
  ArrowLeftRight,
  BarChart2,
  BarChart3,
  Award,
  PenLine,
  ChevronRight,
  ChevronDown,
  LogOut,
  X,
} from 'lucide-react';

// Custom ID Badge Card Icon matching the screenshot
function IdCardIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <rect width="20" height="15" x="2" y="4.5" rx="2.5" />
      <circle cx="7" cy="11.5" r="2" />
      <path d="M12 9.5h6" />
      <path d="M12 13.5h4" />
    </svg>
  );
}

// Custom Question Document Icon matching the screenshot
function QuestionDocIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <rect width="16" height="18" x="4" y="3" rx="2.5" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.8.8c0 1.6-2.3 2.2-2.3 3.2" />
      <path d="M12 17h.01" />
    </svg>
  );
}

interface SidebarProps {
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string | null;
  } | null;
  userRole?: string;
}

export default function Sidebar({ user, userRole = 'EMPLOYEE' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  // Check if current path belongs to Workspace
  const isWorkspacePath =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/companies') ||
    pathname.startsWith('/dashboard/employees') ||
    pathname.startsWith('/dashboard/departments') ||
    pathname.startsWith('/dashboard/staff') ||
    pathname.startsWith('/dashboard/staff-logins') ||
    pathname.startsWith('/dashboard/audit-logs');

  // Check if current path belongs to Assessment
  const isAssessmentPath =
    pathname.startsWith('/dashboard/subjects') ||
    pathname.startsWith('/dashboard/questions') ||
    pathname.startsWith('/dashboard/exams');

  // Check if current path belongs to Reports
  const isReportsPath =
    pathname.startsWith('/dashboard/reports') ||
    pathname.startsWith('/dashboard/results') ||
    pathname.startsWith('/dashboard/certificates') ||
    pathname.startsWith('/dashboard/signature-setups');

  const [workspaceOpen, setWorkspaceOpen] = useState(isWorkspacePath);
  const [assessmentOpen, setAssessmentOpen] = useState(isAssessmentPath);
  const [reportsOpen, setReportsOpen] = useState(isReportsPath);

  useEffect(() => {
    if (isWorkspacePath) setWorkspaceOpen(true);
  }, [pathname, isWorkspacePath]);

  useEffect(() => {
    if (isAssessmentPath) setAssessmentOpen(true);
  }, [pathname, isAssessmentPath]);

  useEffect(() => {
    if (isReportsPath) setReportsOpen(true);
  }, [pathname, isReportsPath]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      try {
        localStorage.removeItem('auth_user');
      } catch (e) {}
      router.push('/login');
      router.refresh();
    } catch {
      window.location.href = '/login';
    }
  };

  // 1. Workspace Sub-items
  const workspaceSubItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
      isActive: pathname === '/dashboard',
    },
    {
      id: 'companies',
      label: 'Companies',
      href: '/dashboard/companies',
      icon: Building2,
      isActive: pathname.startsWith('/dashboard/companies'),
    },
    {
      id: 'employee',
      label: 'Employee',
      href: '/dashboard/employees',
      customIcon: IdCardIcon,
      isActive: pathname === '/dashboard/employees',
    },
    {
      id: 'department',
      label: 'Department',
      href: '/dashboard/departments',
      icon: Layers,
      isActive: pathname.startsWith('/dashboard/departments'),
    },
    {
      id: 'staff',
      label: 'Staff',
      href: '/dashboard/staff',
      icon: Users,
      isActive: pathname.startsWith('/dashboard/staff'),
    },
    {
      id: 'staff-logins',
      label: 'Staff Logins',
      href: '/dashboard/staff-logins',
      icon: KeyRound,
      isActive: pathname.startsWith('/dashboard/staff-logins') || pathname.startsWith('/dashboard/audit-logs'),
    },
  ];

  // 2. Assessment Sub-items
  const assessmentSubItems = [
    {
      id: 'subjects',
      label: 'Subjects',
      href: '/dashboard/subjects',
      icon: BookOpen,
      isActive: pathname.startsWith('/dashboard/subjects'),
    },
    {
      id: 'questions',
      label: 'Question',
      href: '/dashboard/questions',
      customIcon: QuestionDocIcon,
      isActive: pathname.startsWith('/dashboard/questions'),
    },
    {
      id: 'exams',
      label: 'Exams',
      href: '/dashboard/exams',
      icon: ClipboardList,
      isActive: pathname === '/dashboard/exams',
    },
    {
      id: 'assign-exam',
      label: 'Assign Exam to Staff',
      href: '/dashboard/exams/assign',
      icon: ArrowLeftRight,
      badge: '12',
      isActive: pathname.startsWith('/dashboard/exams/assign'),
    },
  ];

  // 3. Reports Sub-items matching the exact screenshot
  const reportsSubItems = [
    {
      id: 'results',
      label: 'Results',
      href: '/dashboard/results',
      icon: BarChart2,
      isActive: pathname.startsWith('/dashboard/results'),
    },
    {
      id: 'certificates',
      label: 'Certificates',
      href: '/dashboard/certificates',
      icon: Award,
      isActive: pathname.startsWith('/dashboard/certificates'),
    },
    {
      id: 'signature-setups',
      label: 'Signature Setups',
      href: '/dashboard/signature-setups',
      icon: PenLine,
      isActive: pathname.startsWith('/dashboard/signature-setups'),
    },
  ];

  const userName = user?.name || (isSuperAdmin ? 'Super Admin' : 'User');
  const userRoleLabel = (user?.role || userRole || 'USER').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  const initials = userName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SA';

  return (
    <aside
      style={{
        width: '260px',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      <div>
        {/* Top Header: NetSom Exam Brand + Close Button */}
        <div
          style={{
            height: '70px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            {/* Custom NetSom Blue Swirl Icon */}
            <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C12.954 4 4 12.954 4 24C4 29.8 6.47 35.03 10.43 38.67L14.67 34.43C11.8 31.74 10 28.08 10 24C10 16.27 16.27 10 24 10C28.08 10 31.74 11.8 34.43 14.67L38.67 10.43C35.03 6.47 29.8 4 24 4Z" fill="#1E3A8A"/>
                <path d="M24 44C35.046 44 44 35.046 44 24C44 18.2 41.53 12.97 37.57 9.33L33.33 13.57C36.2 16.26 38 19.92 38 24C38 31.73 31.73 38 24 38C19.92 38 16.26 36.2 13.57 33.33L9.33 37.57C12.97 41.53 18.2 44 24 44Z" fill="#2563EB"/>
                <path d="M24 16C19.58 16 16 19.58 16 24C16 26.21 16.89 28.21 18.34 29.66L21.17 26.83C20.44 26.1 20 25.1 20 24C20 21.79 21.79 20 24 20C25.1 20 26.1 20.44 26.83 21.17L29.66 18.34C28.21 16.89 26.21 16 24 16Z" fill="#38BDF8"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.1, letterSpacing: '-0.3px' }}>
                NetSom Exam
              </div>
              <div style={{ fontSize: '9px', fontWeight: 800, color: '#2563EB', letterSpacing: '1px', textTransform: 'uppercase', marginTop: '2px' }}>
                EXAM PLATFORM
              </div>
            </div>
          </Link>

          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#475569')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#94A3B8')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* 1. Workspace Dropdown */}
          <div>
            <div
              onClick={() => setWorkspaceOpen(!workspaceOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                background: workspaceOpen || isWorkspacePath ? '#EBF5FF' : 'transparent',
                border: workspaceOpen || isWorkspacePath ? '1px solid #BAE6FD' : '1px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!workspaceOpen && !isWorkspacePath) {
                  (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!workspaceOpen && !isWorkspacePath) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LayoutGrid
                  size={20}
                  color={workspaceOpen || isWorkspacePath ? '#0284C7' : '#64748B'}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: workspaceOpen || isWorkspacePath ? '#0284C7' : '#475569',
                    letterSpacing: '-0.1px',
                  }}
                >
                  Workspace
                </span>
              </div>
              {workspaceOpen ? (
                <ChevronDown size={18} color="#0284C7" style={{ flexShrink: 0 }} />
              ) : (
                <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
              )}
            </div>

            {/* Sub-items with vertical guide tree line */}
            {workspaceOpen && (
              <div
                style={{
                  marginTop: '6px',
                  marginLeft: '16px',
                  paddingLeft: '14px',
                  borderLeft: '2px solid #BAE6FD',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {workspaceSubItems.map((sub) => {
                  const Icon = sub.icon;
                  const CustomIcon = sub.customIcon;
                  const active = sub.isActive;

                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease-in-out',
                        background: active ? '#0284C7' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        fontWeight: active ? 600 : 500,
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = '#F1F5F9';
                          (e.currentTarget as HTMLElement).style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#475569';
                        }
                      }}
                    >
                      {CustomIcon ? (
                        <CustomIcon size={18} color={active ? '#FFFFFF' : '#64748B'} />
                      ) : Icon ? (
                        <Icon size={18} color={active ? '#FFFFFF' : '#64748B'} style={{ flexShrink: 0 }} />
                      ) : null}
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Assessment Dropdown */}
          <div>
            <div
              onClick={() => setAssessmentOpen(!assessmentOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                background: assessmentOpen || isAssessmentPath ? '#EBF5FF' : 'transparent',
                border: assessmentOpen || isAssessmentPath ? '1px solid #BAE6FD' : '1px solid transparent',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                if (!assessmentOpen && !isAssessmentPath) {
                  (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!assessmentOpen && !isAssessmentPath) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ClipboardList
                  size={20}
                  color={assessmentOpen || isAssessmentPath ? '#0284C7' : '#64748B'}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: assessmentOpen || isAssessmentPath ? '#0284C7' : '#475569',
                    letterSpacing: '-0.1px',
                  }}
                >
                  Assessment
                </span>
              </div>
              {assessmentOpen ? (
                <ChevronDown size={18} color="#0284C7" style={{ flexShrink: 0 }} />
              ) : (
                <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
              )}
            </div>

            {/* Assessment Sub-items with vertical guide tree line */}
            {assessmentOpen && (
              <div
                style={{
                  marginTop: '6px',
                  marginLeft: '16px',
                  paddingLeft: '14px',
                  borderLeft: '2px solid #BAE6FD',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {assessmentSubItems.map((sub) => {
                  const Icon = sub.icon;
                  const CustomIcon = sub.customIcon;
                  const active = sub.isActive;

                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease-in-out',
                        background: active ? '#0284C7' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        fontWeight: active ? 600 : 500,
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = '#F1F5F9';
                          (e.currentTarget as HTMLElement).style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#475569';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {CustomIcon ? (
                          <CustomIcon size={18} color={active ? '#FFFFFF' : '#64748B'} />
                        ) : Icon ? (
                          <Icon size={18} color={active ? '#FFFFFF' : '#64748B'} style={{ flexShrink: 0 }} />
                        ) : null}
                        <span>{sub.label}</span>
                      </div>

                      {sub.badge && (
                        <span
                          style={{
                            background: active ? '#FFFFFF' : '#E2953B',
                            color: active ? '#0284C7' : '#FFFFFF',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            lineHeight: 1.2,
                          }}
                        >
                          {sub.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Reports Dropdown matching reference screenshot */}
          <div>
            <div
              onClick={() => setReportsOpen(!reportsOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                background: reportsOpen || isReportsPath ? '#EBF5FF' : 'transparent',
                border: reportsOpen || isReportsPath ? '1px solid #BAE6FD' : '1px solid transparent',
                marginTop: '4px',
              }}
              onMouseEnter={(e) => {
                if (!reportsOpen && !isReportsPath) {
                  (e.currentTarget as HTMLElement).style.background = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (!reportsOpen && !isReportsPath) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart3
                  size={20}
                  color={reportsOpen || isReportsPath ? '#0284C7' : '#64748B'}
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: reportsOpen || isReportsPath ? '#0284C7' : '#475569',
                    letterSpacing: '-0.1px',
                  }}
                >
                  Reports
                </span>
              </div>
              {reportsOpen ? (
                <ChevronDown size={18} color="#0284C7" style={{ flexShrink: 0 }} />
              ) : (
                <ChevronRight size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
              )}
            </div>

            {/* Reports Sub-items with vertical guide tree line */}
            {reportsOpen && (
              <div
                style={{
                  marginTop: '6px',
                  marginLeft: '16px',
                  paddingLeft: '14px',
                  borderLeft: '2px solid #BAE6FD',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {reportsSubItems.map((sub) => {
                  const Icon = sub.icon;
                  const active = sub.isActive;

                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'all 0.15s ease-in-out',
                        background: active ? '#0284C7' : 'transparent',
                        color: active ? '#FFFFFF' : '#475569',
                        fontWeight: active ? 600 : 500,
                        fontSize: '14px',
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = '#F1F5F9';
                          (e.currentTarget as HTMLElement).style.color = '#0F172A';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#475569';
                        }
                      }}
                    >
                      <Icon size={18} color={active ? '#FFFFFF' : '#64748B'} style={{ flexShrink: 0 }} />
                      <span>{sub.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Profile & Logout Section */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid #F1F5F9' }}>
        {/* User Card */}
        <div
          style={{
            background: '#F1F5F9',
            borderRadius: '16px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#38BDF8',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 700,
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={userName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2,
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: '#64748B',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginTop: '2px',
              }}
            >
              {userRoleLabel}
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748B',
            transition: 'all 0.15s ease',
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = '#FEF2F2';
            (e.currentTarget as HTMLElement).style.color = '#DC2626';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = '#64748B';
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
