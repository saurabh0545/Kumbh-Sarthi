import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderTopColor?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  padding = 'md',
  borderTopColor,
  style,
  ...props
}) => {
  const paddingMap = {
    none: '0',
    sm: '12px 16px',
    md: '18px 20px',
    lg: '24px 28px',
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        borderTop: borderTopColor ? `3px solid ${borderTopColor}` : '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(18, 59, 93, 0.05), 0 1px 2px -1px rgba(18, 59, 93, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {(title || action) && (
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            {typeof title === 'string' ? (
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0F172A',
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h3>
            ) : (
              title
            )}
            {subtitle && (
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: paddingMap[padding], flex: 1 }}>{children}</div>
    </div>
  );
};
