import React from 'react';
import { FamilySosItem } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CheckCircle2, MapPin, Eye, Shield } from 'lucide-react';
import { familyService } from '../../services/familyService';
import { Link } from 'react-router-dom';

interface FamilySosTableProps {
  sosList: FamilySosItem[];
  onResolve: (id: number) => void;
  onViewLocation?: (sos: FamilySosItem) => void;
}

export const FamilySosTable: React.FC<FamilySosTableProps> = ({
  sosList,
  onResolve,
  onViewLocation,
}) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          textAlign: 'left',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: '#F8FAFC',
              borderBottom: '2px solid #E2E8F0',
              color: '#475569',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <th style={{ padding: '12px 16px' }}>SOS ID</th>
            <th style={{ padding: '12px 16px' }}>Pilgrim / Family</th>
            <th style={{ padding: '12px 16px' }}>Reported Sector</th>
            <th style={{ padding: '12px 16px' }}>Broadcast Time</th>
            <th style={{ padding: '12px 16px' }}>Status</th>
            <th style={{ padding: '12px 16px' }}>Assigned Rescue Unit</th>
            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sosList.map((sos) => {
            const isResolved = sos.status === 'RESOLVED';
            const maskedName = familyService.maskPilgrimName(sos.user_name);

            return (
              <tr
                key={sos.id}
                style={{
                  borderBottom: '1px solid #E2E8F0',
                  backgroundColor: !isResolved ? '#FFFDF5' : '#FFFFFF',
                  transition: 'background 0.15s ease',
                }}
              >
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#123B5D' }}>
                  #{sos.id}
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#0F172A' }}>{maskedName}</div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                    Group: {sos.family_name || `Family Group #${sos.family_id}`}
                  </div>
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#334155' }}>
                    <MapPin size={13} color="#F47C20" />
                    <span>{sos.location_name || 'Ramkund Vicinity'}</span>
                  </div>
                  {sos.latitude && sos.longitude ? (
                    <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                      📍 GPS: {sos.latitude.toFixed(5)}° N, {sos.longitude.toFixed(5)}° E
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Sector Area Reported (Ramkund Vicinity)
                    </div>
                  )}
                </td>

                <td style={{ padding: '14px 16px', color: '#475569' }}>
                  {sos.created_at}
                </td>

                <td style={{ padding: '14px 16px' }}>
                  <Badge variant={isResolved ? 'green' : 'red'} pulse={!isResolved} size="sm">
                    {sos.status}
                  </Badge>
                </td>

                <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 500 }}>
                  {sos.assigned_team || 'Quick Response Team 2'}
                </td>

                <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    <Link
                      to={`/live-map?lat=${sos.latitude || 19.9975}&lng=${sos.longitude || 73.7910}&id=SOS-${sos.id}&sender=${encodeURIComponent(sos.user_name)}&location=${encodeURIComponent(sos.location_name || 'Ramkund Vicinity')}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button variant="outline" size="sm" icon={<MapPin size={12} color="#DC2626" />}>
                        Locate Sender
                      </Button>
                    </Link>

                    {!isResolved && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={<CheckCircle2 size={12} />}
                        onClick={() => {
                          if (window.confirm('Confirm that this family member is safe and resolved?')) {
                            onResolve(sos.id);
                          }
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
