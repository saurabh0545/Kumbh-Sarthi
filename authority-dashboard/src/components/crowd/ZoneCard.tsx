import React from 'react';
import { Video, Shield, Radio, ArrowUpRight } from 'lucide-react';
import { ZoneCrowdData } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { DensityBar } from './DensityBar';
import { getDensityColor } from '../../utils/density';
import { Link } from 'react-router-dom';

interface ZoneCardProps {
  zone: ZoneCrowdData;
  onSelect?: () => void;
}

export const ZoneCard: React.FC<ZoneCardProps> = ({ zone }) => {
  const densityStyles = getDensityColor(zone.density);

  return (
    <Card
      padding="md"
      borderTopColor={densityStyles.color}
      style={{
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Zone Header with Gate Code & Live/Demo badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0F172A',
                letterSpacing: '-0.01em',
              }}
            >
              {zone.name}
            </h4>
          </div>
          <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
            Sector ID: {zone.gateCode}
          </span>
        </div>

        {/* Live vs Demo Data Badge */}
        {zone.isLive ? (
          <Badge variant="green" pulse>
            LIVE CAMERA
          </Badge>
        ) : (
          <Badge variant="gray">
            DEMO DATA
          </Badge>
        )}
      </div>

      {/* Main Count Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: '12px',
          padding: '10px 14px',
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Current Flow
          </span>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}
          >
            {zone.peopleCount}{' '}
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>
              People
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Density Status
          </span>
          <div>
            <Badge
              variant={
                zone.density === 'HIGH'
                  ? 'red'
                  : zone.density === 'MEDIUM' || zone.density === 'MODERATE'
                  ? 'amber'
                  : 'green'
              }
            >
              {zone.density}
            </Badge>
          </div>
        </div>
      </div>

      {/* Density Progress Bar */}
      <div style={{ marginBottom: '14px' }}>
        <DensityBar
          density={zone.density}
          count={zone.peopleCount}
          capacity={zone.capacityLimit}
        />
      </div>

      {/* Meta info & Action Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid #F1F5F9',
          fontSize: '12px',
          color: '#64748B',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Radio size={13} color={zone.cameraOnline ? '#16A34A' : '#94A3B8'} />
          <span>{zone.lastUpdated}</span>
        </span>

        <Link
          to={`/live-map?zone=${zone.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            color: '#123B5D',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <span>View on Map</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>
    </Card>
  );
};
