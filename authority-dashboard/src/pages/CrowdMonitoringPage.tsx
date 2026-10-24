import React, { useState } from 'react';
import { useCrowdData } from '../hooks/useCrowdData';
import { ZoneCard } from '../components/crowd/ZoneCard';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { isFirebaseConfigured } from '../config/firebase';
import { Filter, RefreshCw, Users, ShieldAlert } from 'lucide-react';

export const CrowdMonitoringPage: React.FC = () => {
  const { zones, isLoading, isBackendOffline, refetch, lastUpdated } = useCrowdData(3000);
  const [filter, setFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'LIVE' | 'OFFLINE'>('ALL');
  const [search, setSearch] = useState('');

  const filteredZones = zones.filter((z) => {
    // Search query filter
    if (search && !z.name.toLowerCase().includes(search.toLowerCase()) && !z.gateCode.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    if (filter === 'LOW') return z.density === 'LOW';
    if (filter === 'MEDIUM') return z.density === 'MEDIUM' || z.density === 'MODERATE';
    if (filter === 'HIGH') return z.density === 'HIGH';
    if (filter === 'LIVE') return z.isLive;
    if (filter === 'OFFLINE') return !z.cameraOnline || z.status === 'OFFLINE';

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Crowd Monitoring
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            Comprehensive density matrix across all 12 monitored sectors, gates, and sacred corridors.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            icon={<RefreshCw size={14} />}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {isBackendOffline && !zones.some((z) => z.isLive) && !isFirebaseConfigured() && (
        <ErrorState
          isBackendOffline={true}
          onRetry={refetch}
        />
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '14px 18px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Search */}
        <input
          type="text"
          placeholder="Search by zone name or gate ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            fontSize: '13px',
            width: '260px',
            outline: 'none',
          }}
        />

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {[
            { id: 'ALL', label: `All (${zones.length})` },
            { id: 'LOW', label: 'Low Crowd' },
            { id: 'MEDIUM', label: 'Medium Crowd' },
            { id: 'HIGH', label: 'High Density (Alert)' },
            { id: 'LIVE', label: 'Live YOLO (Gate 1)' },
            { id: 'OFFLINE', label: 'Camera Offline' },
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
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Zones Grid */}
      {isLoading ? (
        <LoadingSpinner message="Synchronizing crowd telemetry..." />
      ) : filteredZones.length === 0 ? (
        <EmptyState
          title="No Zones Match Selected Filter"
          description="Try selecting 'All' or clearing the search query to view the full monitored perimeter."
          action={
            <Button variant="outline" size="sm" onClick={() => { setFilter('ALL'); setSearch(''); }}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '18px',
          }}
        >
          {filteredZones.map((zone) => (
            <ZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      )}
    </div>
  );
};
