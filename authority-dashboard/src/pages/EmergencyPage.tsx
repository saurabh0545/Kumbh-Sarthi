import React, { useState, useEffect } from 'react';
import { emergencyService, INITIAL_INCIDENTS } from '../services/emergencyService';
import { firebaseDashboardService } from '../services/firebaseService';
import { EmergencyIncident } from '../types';
import { EmergencyCard } from '../components/emergency/EmergencyCard';
import { TeamDispatchModal } from '../components/emergency/TeamDispatchModal';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  AlertTriangle,
  Users,
  Shield,
  HeartPulse,
  Truck,
  Plus,
  RefreshCw,
} from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(emergencyService.getIncidents());
  const [selectedIncidentForDispatch, setSelectedIncidentForDispatch] = useState<EmergencyIncident | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'REQUIRED' | 'RESPONDING' | 'RESOLVED'>('ALL');

  // Real-time Firestore sync: updates instantly whenever a pilgrim presses SOS in mobile app!
  useEffect(() => {
    const unsubscribe = firebaseDashboardService.subscribeToLiveSos((fbEmergencies) => {
      if (fbEmergencies && fbEmergencies.length > 0) {
        setIncidents((prev) => {
          const map = new Map<string, EmergencyIncident>();
          fbEmergencies.forEach((item) => map.set(item.id, item));
          prev.forEach((item) => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          return Array.from(map.values());
        });
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleStatusChange = (id: string, status: 'REQUIRED' | 'RESPONDING' | 'RESOLVED') => {
    firebaseDashboardService.updateSosStatus(id, status);
    const updated = emergencyService.updateIncidentStatus(id, status);
    setIncidents(updated);
  };

  const handleDispatchTeam = (incidentId: string, teamName: string) => {
    firebaseDashboardService.updateSosStatus(incidentId, 'RESPONDING', teamName);
    const updated = emergencyService.updateIncidentStatus(incidentId, 'RESPONDING', teamName);
    setIncidents(updated);
  };

  const filteredIncidents = incidents.filter((item) => {
    if (filter === 'REQUIRED') return item.status === 'REQUIRED';
    if (filter === 'RESPONDING') return item.status === 'RESPONDING';
    if (filter === 'RESOLVED') return item.status === 'RESOLVED';
    return true;
  });

  const activeCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Emergency Response Center
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            Field incident dispatch, medical triage coordination, and rapid police deployment.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge variant={activeCount > 0 ? 'red' : 'green'} pulse={activeCount > 0}>
            {activeCount} ACTIVE INCIDENTS
          </Badge>
        </div>
      </div>

      {/* Emergency Units Stat Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {[
          { label: 'Active Emergencies', value: String(activeCount).padStart(2, '0'), icon: AlertTriangle, color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Police Teams Deployed', value: '14 Squads', icon: Shield, color: '#1E3A8A', bg: '#DBEAFE' },
          { label: 'Medical Teams Active', value: '08 Units', icon: HeartPulse, color: '#059669', bg: '#DCFCE7' },
          { label: 'Ambulances on Standby', value: '12 Staged', icon: Truck, color: '#D97706', bg: '#FEF3C7' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                    {item.value}
                  </div>
                </div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Incident Status Filters */}
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
          { id: 'ALL', label: `All Incidents (${incidents.length})` },
          { id: 'REQUIRED', label: 'Response Required' },
          { id: 'RESPONDING', label: 'Teams Responding' },
          { id: 'RESOLVED', label: 'Resolved' },
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

      {/* Incident Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '18px',
        }}
      >
        {filteredIncidents.map((incident) => (
          <EmergencyCard
            key={incident.id}
            incident={incident}
            onAssignTeam={(inc) => setSelectedIncidentForDispatch(inc)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Team Dispatch Modal */}
      <TeamDispatchModal
        isOpen={Boolean(selectedIncidentForDispatch)}
        onClose={() => setSelectedIncidentForDispatch(null)}
        incident={selectedIncidentForDispatch}
        onDispatch={handleDispatchTeam}
      />
    </div>
  );
};
