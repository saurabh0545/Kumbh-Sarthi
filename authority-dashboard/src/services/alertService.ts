import { apiFetch, ApiResponse } from './api';
import { AlertItem } from '../types';
import { firebaseDashboardService } from './firebaseService';

export interface AlertsListResponse {
  alerts: AlertItem[];
  count: number;
}

export interface BroadcastAlertPayload {
  title: string;
  message: string;
  type: 'CROWD' | 'SAFETY' | 'EMERGENCY' | 'INFO';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string;
  zone?: string;
}

export const alertService = {
  /**
   * Fetches alerts from existing FastAPI endpoint:
   * GET /api/alerts
   */
  async getAlerts(userId?: number): Promise<ApiResponse<AlertsListResponse>> {
    const query = userId ? `?user_id=${userId}` : '';
    return apiFetch<AlertsListResponse>(`/api/alerts${query}`);
  },

  /**
   * Authority creates & broadcasts a new official alert into MySQL and Firebase Cloud Firestore:
   * POST /api/alerts & Firestore "alerts" collection
   */
  async broadcastAlert(payload: BroadcastAlertPayload): Promise<ApiResponse<any>> {
    // 1. Broadcast to Firebase Cloud Firestore in real-time (instant mobile app sync)
    try {
      await firebaseDashboardService.broadcastAlert(payload);
    } catch (fbErr) {
      console.warn('[Firebase Alert] Broadcast error:', fbErr);
    }

    // 2. Also record in FastAPI backend / MySQL
    return apiFetch('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Acknowledges / marks an alert as read:
   * POST /api/alerts/{id}/read
   */
  async acknowledgeAlert(alertId: number, userId = 999): Promise<ApiResponse<any>> {
    return apiFetch(`/api/alerts/${alertId}/read?user_id=${userId}`, {
      method: 'POST',
    });
  },

  /**
   * Resolves / dismisses an alert in control room (both Firebase & backend):
   * POST /api/alerts/{id}/resolve
   */
  async resolveAlert(alertId: number | string): Promise<ApiResponse<any>> {
    try {
      await firebaseDashboardService.resolveAlert(alertId);
    } catch (fbErr) {
      console.warn('[Firebase Alert] Resolve error:', fbErr);
    }
    return apiFetch(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
    });
  },
};
