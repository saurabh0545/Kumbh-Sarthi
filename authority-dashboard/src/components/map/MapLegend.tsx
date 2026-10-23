import React from 'react';

export const MapLegend: React.FC = () => {
  const items = [
    { label: 'Low Crowd Density', color: '#16A34A' },
    { label: 'Medium Crowd Density', color: '#F59E0B' },
    { label: 'High Crowd Density', color: '#DC2626' },
  ];

  const pois = [
    { label: 'Police Post', icon: '👮' },
    { label: 'Medical Camp', icon: '🏥' },
    { label: 'Ambulance Unit', icon: '🚑' },
    { label: 'Sacred Ghat / Temple', icon: '🛕' },
    { label: 'Parking Plaza', icon: '🅿️' },
    { label: 'Water / ORS', icon: '💧' },
    { label: 'Sanitation Facility', icon: '🚻' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        zIndex: 500,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(4px)',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '1px solid #CBD5E1',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        maxWidth: '340px',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 800,
          color: '#123B5D',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '8px',
        }}
      >
        Crowd Density Status
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
        {items.map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: item.color,
                boxShadow: `0 0 0 2px ${item.color}33`,
              }}
            />
            <span style={{ color: '#334155', fontWeight: 600 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: '1px solid #E2E8F0',
          paddingTop: '8px',
          fontSize: '11px',
          fontWeight: 800,
          color: '#123B5D',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '6px',
        }}
      >
        Facilities & Staging
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '11.5px', color: '#475569' }}>
        {pois.map((p) => (
          <span key={p.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
