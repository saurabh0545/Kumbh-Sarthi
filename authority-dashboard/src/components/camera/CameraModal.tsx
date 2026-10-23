import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CameraFeedItem } from '../../types';
import { Badge } from '../common/Badge';
import { Video, Shield, Radio, Activity } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: CameraFeedItem | null;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, camera }) => {
  if (!camera) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={camera.name}
      subtitle={`SURVEILLANCE NODE • ID: ${camera.id} • ${camera.resolution}`}
      maxWidth="800px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Large Video Stream Viewport */}
        <div
          style={{
            position: 'relative',
            height: '420px',
            backgroundColor: '#0A0F1D',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            border: '1px solid #1E293B',
          }}
        >
          {/* Grid lines overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          {/* Center Display */}
          <div style={{ textAlign: 'center', zIndex: 5 }}>
            <Video size={48} color="#38BDF8" style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px' }}>
              {camera.isLiveStream ? 'YOLO NEURAL PERSON DETECTOR ACTIVE' : 'CAMERA SURVEILLANCE FEED'}
            </h3>
            <p style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '420px', margin: '0 auto' }}>
              {camera.isLiveStream
                ? 'Processing live frames via ultralytics neural engine with real-time bounding box telemetry.'
                : 'Simulated high-definition CCTV telemetry stream for public safety command monitoring.'}
            </p>
          </div>

          {/* Top telemetry bar */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 10,
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant="green" pulse={camera.isLiveStream}>
                {camera.status}
              </Badge>
              {camera.isLiveStream && <Badge variant="saffron">LIVE INFERENCE</Badge>}
            </div>

            <span
              style={{
                fontSize: '11px',
                color: '#67E8F9',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontFamily: 'monospace',
              }}
            >
              BITRATE: 4.2 Mbps | FPS: {camera.fps}
            </span>
          </div>

          {/* Bottom HUD bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              right: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              padding: '8px 14px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#CBD5E1',
              zIndex: 10,
            }}
          >
            <span>Live Person Tally: <strong style={{ color: '#FFFFFF' }}>{camera.peopleCount}</strong></span>
            <span>Density Classification: <strong style={{ color: '#F4B942' }}>{camera.density}</strong></span>
            <span>Sync: {camera.lastUpdated}</span>
          </div>
        </div>

        {/* Telemetry info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            backgroundColor: '#F8FAFC',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>MONITORED ZONE</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>{camera.zone}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>OPTICAL SENSOR</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Sony Starvis 4K Low-Light</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>EDGE NODE</div>
            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>Jetson Xavier / YOLOv8 / YOLO11</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
          <Button variant="primary" onClick={onClose}>
            Close Monitor
          </Button>
        </div>
      </div>
    </Modal>
  );
};
