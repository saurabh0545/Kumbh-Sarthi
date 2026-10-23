import { useState, useCallback, useEffect } from 'react';
import { AlertItem } from '../types';
import { alertService } from '../services/alertService';
import { firebaseDashboardService } from '../services/firebaseService';
import { usePolling } from './usePolling';

export function useAlerts(pollIntervalMs = 5000) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Real-time Firestore alerts subscription (sub-second updates)
  useEffect(() => {
    const unsub = firebaseDashboardService.subscribeToAlerts((fbAlerts) => {
      if (fbAlerts) {
        setAlerts((prev) => {
          const map = new Map<string | number, AlertItem>();
          fbAlerts.forEach((a) => map.set(a.id, a));
          // keep any local non-Firestore alerts
          prev.forEach((a) => {
            if (typeof a.id === 'number' && !map.has(a.id)) map.set(a.id, a);
          });
          return Array.from(map.values());
        });
        setIsLoading(false);
      }
    });
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await alertService.getAlerts();
      if (response.data && response.data.alerts) {
        const fetchedAlerts: AlertItem[] = response.data.alerts;
        setAlerts((prev) => {
          const map = new Map<string | number, AlertItem>();
          // live firestore ones stay
          prev.forEach((a) => {
            if (typeof a.id === 'string') map.set(a.id, a);
          });
          fetchedAlerts.forEach((a: AlertItem) => map.set(a.id, a));
          return Array.from(map.values());
        });
        setIsOffline(false);
        setError(null);
      } else if (response.isOffline) {
        setIsOffline(true);
        setError(response.error);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch alerts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  usePolling(fetchAlerts, pollIntervalMs);

  const broadcastAlert = async (payload: any) => {
    const res = await alertService.broadcastAlert(payload);
    if (!res.error) {
      await fetchAlerts();
    }
    return res;
  };

  const resolveAlert = async (alertId: number | string) => {
    const res = await alertService.resolveAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    return res;
  };

  return {
    alerts,
    isLoading,
    error,
    isOffline,
    refetch: fetchAlerts,
    broadcastAlert,
    resolveAlert,
  };
}
