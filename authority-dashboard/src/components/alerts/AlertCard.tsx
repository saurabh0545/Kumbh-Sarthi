import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, MapPin, Check } from 'lucide-react';
import { AlertItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
  onSelect?: (alert: AlertItem) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onResolve,
  onSelect,
}) => {
  const severityConfig = {
    CRITICAL: {
      variant: 'red' as const,
      icon: AlertCircle,
      borderColor: '#DC2626',
      bgLight: '#FEF2F2',
    },
    WARNING: {
      variant: 'amber' as const,
      icon: AlertTriangle,
      borderColor: '#F59E0B',
      bgLight: '#FFFBEB',
    },
    INFO: {
      variant: 'blue' as const,
      icon: Info,
      borderColor: '#2563EB',
      bgLight: '#EFF6FF',
    },
  }[alert.severity] || {
    variant: 'blue' as const,
    icon: Info,
    borderColor: '#64748B',
    bgLight: '#F8FAFC',
  };

  const Icon = severityConfig.icon;

  return (
    <Card
      padding="md"
      borderTopColor={severityConfig.borderColor}
      style={{
        backgroundColor: alert.is_read ? '#FFFFFF' : severityConfig.bgLight,
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={20} color={severityConfig.borderColor} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <Badge variant={severityConfig.variant} size="sm">
                {alert.severity}
              </Badge>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#64748B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {alert.type}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>•</span>
              <span style={{ fontSize: '12px', color: '#64748B' }}>{alert.created_at}</span>
            </div>

            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0F172A',
                marginBottom: '4px',
              }}
            >
              {alert.title}
            </h4>

            <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.5, marginBottom: '8px' }}>
              {alert.message}
            </p>

            {(alert.location || alert.zone) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 500,
                }}
              >
                <MapPin size={13} color="#F47C20" />
                <span>
                  {alert.location || 'Nashik Mela'} {alert.zone ? `(${alert.zone})` : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '100px' }}>
          {onSelect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect(alert)}
              style={{ width: '100%', borderColor: '#CBD5E1', color: '#1E293B', fontWeight: 700 }}
            >
              View Details
            </Button>
          )}

          {alert.zone && (
            <Link
              to={`/live-map?zone=${alert.zone}`}
              style={{
                textDecoration: 'none',
              }}
            >
              <Button
                variant={alert.severity === 'CRITICAL' || alert.type === 'EMERGENCY' ? 'saffron' : 'outline'}
                size="sm"
                style={{ width: '100%' }}
              >
                Locate on Map
              </Button>
            </Link>
          )}

          {onAcknowledge && !alert.is_read && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAcknowledge(alert.id)}
              icon={<Check size={13} />}
              style={{ width: '100%' }}
            >
              Acknowledge
            </Button>
          )}

          {onResolve && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResolve(alert.id)}
              icon={<CheckCircle2 size={13} color="#16A34A" />}
              style={{ width: '100%', borderColor: '#86EFAC', color: '#15803D' }}
            >
              Resolve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
