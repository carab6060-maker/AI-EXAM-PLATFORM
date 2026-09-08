'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building,
  Users,
  Layers,
  BookOpen,
  HelpCircle,
  Sparkles,
  FileCheck,
  Calendar,
  Award,
  BarChart3,
  ShieldAlert,
  Settings,
  GraduationCap,
  Briefcase,
  SearchCheck,
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
      title: 'OVERVIEW',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    ...(isCompanyAdmin
      ? [
          {
            title: 'ORGANIZATION',
            items: [
              ...(isSuperAdmin
                ? [{ href: '/dashboard/companies', label: 'Companies (Tenants)', icon: Building }]
                : []),
              { href: '/dashboard/employees', label: 'Employees Directory', icon: Users },
            ],
          },
          {
            title: 'ASSESSMENT ENGINE',
            items: [
              { href: '/dashboard/subjects', label: 'Subjects & Topics', icon: BookOpen },
              { href: '/dashboard/questions', label: 'Question Bank', icon: HelpCircle },
              { href: '/dashboard/exams', label: 'Exams & Builder', icon: FileCheck },
              { href: '/dashboard/results', label: 'Assessment Results', icon: BarChart3 },
            ],
          },
        ]
      : []),
    ...(isEmployee
      ? [
          {
            title: 'MY ASSESSMENTS',
            items: [
              { href: '/dashboard/exams', label: 'My Exams', icon: FileCheck },
              { href: '/dashboard/results', label: 'My Results & Scores', icon: BarChart3 },
            ],
          },
        ]
      : []),
    {
      title: 'TRAINING & CERTS',
      items: [
        { href: '/dashboard/training', label: 'AI Training Roadmap', icon: GraduationCap },
        { href: '/dashboard/certificates', label: 'Certificates', icon: Award },
        { href: '/verify/CERT-DAHAB-2026-00042', label: 'Public Verification', icon: SearchCheck, target: '_blank' },
      ],
    },
    ...(isCompanyAdmin
      ? [
          {
            title: 'ANALYTICS & AUDIT',
            items: [
              { href: '/dashboard/reports', label: 'Reports & Export', icon: BarChart3 },
              { href: '/dashboard/audit-logs', label: 'Audit Security Logs', icon: ShieldAlert },
              { href: '/dashboard/settings', label: 'Company Settings', icon: Settings },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside className="w-64 bg-[#0A1128] text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col border-r border-slate-800/80 shrink-0">
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            <p className="px-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.target || undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-[#070D1E]">
        <div className="p-3 bg-slate-900/80 border border-slate-750 rounded-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Copilot Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Adaptive employee telemetry and question synthesis active.
          </p>
        </div>
      </div>
    </aside>
  );
}
