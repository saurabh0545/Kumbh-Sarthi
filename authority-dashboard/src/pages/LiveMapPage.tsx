import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { KumbhMap } from '../components/map/KumbhMap';
import { useCrowdData } from '../hooks/useCrowdData';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { emergencyService } from '../services/emergencyService';
import { firebaseDashboardService } from '../services/firebaseService';
import { ZoneCrowdData, EmergencyIncident } from '../types';
import {
  MapPin,
  Navigation,
  AlertTriangle,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink,
  X,
  Layers,
} from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialZoneId = searchParams.get('zone');
  const paramLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
  const paramLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
  const paramSender = searchParams.get('sender') || searchParams.get('name') || null;
  const paramLocation = searchParams.get('location') || null;
  const paramId = searchParams.get('id') || null;
  const initialFilter = searchParams.get('filter');

  const { zones } = useCrowdData(3000);
  const [selectedZone, setSelectedZone] = useState<ZoneCrowdData | null>(
    zones.find((z) => z.id === initialZoneId) || null
  );

  // Active Emergency Incidents state
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(emergencyService.getIncidents());
  const [focusCoordinates, setFocusCoordinates] = useState<[number, number] | null>(
    paramLat && paramLng ? [paramLat, paramLng] : null
  );
  const [focusTitle, setFocusTitle] = useState<string | null>(
    paramSender || paramLocation || null
  );
  const [showEmergencyDrawer, setShowEmergencyDrawer] = useState<boolean>(
    initialFilter === 'EMERGENCY' || Boolean(paramLat && paramLng)
  );

  // Real-time Firestore sync: updates instantly whenever a pilgrim triggers SOS in mobile app
  useEffect(() => {
    const unsubscribe = firebaseDashboardService.subscribeToLiveSos((fbEmergencies) => {
      if (fbEmergencies && fbEmergencies.length > 0) {
        setIncidents((prev) => {
          const map = new Map<string, EmergencyIncident>();
          fbEmergencies.forEach((item) => map.set(item.id, item));
          prev.forEach((item) => {
            if (!map.has(item.id)) map.set(item.id, item);
          });
          return Array.from(map.values());
        });
      }
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync focus if query params change
  useEffect(() => {
    if (paramLat && paramLng) {
      setFocusCoordinates([paramLat, paramLng]);
      setFocusTitle(paramSender || paramLocation || 'Emergency Sender');
    }
  }, [paramLat, paramLng, paramSender, paramLocation]);

  const handleResolveEmergency = (id: string) => {
    firebaseDashboardService.updateSosStatus(id, 'RESOLVED');
    const updated = emergencyService.updateIncidentStatus(id, 'RESOLVED');
    setIncidents(updated);
  };

  const handleLocateSender = (inc: EmergencyIncident) => {
    if (inc.coordinates) {
      setFocusCoordinates(inc.coordinates);
      setFocusTitle(inc.senderName || inc.callerContact || inc.location);
    }
  };

  const handleClearFocus = () => {
    setFocusCoordinates(null);
    setFocusTitle(null);
    // Remove lat/lng from URL cleanly
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('lat');
    newParams.delete('lng');
    newParams.delete('sender');
    newParams.delete('name');
    newParams.delete('location');
    newParams.delete('id');
    setSearchParams(newParams);
  };

  const activeIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Top Banner when actively locating a sender */}
      {focusCoordinates && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            backgroundColor: '#FEF2F2',
            border: '2px solid #EF4444',
            borderRadius: '12px',
            padding: '12px 18px',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              📍
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B' }}>
                LOCATING EMERGENCY SENDER: {focusTitle || 'Pilgrim Distress Beacon'}
              </div>
              <div style={{ fontSize: '12.5px', color: '#7F1D1D' }}>
                GPS Telemetry: <strong>{focusCoordinates[0].toFixed(5)}° N, {focusCoordinates[1].toFixed(5)}° E</strong> — Centered with pulsing distress beacon
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFocus}
              icon={<X size={13} />}
              style={{ borderColor: '#FCA5A5', color: '#991B1B' }}
            >
              Clear Focus
            </Button>
            <Link to="/emergency" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm" style={{ backgroundColor: '#DC2626', borderColor: '#DC2626' }}>
                Emergency Center
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Page Title & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Kumbh Safety & Emergency Locator Map
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            Interactive geographical command center across Nashik Godavari Ghats with real-time Pilgrim SOS locating & emergency unit routing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeIncidents.length > 0 && (
            <button
              onClick={() => setShowEmergencyDrawer((prev) => !prev)}
              style={{
                border: 'none',
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                color: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
              }}
            >
              <AlertTriangle size={14} />
              <span>{activeIncidents.length} ACTIVE SOS ALERTS</span>
            </button>
          )}

          <Badge variant="green" pulse>
            REAL-TIME TELEMETRY
          </Badge>
          <Badge variant="blue">
            GPS RESCUE ROUTING READY
          </Badge>
        </div>
      </div>

      {/* Main Full-Height Map Container */}
      <div style={{ height: 'calc(100vh - 195px)', minHeight: '640px', width: '100%', position: 'relative' }}>
        <KumbhMap
          zones={zones}
          selectedZoneId={selectedZone?.id || initialZoneId}
          onZoneSelect={(z) => setSelectedZone(z)}
          emergencies={incidents}
          selectedEmergencyId={paramId}
          focusCoordinates={focusCoordinates}
          focusTitle={focusTitle}
        />

        {/* Floating Active Emergencies Drawer Toggle Button */}
        <button
          onClick={() => setShowEmergencyDrawer((prev) => !prev)}
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '20px',
            zIndex: 600,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            border: activeIncidents.length > 0 ? '2px solid #EF4444' : '1px solid #334155',
            borderRadius: '12px',
            padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: '16px' }}>🚨</span>
          <span>Emergency Senders ({activeIncidents.length})</span>
        </button>

        {/* Emergency Senders Slide-Out Drawer (Bottom-Left) */}
        {showEmergencyDrawer && (
          <div
            style={{
              position: 'absolute',
              bottom: '76px',
              left: '20px',
              zIndex: 650,
              width: '360px',
              maxHeight: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                borderBottom: '1px solid #FCA5A5',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🚨</span>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#991B1B' }}>
                    Active Emergency Senders
                  </h4>
                  <div style={{ fontSize: '11px', color: '#7F1D1D' }}>
                    Live GPS signals from pilgrim mobile apps
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowEmergencyDrawer(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#991B1B',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '16px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Emergency Senders List */}
            <div style={{ padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeIncidents.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748B' }}>
                  <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>
                    All Sectors Clear
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '2px' }}>
                    No active distress beacons currently reported.
                  </div>
                </div>
              ) : (
                activeIncidents.map((inc) => {
                  const [lat, lng] = inc.coordinates || [19.9975, 73.7910];
                  const isCurrent =
                    focusCoordinates &&
                    Math.abs(focusCoordinates[0] - lat) < 0.0003 &&
                    Math.abs(focusCoordinates[1] - lng) < 0.0003;

                  return (
                    <div
                      key={inc.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: isCurrent ? '2px solid #EF4444' : '1px solid #E2E8F0',
                        backgroundColor: isCurrent ? '#FFF5F5' : '#F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626' }}>
                          {inc.type.replace('_', ' ')} • {inc.id}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>{inc.reportedAt}</span>
                      </div>

                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                        👤 {inc.senderName || inc.callerContact || 'Pilgrim'}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#F47C20" />
                        <span>{inc.location}</span>
                      </div>

                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                        📍 GPS: {lat.toFixed(5)}° N, {lng.toFixed(5)}° E
                      </div>

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <Button
                          variant={isCurrent ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => handleLocateSender(inc)}
                          icon={<Navigation size={12} />}
                          style={{
                            flex: 1,
                            backgroundColor: isCurrent ? '#DC2626' : undefined,
                            borderColor: '#DC2626',
                            color: isCurrent ? '#FFFFFF' : '#DC2626',
                          }}
                        >
                          {isCurrent ? 'Locating...' : 'Locate on Map'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResolveEmergency(inc.id)}
                          icon={<CheckCircle2 size={12} color="#16A34A" />}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Selected Zone Quick Inspector Drawer (Floating Top-Right when clicked) */}
        {selectedZone && (
          <div
            style={{
              position: 'absolute',
              top: '76px',
              right: '16px',
              zIndex: 600,
              width: '320px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #CBD5E1',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              padding: '16px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  {selectedZone.gateCode}
                </span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A' }}>
                  {selectedZone.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedZone(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  fontSize: '16px',
                  fontWeight: 700,
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
              <Badge
                variant={
                  selectedZone.density === 'HIGH'
                    ? 'red'
                    : selectedZone.density === 'MEDIUM' || selectedZone.density === 'MODERATE'
                    ? 'amber'
                    : 'green'
                }
                size="sm"
              >
                {selectedZone.density} DENSITY
              </Badge>
              {selectedZone.isLive ? (
                <Badge variant="green" size="sm">LIVE CAMERA</Badge>
              ) : (
                <Badge variant="gray" size="sm">CALIBRATED DATA</Badge>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '10px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>PEOPLE FLOW</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  {selectedZone.peopleCount}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>CAPACITY</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
                  {selectedZone.capacityLimit}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4, marginBottom: '10px' }}>
              {selectedZone.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
