import React from 'react';
import { AlertTriangle, Clock, MapPin, Users, CheckCircle, Navigation } from 'lucide-react';
import { EmergencyIncident } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Link } from 'react-router-dom';

interface EmergencyCardProps {
  incident: EmergencyIncident;
  onAssignTeam: (incident: EmergencyIncident) => void;
  onStatusChange: (id: string, status: 'REQUIRED' | 'RESPONDING' | 'RESOLVED') => void;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  incident,
  onAssignTeam,
  onStatusChange,
}) => {
  const statusConfig = {
    REQUIRED: {
      badgeText: 'Response Required',
      variant: 'red' as const,
      borderColor: '#DC2626',
    },
    RESPONDING: {
      badgeText: 'Team Responding',
      variant: 'amber' as const,
      borderColor: '#F59E0B',
    },
    RESOLVED: {
      badgeText: 'Incident Resolved',
      variant: 'green' as const,
      borderColor: '#16A34A',
    },
  }[incident.status] || {
    badgeText: 'Response Required',
    variant: 'red' as const,
    borderColor: '#DC2626',
  };

  const [lat, lng] = incident.coordinates || [19.9975, 73.7910];

  return (
    <Card padding="md" borderTopColor={statusConfig.borderColor}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.04em',
              }}
            >
              {incident.id}
            </span>
            <Badge variant={statusConfig.variant} size="sm">
              {statusConfig.badgeText}
            </Badge>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            {incident.type.replace('_', ' ')} EMERGENCY
          </h4>
        </div>

        <span style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={13} />
          {incident.reportedAt}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '10px 0 14px' }}>
        {incident.senderName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#1E3A8A' }}>
            <Users size={14} color="#1E3A8A" />
            <span>Sender: <strong>{incident.senderName}</strong> {incident.callerContact ? `(${incident.callerContact})` : ''}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
          <MapPin size={14} color="#F47C20" />
          <span>Location: <strong>{incident.location}</strong></span>
        </div>

        {incident.coordinates && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#059669', fontWeight: 600 }}>
            <Navigation size={13} color="#059669" />
            <span>GPS: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E</span>
          </div>
        )}

        {incident.assignedTeam && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155' }}>
            <Users size={14} color="#123B5D" />
            <span>Assigned Team: <strong>{incident.assignedTeam}</strong></span>
          </div>
        )}

        {incident.notes && (
          <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.4, marginTop: '2px' }}>
            {incident.notes}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          paddingTop: '10px',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <Link
          to={`/live-map?lat=${lat}&lng=${lng}&id=${incident.id}&type=${encodeURIComponent(incident.type)}&sender=${encodeURIComponent(incident.senderName || incident.callerContact || 'Pilgrim')}&location=${encodeURIComponent(incident.location)}&zone=${incident.zone}`}
          style={{ textDecoration: 'none' }}
        >
          <Button
            variant="primary"
            size="sm"
            icon={<Navigation size={13} />}
            style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}
          >
            Locate Sender on Map
          </Button>
        </Link>

        {incident.status === 'REQUIRED' && (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={<Users size={13} />}
              onClick={() => onAssignTeam(incident)}
            >
              Assign Team
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={() => onStatusChange(incident.id, 'RESPONDING')}
            >
              Mark Responding
            </Button>
          </>
        )}

        {incident.status === 'RESPONDING' && (
          <Button
            variant="success"
            size="sm"
            icon={<CheckCircle size={13} />}
            onClick={() => {
              if (window.confirm('Confirm that this emergency incident is completely resolved?')) {
                onStatusChange(incident.id, 'RESOLVED');
              }
            }}
          >
            Mark Resolved
          </Button>
        )}
      </div>
    </Card>
  );
};
