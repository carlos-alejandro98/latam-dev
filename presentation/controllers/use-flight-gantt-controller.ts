import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';
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

  // Track the last flightId we actually dispatched a fetch for so that
  // re-renders triggered by Redux state changes (which recreate loadFlightGantt)
  // do not cause a second fetch for the same flight.
  const lastFetchedFlightIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!flightId || !autoLoad) return;
    if (lastFetchedFlightIdRef.current === flightId) return;
    lastFetchedFlightIdRef.current = flightId;
    // Dispatch the thunk directly so loadFlightGantt is not a dependency,
    // preventing the effect from re-running on every Redux state change.
    void dispatch(fetchFlightGantt(flightId));
  }, [flightId, autoLoad, dispatch]);

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
