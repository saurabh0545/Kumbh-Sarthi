import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { EmergencyIncident } from '../../types';
import { Users, Shield } from 'lucide-react';

interface TeamDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: EmergencyIncident | null;
  onDispatch: (incidentId: string, teamName: string) => void;
}

export const TeamDispatchModal: React.FC<TeamDispatchModalProps> = ({
  isOpen,
  onClose,
  incident,
  onDispatch,
}) => {
  const [selectedTeam, setSelectedTeam] = useState('Quick Response Team 2 (Police)');

  if (!incident) return null;

  const availableTeams = [
    { name: 'Quick Response Team 2 (Police)', type: 'POLICE', sector: 'Ramkund Sector', status: 'AVAILABLE' },
    { name: 'Emergency Medical Unit 1 (Civil Hospital)', type: 'MEDICAL', sector: 'North Ghat', status: 'AVAILABLE' },
    { name: 'Rapid Crowd Marshall Unit 3', type: 'CROWD', sector: 'Tapovan Plaza', status: 'AVAILABLE' },
    { name: 'Disaster Relief Staging Squad A (NDRF)', type: 'RESCUE', sector: 'Ghat Steps', status: 'AVAILABLE' },
    { name: 'Child Welfare Helpdesk Squad 1', type: 'SOCIAL', sector: 'Main Gate', status: 'AVAILABLE' },
  ];

  const handleConfirm = () => {
    onDispatch(incident.id, selectedTeam);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Dispatch Operational Field Team"
      subtitle={`Assign safety unit to ${incident.id} at ${incident.location}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Select Response Team
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableTeams.map((team) => (
              <label
                key={team.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: selectedTeam === team.name ? '2px solid #123B5D' : '1px solid #CBD5E1',
                  backgroundColor: selectedTeam === team.name ? '#F0F7FF' : '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="dispatchTeam"
                  checked={selectedTeam === team.name}
                  onChange={() => setSelectedTeam(team.name)}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{team.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Type: {team.type} • Staged at {team.sector}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#15803D',
                    backgroundColor: '#DCFCE7',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {team.status}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="saffron" onClick={handleConfirm} icon={<Users size={14} />}>
            Confirm Dispatch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
