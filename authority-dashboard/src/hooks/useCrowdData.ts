import { useState, useCallback } from 'react';
import { ZoneCrowdData } from '../types';
import { INITIAL_ZONES } from '../constants/zones';
import { crowdService } from '../services/crowdService';
import { usePolling } from './usePolling';

export function useCrowdData(pollIntervalMs = 3000) {
  const [zones, setZones] = useState<ZoneCrowdData[]>(INITIAL_ZONES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const response = await crowdService.getAllCrowd();
      if (response.data && response.data.zones) {
        setZones((prev) => crowdService.mergeWithLiveBackend(prev, response.data!.zones));
        setIsBackendOffline(false);
        setError(null);
        setLastUpdated(new Date());
      } else if (response.isOffline) {
        setIsBackendOffline(true);
        setError(response.error);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch crowd data');
      setIsBackendOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  usePolling(fetchData, pollIntervalMs);

  return {
    zones,
    isLoading,
    error,
    isBackendOffline,
    lastUpdated,
    refetch: fetchData,
  };
}
