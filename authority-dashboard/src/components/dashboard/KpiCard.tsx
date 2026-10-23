import React from 'react';
import { Card } from '../common/Card';

interface KpiCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: React.ReactNode;
  statusColor?: 'green' | 'amber' | 'red' | 'blue' | 'navy';
  isLive?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  sublabel,
  icon,
  statusColor = 'navy',
  isLive = false,
}) => {
  const colorMap = {
    green: { text: '#15803D', bg: '#DCFCE7', border: '#16A34A' },
    amber: { text: '#B45309', bg: '#FEF3C7', border: '#F59E0B' },
    red: { text: '#B91C1C', bg: '#FEE2E2', border: '#DC2626' },
    blue: { text: '#1D4ED8', bg: '#DBEAFE', border: '#2563EB' },
    navy: { text: '#123B5D', bg: '#F1F5F9', border: '#123B5D' },
  };

  const currentTheme = colorMap[statusColor];

  return (
    <Card padding="md" style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
            {isLive && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#15803D',
                  backgroundColor: '#DCFCE7',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}
              >
                LIVE
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.03em',
              margin: '6px 0 2px',
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>
          {sublabel && (
            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
              {sublabel}
            </p>
          )}
        </div>

        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: currentTheme.bg,
            color: currentTheme.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
};
