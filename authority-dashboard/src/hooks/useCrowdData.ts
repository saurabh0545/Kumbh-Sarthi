import { useState, useCallback, useEffect } from 'react';
import { ZoneCrowdData } from '../types';
import { INITIAL_ZONES } from '../constants/zones';
import { crowdService } from '../services/crowdService';
import { firebaseDashboardService } from '../services/firebaseService';
import { usePolling } from './usePolling';

export function useCrowdData(pollIntervalMs = 3000) {
  const [zones, setZones] = useState<ZoneCrowdData[]>(INITIAL_ZONES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendOffline, setIsBackendOffline] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [hasLiveFirestore, setHasLiveFirestore] = useState<boolean>(false);

  // 1. Real-time Firebase Firestore Subscription
  // Streams live YOLO person count from detector (test_crowd.py) directly across web and cloud.
  useEffect(() => {
    const unsub = firebaseDashboardService.subscribeToCrowdZones((zonesMap) => {
      if (zonesMap && Object.keys(zonesMap).length > 0) {
        setZones((prev) => crowdService.mergeWithLiveBackend(prev, zonesMap));
        setIsBackendOffline(false);
        setError(null);
        setLastUpdated(new Date());
        setIsLoading(false);
        setHasLiveFirestore(true);
      }
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  // 2. HTTP Polling fallback / local FastAPI sync
  const fetchData = useCallback(async () => {
    try {
      const response = await crowdService.getAllCrowd();
      if (response.data && response.data.zones) {
        setZones((prev) => crowdService.mergeWithLiveBackend(prev, response.data!.zones));
        setIsBackendOffline(false);
        setError(null);
        setLastUpdated(new Date());
      } else if (response.isOffline) {
        if (!hasLiveFirestore) {
          setIsBackendOffline(true);
          setError(response.error);
        }
      } else if (response.error) {
        if (!hasLiveFirestore) {
          setError(response.error);
        }
      }
    } catch (err: any) {
      if (!hasLiveFirestore) {
        setError(err?.message || 'Failed to fetch crowd data');
        setIsBackendOffline(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [hasLiveFirestore]);

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
