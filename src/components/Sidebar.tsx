'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  Users,
  BookOpen,
  HelpCircle,
  FileCheck,
  Calendar,
  Award,
  BarChart3,
  ShieldAlert,
  Settings,
  GraduationCap,
  SearchCheck,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole = 'EMPLOYEE' }: SidebarProps) {
  const pathname = usePathname();

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCompanyAdmin = ['COMPANY_ADMIN', 'HR_MANAGER', 'TRAINING_MANAGER', 'SUPER_ADMIN'].includes(userRole);
  const isEmployee = userRole === 'EMPLOYEE';

  const navSections = [
    {
      title: 'Overview',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#3B82F6' },
      ],
    },
    ...(isCompanyAdmin
      ? [
          {
            title: 'Organisation',
            items: [
              ...(isSuperAdmin
                ? [{ href: '/dashboard/companies', label: 'Companies', icon: Building, color: '#8B5CF6' }]
                : []),
              { href: '/dashboard/employees', label: 'Employees', icon: Users, color: '#10B981' },
            ],
          },
          {
            title: 'Assessment',
            items: [
              { href: '/dashboard/subjects', label: 'Subjects & Topics', icon: BookOpen, color: '#F59E0B' },
              { href: '/dashboard/questions', label: 'Question Bank', icon: HelpCircle, color: '#EF4444' },
              { href: '/dashboard/exams', label: 'Exams & Builder', icon: FileCheck, color: '#3B82F6' },
              { href: '/dashboard/results', label: 'Results', icon: BarChart3, color: '#10B981' },
            ],
          },
        ]
      : []),
    ...(isEmployee
      ? [
          {
            title: 'My Assessments',
            items: [
              { href: '/dashboard/exams', label: 'My Exams', icon: FileCheck, color: '#3B82F6' },
              { href: '/dashboard/results', label: 'My Results', icon: BarChart3, color: '#10B981' },
            ],
          },
        ]
      : []),
    {
      title: 'Training & Certs',
      items: [
        { href: '/dashboard/training', label: 'AI Training Roadmap', icon: GraduationCap, color: '#8B5CF6' },
        { href: '/dashboard/certificates', label: 'Certificates', icon: Award, color: '#F59E0B' },
        { href: '/verify/CERT-DAHAB-2026-00042', label: 'Public Verify', icon: SearchCheck, color: '#10B981', target: '_blank' },
      ],
    },
    ...(isCompanyAdmin
      ? [
          {
            title: 'Analytics & Admin',
            items: [
              { href: '/dashboard/reports', label: 'Reports & Export', icon: BarChart3, color: '#3B82F6' },
              { href: '/dashboard/audit-logs', label: 'Audit Logs', icon: ShieldAlert, color: '#EF4444' },
              { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: '#64748B' },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside style={{ width: '240px', background: '#fff', borderRight: '1px solid #E2E8F0', minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '24px' }}>
            <p style={{ padding: '0 10px', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              {section.title}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={(item as any).target || undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 10px',
                      borderRadius: '9px',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      textDecoration: 'none',
                      transition: 'all 0.15s',
                      background: isActive ? '#EFF6FF' : 'transparent',
                      color: isActive ? '#1D4ED8' : '#475569',
                      borderLeft: isActive ? `3px solid #3B82F6` : '3px solid transparent',
                    }}
                  >
                    <Icon size={15} color={isActive ? '#3B82F6' : item.color} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* AI Status Badge */}
      <div style={{ padding: '12px', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} /> AI Copilot Active
            </span>
          </div>
          <p style={{ fontSize: '10px', color: '#059669', lineHeight: 1.4, margin: 0 }}>
            Adaptive exam engine online.
          </p>
        </div>
      </div>
    </aside>
  );
}

