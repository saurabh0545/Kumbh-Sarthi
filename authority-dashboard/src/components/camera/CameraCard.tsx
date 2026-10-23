import React from 'react';
import { Video, Maximize2, Radio, Eye } from 'lucide-react';
import { CameraFeedItem } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getDensityColor } from '../../utils/density';

interface CameraCardProps {
  camera: CameraFeedItem;
  onView: (camera: CameraFeedItem) => void;
  onFullscreen?: (camera: CameraFeedItem) => void;
}

export const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onView,
  onFullscreen,
}) => {
  const densityStyles = getDensityColor(camera.density);

  return (
    <Card padding="none" style={{ overflow: 'hidden' }}>
      {/* Camera Video / Preview Canvas */}
      <div
        style={{
          position: 'relative',
          height: '200px',
          backgroundColor: '#0F172A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          overflow: 'hidden',
        }}
      >
        {/* Placeholder / Simulated Stream Canvas */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, #1E293B 0%, #090D16 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {/* Subtle grid pattern */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <Video size={36} color={camera.status === 'ONLINE' ? '#38BDF8' : '#64748B'} />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', zIndex: 2 }}>
            {camera.isLiveStream
              ? 'YOLO OPTICAL FEED ACTIVE'
              : camera.status === 'ONLINE'
              ? 'TELEMETRY STREAM CONNECTED'
              : 'SIGNAL OFFLINE'}
          </span>
          {!camera.isLiveStream && (
            <span
              style={{
                fontSize: '10px',
                color: '#64748B',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '2px 8px',
                borderRadius: '4px',
                zIndex: 2,
              }}
            >
              Simulated Preview Standby
            </span>
          )}
        </div>

        {/* Top Badges: Status & Resolution */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            display: 'flex',
            gap: '6px',
            zIndex: 10,
          }}
        >
          <Badge
            variant={camera.status === 'ONLINE' ? 'green' : 'gray'}
            size="sm"
            pulse={camera.isLiveStream}
          >
            {camera.status}
          </Badge>

          {camera.isLiveStream && (
            <Badge variant="saffron" size="sm">
              LIVE YOLO
            </Badge>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            zIndex: 10,
            fontSize: '11px',
            color: '#94A3B8',
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          {camera.resolution} • {camera.fps}fps
        </div>

        {/* Bottom Overlay: Real-time detection HUD */}
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '12px',
            right: '12px',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#E2E8F0',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            padding: '4px 8px',
            borderRadius: '6px',
          }}
        >
          <span>CAM ID: {camera.id}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Radio size={11} color={camera.status === 'ONLINE' ? '#16A34A' : '#94A3B8'} />
            {camera.lastUpdated}
          </span>
        </div>
      </div>

      {/* Card Body with Camera Details */}
      <div style={{ padding: '16px 18px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
          {camera.name}
        </h4>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px', lineHeight: 1.4 }}>
          {camera.locationDetails}
        </p>

        {/* Metrics Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            marginBottom: '14px',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Detected</span>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              {camera.peopleCount} <span style={{ fontSize: '12px', fontWeight: 500 }}>People</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Density</span>
            <div>
              <Badge
                variant={
                  camera.density === 'HIGH'
                    ? 'red'
                    : camera.density === 'MEDIUM' || camera.density === 'MODERATE'
                    ? 'amber'
                    : 'green'
                }
                size="sm"
              >
                {camera.density}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(camera)}
            icon={<Eye size={14} />}
            style={{ flex: 1 }}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFullscreen && onFullscreen(camera)}
            icon={<Maximize2 size={14} />}
            style={{ border: '1px solid #E2E8F0' }}
            title="Fullscreen Inspection"
          >
            Fullscreen
          </Button>
        </div>
      </div>
    </Card>
  );
};
