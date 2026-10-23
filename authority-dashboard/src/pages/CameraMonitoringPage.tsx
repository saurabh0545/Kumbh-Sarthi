import React, { useState } from 'react';
import { cameraService } from '../services/cameraService';
import { CameraFeedItem } from '../types';
import { CameraCard } from '../components/camera/CameraCard';
import { CameraModal } from '../components/camera/CameraModal';
import { LiveFaceDetectionStudio } from '../components/camera/LiveFaceDetectionStudio';
import { LiveFaceDetectionModal } from '../components/camera/LiveFaceDetectionModal';
import { useCrowdData } from '../hooks/useCrowdData';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Video, Scan, Grid, Sparkles, RefreshCw } from 'lucide-react';

export const CameraMonitoringPage: React.FC = () => {
  const { zones } = useCrowdData(3000);
  const baseCameras = cameraService.getCameras();

  // Mode: 'GRID' | 'FACE_STUDIO'
  const [activeTab, setActiveTab] = useState<'GRID' | 'FACE_STUDIO'>('GRID');
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  // Merge live YOLO Gate 1 count into CAM-01
  const gate1Zone = zones.find((z) => z.gateCode === 'Gate-A');
  const cameras: CameraFeedItem[] = baseCameras.map((cam) => {
    if (cam.id === 'CAM-01' && gate1Zone) {
      return {
        ...cam,
        peopleCount: gate1Zone.peopleCount,
        density: gate1Zone.density,
        lastUpdated: 'Live right now',
        isLiveStream: true,
      };
    }
    return cam;
  });

  const [selectedCamera, setSelectedCamera] = useState<CameraFeedItem | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');

  const filteredCameras = cameras.filter((c) => {
    if (filter === 'ONLINE') return c.status === 'ONLINE';
    if (filter === 'OFFLINE') return c.status === 'OFFLINE';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Live Camera Surveillance & AI Inference
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            CCTV visual surveillance grid with optical AI inference overlay and facial recognition across Kumbh gates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveTab(activeTab === 'FACE_STUDIO' ? 'GRID' : 'FACE_STUDIO')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'FACE_STUDIO' 
                ? 'linear-gradient(135deg, #10B981, #059669)' 
                : 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <Scan size={16} />
            <span>{activeTab === 'FACE_STUDIO' ? 'Switch to CCTV Grid' : 'Run Live Face Detection AI'}</span>
          </button>

          <Badge variant="green" pulse>
            CAM-01 YOLO LIVE
          </Badge>
          <Badge variant="navy">
            FACE AI ENGINE OPERATIONAL
          </Badge>
        </div>
      </div>

      {/* Main Mode Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '2px solid #E2E8F0',
          paddingBottom: '2px',
        }}
      >
        <button
          onClick={() => setActiveTab('GRID')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'GRID' ? '3px solid #123B5D' : '3px solid transparent',
            color: activeTab === 'GRID' ? '#123B5D' : '#64748B',
            fontWeight: activeTab === 'GRID' ? 800 : 600,
            fontSize: '14px',
            padding: '10px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <Grid size={16} />
          <span>CCTV Surveillance Grid ({cameras.length} Feeds)</span>
        </button>

        <button
          onClick={() => setActiveTab('FACE_STUDIO')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'FACE_STUDIO' ? '3px solid #0284C7' : '3px solid transparent',
            color: activeTab === 'FACE_STUDIO' ? '#0284C7' : '#64748B',
            fontWeight: activeTab === 'FACE_STUDIO' ? 800 : 600,
            fontSize: '14px',
            padding: '10px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '-2px',
          }}
        >
          <Scan size={16} color={activeTab === 'FACE_STUDIO' ? '#0284C7' : '#64748B'} />
          <span>Optical Face Detection & Recognition AI Studio</span>
          <span
            style={{
              fontSize: '10px',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '2px 6px',
              borderRadius: '999px',
              fontWeight: 700,
            }}
          >
            LIVE
          </span>
        </button>
      </div>

      {/* Tab 1: Live Face Detection Studio */}
      {activeTab === 'FACE_STUDIO' && (
        <div style={{ animation: 'fadeIn 0.25s ease-out' }}>
          <LiveFaceDetectionStudio />
        </div>
      )}

      {/* Tab 2: Standard CCTV Grid */}
      {activeTab === 'GRID' && (
        <>
          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'ALL', label: `All Surveillance Feeds (${cameras.length})` },
                { id: 'ONLINE', label: 'Online Feeds' },
                { id: 'OFFLINE', label: 'Offline / Standby' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setFilter(item.id as any)}
                  style={{
                    border: 'none',
                    background: filter === item.id ? '#123B5D' : '#F1F5F9',
                    color: filter === item.id ? '#FFFFFF' : '#475569',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFaceModalOpen(true)}
              >
                <Scan size={14} style={{ marginRight: '6px' }} />
                Open Face AI Modal
              </Button>
            </div>
          </div>

          {/* Camera Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredCameras.map((camera) => (
              <CameraCard
                key={camera.id}
                camera={camera}
                onView={(c) => setSelectedCamera(c)}
                onFullscreen={(c) => setSelectedCamera(c)}
              />
            ))}
          </div>

          {/* Enlarged Inspection Modal */}
          <CameraModal
            isOpen={Boolean(selectedCamera)}
            onClose={() => setSelectedCamera(null)}
            camera={selectedCamera}
          />
        </>
      )}

      {/* Floating / Pop-out Live Face Detection Modal */}
      <LiveFaceDetectionModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        zone="Gate-A"
      />
    </div>
  );
};
export default CameraMonitoringPage;
