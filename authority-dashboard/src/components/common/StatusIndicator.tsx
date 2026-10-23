import React from 'react';

interface StatusIndicatorProps {
  status: 'ONLINE' | 'OFFLINE' | 'CRITICAL' | 'WARNING' | 'STANDBY';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
}) => {
  const colorMap = {
    ONLINE: '#16A34A',
    OFFLINE: '#94A3B8',
    CRITICAL: '#DC2626',
    WARNING: '#F59E0B',
    STANDBY: '#3B82F6',
  };

  const dotSize = size === 'sm' ? 6 : 8;
  const activeColor = colorMap[status] || '#94A3B8';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 600,
        color: '#334155',
      }}
    >
      <span
        style={{
          width: `${dotSize}px`,
          height: `${dotSize}px`,
          borderRadius: '50%',
          backgroundColor: activeColor,
          boxShadow: status === 'ONLINE' || status === 'CRITICAL' ? `0 0 0 2px ${activeColor}33` : 'none',
          animation: status === 'ONLINE' || status === 'CRITICAL' ? 'pulseGlow 2s infinite' : 'none',
        }}
      />
      {label || status}
    </span>
  );
};
