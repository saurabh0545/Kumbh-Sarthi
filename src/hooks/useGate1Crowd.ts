import { useCallback, useEffect, useRef, useState } from 'react';
import { GATE1_ZONE, GateCrowdData, getCrowd, subscribeToGateCrowd } from '@/services/crowdApi';

export interface UseGate1CrowdResult {
  crowdData: GateCrowdData | null;
  lastKnownData: GateCrowdData | null;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  lastUpdatedLabel: string;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage live YOLO crowd detection polling & real-time Firebase sync for Gate 1.
 * - Subscribes to Firebase Cloud Firestore for instant zero-latency updates.
 * - Polls local FastAPI as backup if offline.
 * - Cleans up listener and interval on unmount to prevent memory leaks.
 */
export function useGate1Crowd(pollIntervalMs: number = 3500): UseGate1CrowdResult {
  const [crowdData, setCrowdData] = useState<GateCrowdData | null>(null);
  const [lastKnownData, setLastKnownData] = useState<GateCrowdData | null>(null);
  const [lastSuccessTime, setLastSuccessTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const fetchGate1 = useCallback(async (isManualRetry: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (isManualRetry) {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);
    }

    try {
      const data = await getCrowd(GATE1_ZONE);
      if (isMountedRef.current) {
        setCrowdData(data);
        setLastKnownData(data);
        setLastSuccessTime(Date.now());
        setIsError(false);
        setErrorMessage(null);
        setIsLoading(false);
      }
    } catch {
      if (isMountedRef.current) {
        // Clear active live data so stale info is never displayed as LIVE
        setCrowdData(null);
        setIsError(true);
        setErrorMessage('Camera offline (Laptop off)');
        setIsLoading(false);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // 1. Attach real-time Firebase Cloud Firestore snapshot listener (Instant updates)
    const unsubscribeFirebase = subscribeToGateCrowd(
      GATE1_ZONE,
      (liveData) => {
        if (isMountedRef.current) {
          setCrowdData(liveData);
          setLastKnownData(liveData);
          setLastSuccessTime(Date.now());
          setIsError(false);
          setErrorMessage(null);
          setIsLoading(false);
        }
      },
      (err) => {
        // Fallback silently to polling
      }
    );

    // 2. Initial fetch & backup polling (for local FastAPI and fallback)
    fetchGate1(false);
    const intervalId = setInterval(() => {
      fetchGate1(false);
    }, pollIntervalMs);

    return () => {
      isMountedRef.current = false;
      if (unsubscribeFirebase) unsubscribeFirebase();
      clearInterval(intervalId);
    };
  }, [fetchGate1, pollIntervalMs]);

  const refetch = useCallback(async () => {
    await fetchGate1(true);
  }, [fetchGate1]);

  // Compute clear user-friendly last updated label
  let lastUpdatedLabel = 'LIVE';
  if (isError) {
    if (lastSuccessTime) {
      const diffSecs = Math.round((Date.now() - lastSuccessTime) / 1000);
      if (diffSecs < 60) {
        lastUpdatedLabel = 'Last updated just now (Camera Offline)';
      } else {
        const mins = Math.floor(diffSecs / 60);
        lastUpdatedLabel = `Updated ${mins}m ago (Camera Offline)`;
      }
    } else {
      lastUpdatedLabel = 'Camera offline (Safe baseline)';
    }
  }

  return {
    crowdData,
    lastKnownData,
    isLoading,
    isError,
    errorMessage,
    lastUpdatedLabel,
    refetch,
  };
}
