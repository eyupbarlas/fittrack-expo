import { useState, useEffect, useRef, useCallback } from 'react';

interface UseWorkoutTimerReturn {
  elapsed: number;          // seconds elapsed
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  lap: () => number;        // returns current elapsed and resets lap counter
}

/**
 * Custom hook for tracking workout duration.
 * Starts automatically when mounted and can be paused/resumed.
 */
export const useWorkoutTimer = (autoStart = true): UseWorkoutTimerReturn => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lapStartRef = useRef(0);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    lapStartRef.current = 0;
  }, []);

  const lap = useCallback((): number => {
    const lapTime = elapsed - lapStartRef.current;
    lapStartRef.current = elapsed;
    return lapTime;
  }, [elapsed]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return { elapsed, isRunning, start, pause, reset, lap };
};
