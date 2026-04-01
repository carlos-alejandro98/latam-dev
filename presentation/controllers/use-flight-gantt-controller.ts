import { useEffect } from 'react';
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

  useEffect(() => {
    if (!flightId || !autoLoad) return;
    // Dispatch the thunk and keep the returned promise so we can abort it if
    // the flightId changes before the request completes. This prevents stale
    // responses from a previous flight from overwriting the current flight's
    // data in the store.
    const promise = dispatch(fetchFlightGantt(flightId));
    return () => {
      promise.abort();
    };
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
