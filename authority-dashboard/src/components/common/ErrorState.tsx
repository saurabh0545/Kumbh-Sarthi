import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isBackendOffline?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  isBackendOffline = false,
}) => {
  const displayTitle = isBackendOffline
    ? 'Backend connection unavailable'
    : title || 'Operational Telemetry Interrupted';

  const displayMessage = isBackendOffline
    ? 'FastAPI server connection on port 8001 is currently offline. Please ensure the backend is started via START_BACKEND.bat or START_ALL_SERVICES.bat.'
    : message || 'Failed to retrieve telemetry data. Please verify network connectivity and service status.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 24px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FCA5A5',
        borderRadius: '12px',
        textAlign: 'center',
        gap: '12px',
        margin: '12px 0',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC2626',
        }}
      >
        <AlertCircle size={24} />
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
          {displayTitle}
        </h4>
        <p style={{ fontSize: '13px', color: '#7F1D1D', maxWidth: '480px', lineHeight: 1.5 }}>
          {displayMessage}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw size={14} />}
          style={{
            borderColor: '#F87171',
            color: '#991B1B',
            marginTop: '6px',
            backgroundColor: '#FFFFFF',
          }}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
