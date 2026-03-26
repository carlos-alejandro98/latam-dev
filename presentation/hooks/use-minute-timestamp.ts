import { useEffect, useState } from 'react';

/**
 * Returns the current timestamp and updates it aligned to the start of each minute.
 */
export const useMinuteTimestamp = (): number => {
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const syncNow = () => {
      setNowTimestamp(Date.now());
    };

    const startInterval = () => {
      syncNow();
      intervalId = setInterval(syncNow, 60_000);
    };

    const timeoutMs = 60_000 - (Date.now() % 60_000);
    const timeoutId = setTimeout(startInterval, timeoutMs);

    syncNow();

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return nowTimestamp;
};
