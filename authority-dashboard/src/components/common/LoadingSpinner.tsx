import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string; size?: number }> = ({
  message = 'Loading operational telemetry...',
  size = 32,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: '14px',
        color: '#64748B',
      }}
    >
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '3px solid #E2E8F0',
          borderTopColor: '#F47C20',
          borderRightColor: '#123B5D',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && <p style={{ fontSize: '13px', fontWeight: 500 }}>{message}</p>}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
