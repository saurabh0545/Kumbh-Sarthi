import React, { useState } from 'react';
import { AlertCircle, RefreshCw, Cloud, X } from 'lucide-react';
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
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // If simply offline/standby (e.g. running on Vercel without local laptop tunnel)
  if (isBackendOffline) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#F0F9FF',
          border: '1px solid #BAE6FD',
          borderRadius: '10px',
          margin: '8px 0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#E0F2FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
              flexShrink: 0,
            }}
          >
            <Cloud size={18} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0369A1' }}>
              Cloud Operations Active (Firebase Synchronized)
            </div>
            <div style={{ fontSize: '12px', color: '#0C4A6E', marginTop: '1px' }}>
              Maps, SOS alerts, and Lost & Found are live. Laptop AI video stream on port 8001 is in standby.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#0369A1',
                backgroundColor: '#FFFFFF',
                border: '1px solid #7DD3FC',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={11} /> Check Connection
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss banner"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  // Standard actual error state
  const displayTitle = title || 'Operational Telemetry Interrupted';
  const displayMessage = message || 'Failed to retrieve telemetry data. Please verify network connectivity and service status.';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 20px',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FCA5A5',
        borderRadius: '12px',
        textAlign: 'center',
        gap: '10px',
        margin: '12px 0',
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC2626',
        }}
      >
        <AlertCircle size={22} />
      </div>

      <div>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B', marginBottom: '2px' }}>
          {displayTitle}
        </h4>
        <p style={{ fontSize: '12px', color: '#7F1D1D', maxWidth: '440px', lineHeight: 1.4 }}>
          {displayMessage}
        </p>
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={<RefreshCw size={13} />}
          style={{
            borderColor: '#F87171',
            color: '#991B1B',
            marginTop: '4px',
            backgroundColor: '#FFFFFF',
          }}
        >
          Retry
        </Button>
      )}
    </div>
  );
};
