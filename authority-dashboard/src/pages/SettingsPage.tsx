import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { API_BASE_URL } from '../services/api';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { Check, Settings, Bell, Sliders, Video, Layers, Globe, Shield, Activity } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [crowdThreshold, setCrowdThreshold] = useState(80);
  const [criticalDensityCount, setCriticalDensityCount] = useState(120);
  const [pollingInterval, setPollingInterval] = useState(3);
  const [mapAutoRecenter, setMapAutoRecenter] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
            {t.settings.title}
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
            {t.settings.subtitle}
          </p>
        </div>

        <Button
          variant="saffron"
          size="sm"
          onClick={handleSave}
          icon={isSaved ? <Check size={14} /> : undefined}
        >
          {isSaved ? t.settings.btnSaved : t.settings.btnSave}
        </Button>
      </div>

      {/* 1. Alert Thresholds & Crowd Monitoring */}
      <Card
        title="Crowd Monitoring & Alert Thresholds"
        subtitle="Automatic alert generation limits and density triggers"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                High Crowd Warning Threshold (% of Zone Capacity)
              </label>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#F47C20' }}>
                {crowdThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              value={crowdThreshold}
              onChange={(e) => setCrowdThreshold(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#F47C20' }}
            />
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              When people count exceeds {crowdThreshold}% capacity, automatic warnings trigger in the Alert Center.
            </span>
          </div>

          <div style={{ paddingTop: '14px', borderTop: '1px solid #F1F5F9' }}>
            <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>
              Telemetry Polling Frequency
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { sec: 1, label: '1 Sec (Real-time)' },
                { sec: 3, label: '3 Sec (Standard)' },
                { sec: 5, label: '5 Sec (Conservative)' },
                { sec: 10, label: '10 Sec (Low Bandwidth)' },
              ].map((p) => (
                <button
                  key={p.sec}
                  type="button"
                  onClick={() => setPollingInterval(p.sec)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: pollingInterval === p.sec ? '2px solid #123B5D' : '1px solid #CBD5E1',
                    backgroundColor: pollingInterval === p.sec ? '#EFF6FF' : '#FFFFFF',
                    color: pollingInterval === p.sec ? '#123B5D' : '#475569',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 2. Map & Surveillance Configuration */}
      <Card
        title="Map Layers & Visual Controls"
        subtitle="OpenStreetMap geospatial layers and auto-tracking"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                Auto-Recenter on Critical Alerts
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Automatically pan the live map when an emergency incident is filed
              </div>
            </div>
            <input
              type="checkbox"
              checked={mapAutoRecenter}
              onChange={(e) => setMapAutoRecenter(e.target.checked)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                Map Tile Engine
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                OpenStreetMap (OSM Standard Tiles)
              </div>
            </div>
            <Badge variant="blue" size="sm">ACTIVE (OSM)</Badge>
          </div>
        </div>
      </Card>

      {/* 3. Language & Localization */}
      <Card
        title={t.settings.languageTitle}
        subtitle={t.settings.languageSub}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          {[
            { id: 'EN', name: 'English', desc: 'Standard Command Operations' },
            { id: 'HI', name: 'हिन्दी (Hindi)', desc: 'Official Pilgrim & Police Communication' },
            { id: 'MR', name: 'मराठी (Marathi)', desc: 'Nashik Municipal & Police Local Language' },
          ].map((l) => (
            <div
              key={l.id}
              onClick={() => setLanguage(l.id as any)}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '10px',
                border: language === l.id ? '2px solid #F47C20' : '1px solid #CBD5E1',
                backgroundColor: language === l.id ? 'rgba(244, 124, 32, 0.05)' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{l.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{l.desc}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. Backend Endpoints & API Topology */}
      <Card
        title="Backend API Configuration & System Status"
        subtitle="Configured FastAPI upstream and database endpoints"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#64748B' }}>Configured FastAPI Base URL:</span>
            <code style={{ color: '#123B5D', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: '4px' }}>
              {API_BASE_URL}
            </code>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#64748B' }}>Environment Variable Source:</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>import.meta.env.VITE_API_BASE_URL</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#64748B' }}>Database Engine:</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>MySQL (mysql+pymysql://root:saurabh@localhost:3306/kumbh_smart_assist)</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#64748B' }}>YOLO Vision Model:</span>
            <span style={{ color: '#0F172A', fontWeight: 600 }}>yolo11n.pt / yolov8n.pt (Ultralytics Nano Model)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
