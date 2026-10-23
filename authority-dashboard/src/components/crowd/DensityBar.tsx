import React from 'react';
import { DensityLevel } from '../../types';
import { getDensityColor, getDensityPercentage } from '../../utils/density';

interface DensityBarProps {
  density: DensityLevel;
  count: number;
  capacity?: number;
  showLabels?: boolean;
}

export const DensityBar: React.FC<DensityBarProps> = ({
  density,
  count,
  capacity = 200,
  showLabels = true,
}) => {
  const percent = getDensityPercentage(count, capacity);
  const { color } = getDensityColor(density);

  return (
    <div style={{ width: '100%' }}>
      {showLabels && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            fontSize: '12px',
          }}
        >
          <span style={{ color: '#64748B', fontWeight: 500 }}>Density Index</span>
          <span style={{ color, fontWeight: 700 }}>
            {percent}% ({count} / {capacity})
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '7px',
          backgroundColor: '#E2E8F0',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            backgroundColor: color,
            borderRadius: '4px',
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};
