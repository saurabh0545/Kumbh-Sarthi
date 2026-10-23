import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Shield, Mail, Phone, MapPin, Building, Key, Bell, LogOut, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [criticalSmsEnabled, setCriticalSmsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1000px' }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Authority Profile
        </h2>
        <p style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
          Official credentials, designated command zone, and security configurations.
        </p>
      </div>

      {/* Main Profile Card */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '20px',
              backgroundColor: '#123B5D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              border: '3px solid #F47C20',
              flexShrink: 0,
            }}
          >
            <Shield size={44} />
          </div>

          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A' }}>
                {user?.name || 'Inspector R. Patil'}
              </h3>
              <Badge variant="navy">{user?.role || 'COMMANDER'}</Badge>
              <Badge variant="green">ACTIVE DUTY</Badge>
            </div>

            <p style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
              {user?.designation || 'Control Room Commander'}
            </p>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '1px' }}>
              {user?.department || 'Nashik Police & Public Safety Command'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '1px solid #F1F5F9',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>AUTHORITY ID</span>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#123B5D' }}>
                  {user?.authorityId || 'KSA-CMD-2026-09'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ASSIGNED SECTOR</span>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A' }}>
                  {user?.assignedZone || 'Zone 1 — Ramkund Central'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>OFFICIAL EMAIL</span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  {user?.email || 'officer@kumbh.gov.in'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>DISPATCH CONTACT</span>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  +91 (0253) 222-2100 (Ext 4)
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security & Notification Preferences */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        <Card title="Security & Authentication" subtitle="Access control and session governance">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  Two-Factor Authentication (2FA)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Require cryptographic OTP on command center terminal login
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  Session Inactivity Lock
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Auto-lock console after 15 minutes of idle time
                </div>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>15 Min Active</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  Password Encryption
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Managed via Argon2 / Bcrypt password hashing
                </div>
              </div>
              <Badge variant="green" size="sm">ENCRYPTED</Badge>
            </div>
          </div>
        </Card>

        <Card title="Notification Settings" subtitle="Dispatch and sound alert triggers">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  Critical Density Audio Sirens
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Sound control room chime when density exceeds 85%
                </div>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>
                  Emergency SMS Relay
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Instant SMS broadcast to NDRF and rapid police units
                </div>
              </div>
              <input
                type="checkbox"
                checked={criticalSmsEnabled}
                onChange={(e) => setCriticalSmsEnabled(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px' }}>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSettings}
                icon={saveSuccess ? <Check size={14} /> : undefined}
              >
                {saveSuccess ? 'Preferences Saved' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Session Termination */}
      <Card padding="md" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B' }}>
              Terminate Officer Active Session
            </h4>
            <p style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '2px' }}>
              Logout from this command console and release operational sector locks.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={logout}
            icon={<LogOut size={16} />}
          >
            End Shift & Logout
          </Button>
        </div>
      </Card>
    </div>
  );
};
