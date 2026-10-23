import React, { useState, useEffect } from 'react';
import { Bell, Menu, Shield, Clock, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LanguageCode } from '../../context/LanguageContext';
import { formatTimeOnly } from '../../utils/formatters';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onToggleSidebar: () => void;
  lastUpdated?: Date;
  activeAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  lastUpdated = new Date(),
  activeAlertsCount = 0,
}) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      {/* Left Title & Sector Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            color: '#123B5D',
            display: 'flex',
            alignItems: 'center',
          }}
          className="sidebar-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src="/assets/kumbh_logo_transparent.png"
            alt="Kumbh Sarthi Logo"
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  fontSize: '17px',
                  fontWeight: 800,
                  color: '#123B5D',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                {t.header.safetyDashboard}
              </h2>
            </div>
          <p
            className="header-kumbh-subtitle"
            style={{
              fontSize: '12.5px',
              color: '#64748B',
              fontWeight: 500,
              marginTop: '1px',
            }}
          >
            {t.header.kumbhSubtitle}
          </p>
        </div>
      </div>
    </div>

      {/* Right Controls, Telemetry & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Switcher */}
        <div
          className="header-lang-switcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            gap: '2px',
          }}
          title={t.header.selectLanguage}
        >
          <div style={{ padding: '0 6px', color: '#64748B', display: 'flex', alignItems: 'center' }}>
            <Globe size={14} />
          </div>
          {(
            [
              { code: 'EN' as LanguageCode, label: 'EN' },
              { code: 'HI' as LanguageCode, label: 'हिन्दी' },
              { code: 'MR' as LanguageCode, label: 'मराठी' },
            ]
          ).map((item) => {
            const isActive = language === item.code;
            return (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                style={{
                  border: 'none',
                  backgroundColor: isActive ? '#123B5D' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#475569',
                  padding: '4px 10px',
                  borderRadius: '7px',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 1px 3px rgba(18, 59, 93, 0.2)' : 'none',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* LIVE telemetry badge */}
        <div
          className="header-telemetry-pill"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '20px',
            backgroundColor: '#F0FDF4',
            border: '1px solid #BBF7D0',
          }}
        >
          <span className="live-indicator" />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#166534',
              letterSpacing: '0.04em',
            }}
          >
            {t.common.live}
          </span>
          <span className="header-sync-time" style={{ color: '#86EFAC' }}>|</span>
          <span className="header-sync-time" style={{ fontSize: '11px', color: '#15803D', fontWeight: 500 }}>
            {t.header.liveSync}: {formatTimeOnly(lastUpdated)}
          </span>
        </div>

        {/* Current Date / Time clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#475569',
            fontSize: '12.5px',
            fontWeight: 600,
            padding: '4px 10px',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
          }}
          className="header-datetime-badge"
        >
          <Clock size={14} color="#64748B" />
          <span>{formattedDate}</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>
            {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
          </span>
        </div>

        {/* Alert Notifications Icon */}
        <Link
          to="/alerts"
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#123B5D',
            textDecoration: 'none',
            transition: 'background 0.15s ease',
          }}
          title="Active Alerts"
        >
          <Bell size={18} />
          {activeAlertsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9999px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 4px',
                border: '2px solid #FFFFFF',
              }}
            >
              {activeAlertsCount}
            </span>
          )}
        </Link>

        {/* Authority Profile Card */}
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '5px 10px 5px 6px',
            borderRadius: '10px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#123B5D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
            }}
          >
            <Shield size={16} />
          </div>
          <div style={{ textAlign: 'left' }} className="header-user-text">
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#123B5D',
                lineHeight: 1.2,
              }}
            >
              {user?.name || 'Authority Officer'}
            </div>
            <div
              style={{
                fontSize: '10.5px',
                color: '#F47C20',
                fontWeight: 600,
              }}
            >
              {user?.designation || 'Control Room'}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};
