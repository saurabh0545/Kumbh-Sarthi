import { apiClient } from './api';

export interface BackendAlert {
  id: number;
  type: 'CROWD' | 'SAFETY' | 'EMERGENCY' | 'FAMILY' | 'INFO';
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  location?: string | null;
  zone?: string | null;
  is_system: boolean;
  is_read: boolean;
  created_at: string;
}

export interface AlertsResponse {
  alerts: BackendAlert[];
  count: number;
}

export async function getBackendAlerts(userId?: number | null): Promise<BackendAlert[]> {
  const url = userId ? `/api/alerts?user_id=${userId}` : '/api/alerts';
  const response = await apiClient.get<AlertsResponse>(url);
  return response.data.alerts;
}

export async function markAlertRead(alertId: number, userId: number): Promise<void> {
  await apiClient.post(`/api/alerts/${alertId}/read?user_id=${userId}`);
}

export async function markAllAlertsRead(userId: number): Promise<void> {
  await apiClient.post(`/api/alerts/read-all?user_id=${userId}`);
}
