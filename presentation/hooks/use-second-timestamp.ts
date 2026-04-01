import { useEffect, useState } from 'react';

/**
 * Returns the current timestamp and updates it every second.
 * Use for UI elements that need sub-minute precision (e.g. hh:mm:ss countdown,
 * the live "now" line on the Gantt).
 */
export const useSecondTimestamp = (): number => {
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNowTimestamp(Date.now());
    }, 1_000);

    return () => clearInterval(intervalId);
  }, []);

  return nowTimestamp;
};
