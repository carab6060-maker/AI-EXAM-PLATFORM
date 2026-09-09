import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export const CARD_GRADIENTS = {
  blue:   { bg: 'linear-gradient(135deg,#E8F4FD,#C8E6FA)', icon: '#2196F3', iconBg: 'rgba(33,150,243,0.15)', text: '#1565C0', sub: '#42A5F5' },
  orange: { bg: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)', icon: '#FF9800', iconBg: 'rgba(255,152,0,0.15)',   text: '#E65100', sub: '#FFA726' },
  purple: { bg: 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', icon: '#9C27B0', iconBg: 'rgba(156,39,176,0.15)', text: '#6A1B9A', sub: '#AB47BC' },
  green:  { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', icon: '#4CAF50', iconBg: 'rgba(76,175,80,0.15)',   text: '#1B5E20', sub: '#66BB6A' },
  red:    { bg: 'linear-gradient(135deg,#FFF3F3,#FFCDD2)', icon: '#F44336', iconBg: 'rgba(244,67,54,0.15)',   text: '#B71C1C', sub: '#EF5350' },
  pink:   { bg: 'linear-gradient(135deg,#FCE4EC,#F8BBD0)', icon: '#E91E63', iconBg: 'rgba(233,30,99,0.15)',   text: '#880E4F', sub: '#F06292' },
  cyan:   { bg: 'linear-gradient(135deg,#E0F7FA,#B2EBF2)', icon: '#00BCD4', iconBg: 'rgba(0,188,212,0.15)',   text: '#006064', sub: '#26C6DA' },
  amber:  { bg: 'linear-gradient(135deg,#FFFDE7,#FFF9C4)', icon: '#FFC107', iconBg: 'rgba(255,193,7,0.15)',   text: '#E65100', sub: '#FFCA28' },
};

export type CardGradientKey = keyof typeof CARD_GRADIENTS;

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  gradient?: CardGradientKey;
  iconBgColor?: string;
  iconColor?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  change,
  isPositive = true,
  icon: Icon,
  gradient = 'blue',
}: StatsCardProps) {
  const theme = CARD_GRADIENTS[gradient] || CARD_GRADIENTS.blue;

  return (
    <div
      style={{
        background: theme.bg,
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: '16px',
        padding: '22px 20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(-2px)';
        el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'translateY(0)';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: theme.sub, margin: '0 0 8px' }}>{title}</p>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: theme.text, margin: '0 0 4px', letterSpacing: '-0.5px', lineHeight: 1 }}>{value}</h3>
          {subtitle && <p style={{ fontSize: '11px', color: theme.sub, margin: 0, fontWeight: 500 }}>{subtitle}</p>}
        </div>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: theme.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={theme.icon} />
        </div>
      </div>

      {change && (
        <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 700, background: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isPositive ? '#047857' : '#DC2626', borderRadius: '6px', padding: '2px 8px' }}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />} {change}
          </span>
          <span style={{ fontSize: '11px', color: theme.sub, fontWeight: 500 }}>vs benchmark</span>
        </div>
      )}
    </div>
  );
}
