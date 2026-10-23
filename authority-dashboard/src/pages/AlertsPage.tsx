import React, { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertCard } from '../components/alerts/AlertCard';
import { AlertDetailModal } from '../components/alerts/AlertDetailModal';
import { BroadcastModal } from '../components/alerts/BroadcastModal';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { BellRing, Send, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AlertItem } from '../types';

export const AlertsPage: React.FC = () => {
  const { alerts, isLoading, isOffline, refetch, broadcastAlert, resolveAlert } = useAlerts(4000);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'WARNING') return a.severity === 'WARNING';
    if (filter === 'INFO') return a.severity === 'INFO';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Alert Center
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            Public safety advisories, high crowd alerts, and incident warnings broadcast across the Mela.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            icon={<RefreshCw size={14} />}
          >
            Sync Alerts
          </Button>

          <Button
            variant="saffron"
            size="sm"
            onClick={() => setIsBroadcastOpen(true)}
            icon={<Send size={14} />}
          >
            Broadcast New Advisory
          </Button>
        </div>
      </div>

      {isOffline && (
        <ErrorState
          isBackendOffline={true}
          onRetry={refetch}
        />
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          width: 'fit-content',
        }}
      >
        {[
          { id: 'ALL', label: `All Alerts (${alerts.length})` },
          { id: 'CRITICAL', label: 'Critical' },
          { id: 'WARNING', label: 'Warning' },
          { id: 'INFO', label: 'Information' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            style={{
              border: 'none',
              background: filter === item.id ? '#123B5D' : 'transparent',
              color: filter === item.id ? '#FFFFFF' : '#475569',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Alerts Stream List */}
      {isLoading ? (
        <LoadingSpinner message="Loading operational safety alerts..." />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          title="No Active Alerts"
          description="There are currently no active safety advisories matching this filter. All monitored sectors are operating normally."
          action={
            <Button variant="saffron" size="sm" onClick={() => setIsBroadcastOpen(true)} icon={<Send size={13} />}>
              Broadcast Advisory
            </Button>
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onResolve={resolveAlert}
              onSelect={(a) => {
                setSelectedAlert(a);
                setIsDetailOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Incident Detail Modal */}
      <AlertDetailModal
        isOpen={isDetailOpen}
        alert={selectedAlert}
        onClose={() => setIsDetailOpen(false)}
        onResolve={resolveAlert}
      />

      {/* Broadcast Modal */}
      <BroadcastModal
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcast={broadcastAlert}
      />
    </div>
  );
};
