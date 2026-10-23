import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAlerts } from '../../hooks/useAlerts';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { alerts } = useAlerts();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F6F9' }}>
      <Sidebar
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowX: 'hidden',
        }}
      >
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeAlertsCount={alerts.length}
        />

        <main
          style={{
            flex: 1,
            padding: '24px',
            maxWidth: '1600px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          aside {
            position: fixed !important;
            left: 0;
            top: 0;
            transform: translateX(${sidebarOpen ? '0' : '-100%'});
            transition: transform 0.25s ease-in-out;
          }
          .header-datetime-badge {
            display: none !important;
          }
        }
        @media (min-width: 1025px) {
          .sidebar-toggle-btn {
            display: none !important;
          }
          .mobile-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
