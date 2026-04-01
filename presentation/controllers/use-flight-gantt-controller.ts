import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from '@/store';
import { fetchFlightGantt } from '@/store/slices/flight-gantt-slice';
import { useFlightGanttStoreAdapter } from '../adapters/redux/flight-gantt-store-adapter';

interface UseFlightGanttControllerOptions {
  autoLoad?: boolean;
}

export const useFlightGanttController = (
  flightId?: string,
  options?: UseFlightGanttControllerOptions,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const storeAdapter = useFlightGanttStoreAdapter();
  const {
    gantt,
    loading,
    error,
    flightId: requestedFlightId,
    loadFlightGantt,
    refreshTurnaroundMetrics,
  } = storeAdapter;
  const autoLoad = options?.autoLoad ?? true;

  // Track whether we already started a fetch for this flightId so that a
  // re-render triggered by the stream's updateGanttData does not cause a
  // second parallel fetchFlightGantt that would race with the stream.
  const fetchedForRef = useRef<string | undefined>(undefined);

  // The store flightId and data — used to decide whether to fetch.
  const storeFlightId = useSelector((s: RootState) => s.flightGantt.flightId);
  const storeHasData  = useSelector((s: RootState) => s.flightGantt.data !== null);

  useEffect(() => {
    if (!flightId || !autoLoad) return;

    // If the store already has up-to-date data for this flight (loaded by the
    // stream's 'connected' event), skip the fetch entirely.
    if (storeFlightId === flightId && storeHasData) {
      fetchedForRef.current = flightId;
      return;
    }

    // Avoid dispatching a second fetch when React re-runs this effect due to
    // unrelated selector changes while the first fetch is still in-flight.
    if (fetchedForRef.current === flightId) return;
    fetchedForRef.current = flightId;

    const promise = dispatch(fetchFlightGantt(flightId));
    return () => {
      promise.abort();
      // Reset so the next flight change triggers a fresh fetch.
      fetchedForRef.current = undefined;
    };
  }, [flightId, autoLoad, dispatch, storeFlightId, storeHasData]);

  return {
    gantt,
    loading,
    error,
    flightId: requestedFlightId,
    loadFlightGantt,
    refreshTurnaroundMetrics,
    patchTask: storeAdapter.patchTask,
  };
};
