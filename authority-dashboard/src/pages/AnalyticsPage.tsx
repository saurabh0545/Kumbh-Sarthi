import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Clock, AlertTriangle, Video, ShieldCheck, Activity } from 'lucide-react';

const HOURLY_CROWD_DATA = [
  { hour: '04:00', gate1: 12, gate2: 25, gate3: 40, total: 2400 },
  { hour: '06:00 (Aarti)', gate1: 65, gate2: 90, gate3: 160, total: 14200 },
  { hour: '08:00 (Snan)', gate1: 85, gate2: 120, gate3: 195, total: 22400 },
  { hour: '10:00', gate1: 45, gate2: 80, gate3: 140, total: 18900 },
  { hour: '12:00', gate1: 30, gate2: 60, gate3: 95, total: 12500 },
  { hour: '14:00', gate1: 25, gate2: 45, gate3: 70, total: 9800 },
  { hour: '16:00', gate1: 40, gate2: 70, gate3: 110, total: 15300 },
  { hour: '18:00 (Aarti)', gate1: 75, gate2: 110, gate3: 175, total: 23100 },
  { hour: '20:00', gate1: 50, gate2: 85, gate3: 125, total: 16700 },
];

const ZONE_COMPARISON_DATA = [
  { zone: 'Gate 1 (Ramkund)', current: 34, capacity: 200, avgWait: 4 },
  { zone: 'Gate 2 (Tapovan)', current: 78, capacity: 250, avgWait: 8 },
  { zone: 'Gate 3 (Ghat North)', current: 142, capacity: 150, avgWait: 18 },
  { zone: 'Gate 4 (Panchavati)', current: 29, capacity: 220, avgWait: 3 },
  { zone: 'Gate 5 (Laxman Kund)', current: 64, capacity: 180, avgWait: 7 },
  { zone: 'Gate 10 (Sadhugram)', current: 165, capacity: 180, avgWait: 15 },
];

const EMERGENCY_STATS_DATA = [
  { day: 'Mon', medical: 8, lost: 5, crowd: 2 },
  { day: 'Tue', medical: 6, lost: 7, crowd: 1 },
  { day: 'Wed', medical: 12, lost: 9, crowd: 4 },
  { day: 'Thu', medical: 9, lost: 6, crowd: 3 },
  { day: 'Fri', medical: 15, lost: 11, crowd: 5 },
  { day: 'Sat (Parv)', medical: 22, lost: 18, crowd: 8 },
  { day: 'Sun (Parv)', medical: 28, lost: 24, crowd: 11 },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Kumbh Intelligence & Analytics
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
          Operational trend analysis, peak flow projections, and dispatch response statistics.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Peak Flow Window
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#123B5D', marginTop: '4px' }}>
                06:00 — 09:30 AM
              </div>
              <span style={{ fontSize: '11px', color: '#F47C20', fontWeight: 600 }}>Morning Shahi Snan Surge</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <Clock size={24} />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Avg Team Response Time
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                4.2 Minutes
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>Within SLA target of &lt; 6 min</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#16A34A' }}>
              <Activity size={24} />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Surveillance Uptime
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
                98.4%
              </div>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>Optical Edge Detection</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Video size={24} />
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                Incident Resolution
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>
                94.8%
              </div>
              <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>182 / 192 Cases Resolved</span>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <ShieldCheck size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart 1: Hourly Pilgrim Influx & Gate Comparison */}
      <Card
        title="Hourly Crowd Volume & Sector Influx"
        subtitle="Tracking hourly distribution across key gates and sacred bath timings"
      >
        <div style={{ height: '320px', width: '100%', marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={HOURLY_CROWD_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="gate1"
                name="Gate 1 (Ramkund Live)"
                stroke="#F47C20"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="gate2"
                name="Gate 2 (Tapovan)"
                stroke="#123B5D"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="gate3"
                name="Gate 3 (North Ghat)"
                stroke="#DC2626"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Grid for Zone Comparison and Incident Trends */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Zone Capacity vs Current Occupancy */}
        <Card
          title="Current Density vs Rated Zone Capacity"
          subtitle="Real-time head count compared to designed safety threshold"
        >
          <div style={{ height: '280px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ZONE_COMPARISON_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="zone" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="current" name="Detected People" fill="#123B5D" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" name="Safe Capacity Limit" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Weekly Emergency Breakdown */}
        <Card
          title="Weekly Incident Breakdown by Category"
          subtitle="Comparative volume of medical aid, lost persons, and crowd interventions"
        >
          <div style={{ height: '280px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EMERGENCY_STATS_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="medical" name="Medical Emergencies" fill="#DC2626" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lost" name="Lost Person Assistance" fill="#F47C20" radius={[4, 4, 0, 0]} />
                <Bar dataKey="crowd" name="Crowd Surges Regulated" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
