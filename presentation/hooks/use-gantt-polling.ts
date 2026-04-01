import { useCallback, useEffect, useRef } from 'react';

import { ENV } from '@/config/environment';

/**
 * Native fallback that emulates the web gantt stream by polling the API
 * every `ENV.ganttPollingIntervalMs` while a flight is selected.
 * Also exposes `refresh()` for manual reloads after task actions.
 *
 * @param flightId  - The flight to refresh. Pass null/undefined to disable.
 * @param loadGantt - Function that fetches/refreshes the gantt data.
 */
export function useGanttPolling(
  flightId: string | null | undefined,
  loadGantt: (id: string) => void | Promise<unknown>,
): { refresh: () => void } {
  const loadGanttRef = useRef(loadGantt);
  const isRefreshingRef = useRef(false);
  loadGanttRef.current = loadGantt;

  const refresh = useCallback((): void => {
    if (!flightId || isRefreshingRef.current) {
      return;
    }

    isRefreshingRef.current = true;
    void Promise.resolve(loadGanttRef.current(flightId)).finally(() => {
      isRefreshingRef.current = false;
    });
  }, [flightId]);

  useEffect(() => {
    if (!flightId || ENV.ganttPollingIntervalMs <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      refresh();
    }, ENV.ganttPollingIntervalMs);

    return () => {
      clearInterval(intervalId);
      isRefreshingRef.current = false;
    };
  }, [flightId, refresh]);

  return { refresh };
}
