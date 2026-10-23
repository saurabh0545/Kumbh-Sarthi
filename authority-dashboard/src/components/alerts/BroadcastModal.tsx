import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Radio, Send } from 'lucide-react';

interface BroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (payload: {
    title: string;
    message: string;
    type: 'CROWD' | 'SAFETY' | 'EMERGENCY' | 'INFO';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    location: string;
    zone: string;
  }) => Promise<any>;
}

export const BroadcastModal: React.FC<BroadcastModalProps> = ({
  isOpen,
  onClose,
  onBroadcast,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'CROWD' | 'SAFETY' | 'EMERGENCY' | 'INFO'>('SAFETY');
  const [severity, setSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('WARNING');
  const [location, setLocation] = useState('Gate 1 — Ramkund Area');
  const [zone, setZone] = useState('Gate-A');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await onBroadcast({
        title,
        message,
        type,
        severity,
        location,
        zone,
      });
      setTitle('');
      setMessage('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Broadcast Authority Public Safety Advisory"
      subtitle="Publish an official alert to the Kumbh Sarthi mobile pilgrim network and command screens."
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Alert Severity
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'CRITICAL', label: 'Critical (Red)', color: '#DC2626' },
              { id: 'WARNING', label: 'Warning (Amber)', color: '#F59E0B' },
              { id: 'INFO', label: 'Information (Blue)', color: '#2563EB' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSeverity(s.id as any)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: severity === s.id ? `2px solid ${s.color}` : '1px solid #CBD5E1',
                  backgroundColor: severity === s.id ? `${s.color}15` : '#FFFFFF',
                  color: severity === s.id ? s.color : '#475569',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Alert Category
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="CROWD">Crowd Regulation & Flow Advisory</option>
            <option value="SAFETY">Public Safety & Corridor Directive</option>
            <option value="EMERGENCY">Emergency Response Notification</option>
            <option value="INFO">Pilgrim Facilities & General Info</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Advisory Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Gate 3 Flow Regulated — Use North Ghat Bypass"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13.5px',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
            Detailed Instructions for Pilgrims
          </label>
          <textarea
            required
            rows={3}
            placeholder="Clear, calm operational message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Target Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Zone Identifier
            </label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="saffron"
            type="submit"
            isLoading={isSubmitting}
            icon={<Send size={15} />}
          >
            Broadcast Alert
          </Button>
        </div>
      </form>
    </Modal>
  );
};
