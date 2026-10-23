import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { LiveMapPage } from '../pages/LiveMapPage';
import { CrowdMonitoringPage } from '../pages/CrowdMonitoringPage';
import { CameraMonitoringPage } from '../pages/CameraMonitoringPage';
import { AlertsPage } from '../pages/AlertsPage';
import { EmergencyPage } from '../pages/EmergencyPage';
import { FamilySOSPage } from '../pages/FamilySOSPage';
import { LostFoundPage } from '../pages/LostFoundPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { SettingsPage } from '../pages/SettingsPage';
import { FaceDetectionPage } from '../pages/FaceDetectionPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Authority Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/live-map" element={<LiveMapPage />} />
          <Route path="/crowd-monitoring" element={<CrowdMonitoringPage />} />
          <Route path="/camera-monitoring" element={<CameraMonitoringPage />} />
          <Route path="/face-detection" element={<FaceDetectionPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/family-sos" element={<FamilySOSPage />} />
          <Route path="/lost-found" element={<LostFoundPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
