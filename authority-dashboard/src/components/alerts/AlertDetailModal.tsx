import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { AlertItem } from '../../types';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  MapPin,
  Clock,
  Shield,
  Activity,
  CheckCircle2,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { INITIAL_ZONES } from '../../constants/zones';

interface AlertDetailModalProps {
  isOpen: boolean;
  alert: AlertItem | null;
  onClose: () => void;
  onResolve?: (id: number) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  isOpen,
  alert,
  onClose,
  onResolve,
}) => {
  if (!alert) return null;

  const severityConfig = {
    CRITICAL: {
      variant: 'red' as const,
      icon: AlertCircle,
      color: '#DC2626',
      bg: '#FEF2F2',
      label: 'CRITICAL PRIORITY',
    },
    WARNING: {
      variant: 'amber' as const,
      icon: AlertTriangle,
      color: '#F59E0B',
      bg: '#FFFBEB',
      label: 'WARNING ADVISORY',
    },
    INFO: {
      variant: 'blue' as const,
      icon: Info,
      color: '#2563EB',
      bg: '#EFF6FF',
      label: 'INFORMATIONAL',
    },
  }[alert.severity] || {
    variant: 'blue' as const,
    icon: Info,
    color: '#64748B',
    bg: '#F8FAFC',
    label: 'GENERAL',
  };

  const Icon = severityConfig.icon;

  const handleResolve = () => {
    if (onResolve) {
      onResolve(alert.id);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Incident & Alert Advisory Dossier"
      subtitle={`Operational ID #${alert.id} • Real-time telemetry broadcast to pilgrims & commanders`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Banner with Severity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: severityConfig.bg,
            borderRadius: '10px',
            border: `1px solid ${severityConfig.color}30`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icon size={22} color={severityConfig.color} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: severityConfig.color }}>
                {severityConfig.label}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Classification: {alert.type} • Status: {alert.is_read ? 'Acknowledged' : 'Active Broadcast'}
              </div>
            </div>
          </div>
          <Badge variant={severityConfig.variant} size="md">
            {alert.severity}
          </Badge>
        </div>

        {/* Title and Message */}
        <div>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
            {alert.title}
          </h3>
          <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
            {alert.message}
          </p>
        </div>

        {/* Incident Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            backgroundColor: '#F8FAFC',
            padding: '14px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="#F47C20" />
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>LOCATION / SECTOR</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                {alert.location || 'Central Nashik Mela'} {alert.zone ? `(${alert.zone})` : ''}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#2563EB" />
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>LOGGED AT</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                {alert.created_at || 'Just now'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={16} color="#16A34A" />
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>SOURCE FEED</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
                {alert.type === 'CROWD' ? 'YOLO v11 Optical Vision' : 'Command Center Dispatch'}
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Authority Actions */}
        <div>
          <h4
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '8px',
            }}
          >
            Recommended Mitigation Protocol
          </h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '13px',
              color: '#334155',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={14} color="#16A34A" />
              <span>Divert incoming pedestrian corridors to designated bypass avenues.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={14} color="#2563EB" />
              <span>Verify crowd density counter via live CCTV stream.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={14} color="#F59E0B" />
              <span>Broadcast audio directions across local sector speakers.</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            paddingTop: '12px',
            borderTop: '1px solid #E2E8F0',
            marginTop: '6px',
          }}
        >
          {alert.zone && (() => {
            const matchedZone = INITIAL_ZONES.find((z) => z.gateCode === alert.zone || z.id === alert.zone);
            const lat = matchedZone ? matchedZone.coordinates[0] : 19.9984;
            const lng = matchedZone ? matchedZone.coordinates[1] : 73.7915;
            return (
              <Link
                to={`/live-map?zone=${alert.zone}&lat=${lat}&lng=${lng}&id=ALERT-${alert.id}&name=${encodeURIComponent(alert.title)}&location=${encodeURIComponent(alert.location || 'Kumbh Sector')}`}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="outline" size="sm" icon={<ExternalLink size={13} />}>
                  Locate on Live Map
                </Button>
              </Link>
            );
          })()}

          {onResolve && (
            <Button
              variant="saffron"
              size="sm"
              onClick={handleResolve}
              icon={<CheckCircle2 size={13} />}
            >
              Mark Incident Resolved
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
