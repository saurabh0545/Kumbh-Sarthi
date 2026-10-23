import { useEffect, useRef } from 'react';

/**
 * Custom hook to execute a callback at a fixed interval with automatic cleanup.
 * @param callback The function to invoke
 * @param delay Interval in ms (pass null to pause)
 */
export function usePolling(callback: () => void | Promise<void>, delay: number | null): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    // Immediately invoke once
    savedCallback.current();

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}
