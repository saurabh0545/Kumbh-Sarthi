import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Video,
  BellRing,
  AlertTriangle,
  HeartHandshake,
  Search,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  Scan,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { to: '/dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { to: '/live-map', label: t.nav.liveMap, icon: MapPin },
    { to: '/crowd-monitoring', label: t.nav.crowdMonitoring, icon: Users },
    { to: '/camera-monitoring', label: t.nav.cameraMonitoring, icon: Video },
    { to: '/face-detection', label: t.nav.faceDetection, icon: Scan },
    { to: '/alerts', label: t.nav.alerts, icon: BellRing },
    { to: '/emergency', label: t.nav.emergency, icon: AlertTriangle },
    { to: '/family-sos', label: t.nav.familySos, icon: HeartHandshake },
    { to: '/lost-found', label: t.nav.lostFound, icon: Search },
    { to: '/analytics', label: t.nav.analytics, icon: BarChart3 },
    { to: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'block',
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0A2540',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 50,
          flexShrink: 0,
        }}
      >
        {/* Brand & Emblem Header */}
        <div
          style={{
            padding: '22px 18px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Logo Container with attractive subtle glow */}
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1.5px solid rgba(244, 124, 32, 0.35)',
              boxShadow: '0 0 16px rgba(244, 124, 32, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2px',
              flexShrink: 0,
            }}
          >
            <img
              src="/assets/kumbh_logo_transparent.png"
              alt="Kumbh Sarthi App Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                Kumbh
              </span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#F47C20',
                  lineHeight: 1.1,
                }}
              >
                Sarthi
              </span>
            </div>
            <p
              style={{
                fontSize: '10.5px',
                color: '#F4B942',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginTop: '3px',
              }}
            >
              Authority Control Center
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav
          style={{
            flex: 1,
            padding: '16px 12px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '13.5px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  backgroundColor: isActive ? 'rgba(244, 124, 32, 0.18)' : 'transparent',
                  borderLeft: isActive ? '3.5px solid #F47C20' : '3.5px solid transparent',
                  transition: 'all 0.15s ease-in-out',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      color={isActive ? '#F47C20' : '#94A3B8'}
                      strokeWidth={isActive ? 2.3 : 1.8}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Officer Profile & System Info Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(7, 26, 45, 0.8)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(244, 124, 32, 0.2)',
                border: '1px solid rgba(244, 124, 32, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F47C20',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user?.name || 'Control Room Officer'}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  color: '#16A34A',
                  fontWeight: 600,
                  marginTop: '1px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#16A34A',
                    boxShadow: '0 0 4px #16A34A',
                  }}
                />
                <span>{t.common.online}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#EF4444',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
          >
            <LogOut size={15} />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
