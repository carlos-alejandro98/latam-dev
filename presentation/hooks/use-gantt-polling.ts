import { useCallback, useRef } from 'react';

/**
 * Exposes a `refresh()` function to reload the gantt on demand.
 * The gantt is ONLY updated when refresh() is explicitly called,
 * i.e. after a task start / finish / update action.
 * No periodic background polling is performed.
 *
 * @param flightId  - The flight to refresh. Pass null/undefined to disable.
 * @param loadGantt - Function that fetches/refreshes the gantt data.
 */
export function useGanttPolling(
  flightId: string | null | undefined,
  loadGantt: (id: string) => void,
): { refresh: () => void } {
  const loadGanttRef = useRef(loadGantt);
  loadGanttRef.current = loadGantt;

  const refresh = useCallback(() => {
    if (flightId) {
      loadGanttRef.current(flightId);
    }
  }, [flightId]);

  return { refresh };
}
