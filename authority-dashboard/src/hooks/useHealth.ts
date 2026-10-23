import { useState, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { SystemHealthData, KpiStatsData } from '../types';
import { usePolling } from './usePolling';

export function useHealth(pollIntervalMs = 6000) {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [stats, setStats] = useState<KpiStatsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);

  const fetchHealthAndStats = useCallback(async () => {
    try {
      const [healthRes, statsRes] = await Promise.all([
        apiFetch<SystemHealthData>('/api/authority/health'),
        apiFetch<KpiStatsData>('/api/authority/stats'),
      ]);

      if (healthRes.data) {
        setHealth(healthRes.data);
        setIsBackendOffline(false);
      } else if (healthRes.isOffline) {
        setIsBackendOffline(true);
      }

      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch {
      setIsBackendOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  usePolling(fetchHealthAndStats, pollIntervalMs);

  return {
    health,
    stats,
    isLoading,
    isBackendOffline,
    refetch: fetchHealthAndStats,
  };
}
