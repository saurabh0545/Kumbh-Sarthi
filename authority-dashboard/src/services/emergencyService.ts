import { apiFetch, ApiResponse } from './api';
import { EmergencyIncident } from '../types';

export interface EmergencyStats {
  activeEmergencies: number;
  policeTeamsDeployed: number;
  medicalTeamsActive: number;
  ambulancesOnStandby: number;
}

export const INITIAL_INCIDENTS: EmergencyIncident[] = [
  {
    id: 'INC-2026-081',
    type: 'MEDICAL',
    location: 'Gate 2 — Tapovan Transit Plaza',
    zone: 'Gate-B',
    coordinates: [19.9928, 73.8052],
    reportedAt: '3 minutes ago',
    status: 'REQUIRED',
    severity: 'CRITICAL',
    assignedTeam: 'Unassigned',
    callerContact: '+91 98230 XXXXX',
    senderName: 'Sunil Deshmukh (Pilgrim)',
    notes: 'Elderly pilgrim experiencing dehydration and dizziness near bus transit gate.',
  },
  {
    id: 'INC-2026-080',
    type: 'CROWD_SURGE',
    location: 'Gate 3 — Godavari North Ghat Approach',
    zone: 'Gate-C',
    coordinates: [20.0001, 73.7928],
    reportedAt: '12 minutes ago',
    status: 'RESPONDING',
    severity: 'WARNING',
    assignedTeam: 'Rapid Crowd Marshall Unit 3',
    callerContact: 'Internal Radio Ch-4',
    senderName: 'Sector Marshall Unit 3',
    notes: 'Narrow passage backing up due to flower vendor blockade. Marshalls redirecting crowd to bypass lane.',
  },
  {
    id: 'INC-2026-079',
    type: 'LOST_CHILD',
    location: 'Gate 1 — Ramkund Main Steps',
    zone: 'Gate-A',
    coordinates: [19.9984, 73.7915],
    reportedAt: '25 minutes ago',
    status: 'RESPONDING',
    severity: 'WARNING',
    assignedTeam: 'Child Welfare Helpdesk 1',
    callerContact: '+91 94211 XXXXX',
    senderName: 'Pooja Kulkarni (Mother)',
    notes: '7-year-old child separated from family near changing room pavilion. Announcements underway.',
  },
  {
    id: 'INC-2026-078',
    type: 'MEDICAL',
    location: 'Gate 5 — Laxman Kund Promenade',
    zone: 'Gate-E',
    coordinates: [19.9965, 73.7932],
    reportedAt: '45 minutes ago',
    status: 'RESOLVED',
    severity: 'INFO',
    assignedTeam: 'Civil Hospital Unit 2',
    callerContact: 'Helpdesk 4',
    senderName: 'Helpdesk 4 Officer',
    notes: 'Minor ankle sprain treated with cold compression. Pilgrim accompanied to rest kiosk.',
  },
];

export const emergencyService = {
  getIncidents(): EmergencyIncident[] {
    const cached = localStorage.getItem('ksa_emergency_incidents');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fallback
      }
    }
    return INITIAL_INCIDENTS;
  },

  saveIncidents(incidents: EmergencyIncident[]): void {
    localStorage.setItem('ksa_emergency_incidents', JSON.stringify(incidents));
  },

  updateIncidentStatus(
    id: string,
    status: 'REQUIRED' | 'RESPONDING' | 'RESOLVED',
    assignedTeam?: string
  ): EmergencyIncident[] {
    const list = this.getIncidents();
    const updated = list.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          assignedTeam: assignedTeam || item.assignedTeam,
        };
      }
      return item;
    });
    this.saveIncidents(updated);
    return updated;
  },

  addIncident(incident: Omit<EmergencyIncident, 'id' | 'reportedAt'>): EmergencyIncident[] {
    const list = this.getIncidents();
    const newItem: EmergencyIncident = {
      ...incident,
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      reportedAt: 'Just now',
    };
    const updated = [newItem, ...list];
    this.saveIncidents(updated);
    return updated;
  },
};
