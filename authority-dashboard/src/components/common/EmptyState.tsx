import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '12px',
        color: '#64748B',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#94A3B8',
        }}
      >
        {icon || <ShieldAlert size={24} />}
      </div>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
          {title}
        </h4>
        {description && (
          <p style={{ fontSize: '13px', color: '#64748B', maxWidth: '380px', lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: '6px' }}>{action}</div>}
    </div>
  );
};
