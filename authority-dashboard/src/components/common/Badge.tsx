import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'navy' | 'gray' | 'saffron';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  pulse = false,
}) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    green: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
    amber: { bg: '#FEF3C7', text: '#B45309', border: '#FCD34D' },
    red: { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
    blue: { bg: '#DBEAFE', text: '#1D4ED8', border: '#93C5FD' },
    navy: { bg: '#E0E7FF', text: '#123B5D', border: '#C7D2FE' },
    saffron: { bg: 'rgba(244, 124, 32, 0.12)', text: '#D9650E', border: 'rgba(244, 124, 32, 0.3)' },
    gray: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  };

  const current = styles[variant] || styles.gray;
  const padding = size === 'sm' ? '2px 7px' : '4px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.border}`,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
      }}
    >
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: current.text,
            animation: 'pulseGlow 1.5s infinite ease-in-out',
          }}
        />
      )}
      {children}
    </span>
  );
};
