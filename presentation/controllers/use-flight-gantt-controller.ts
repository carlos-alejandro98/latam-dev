import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import type { AppDispatch } from '@/store';
import { clearGanttData } from '@/store/slices/flight-gantt-slice';
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
    refreshTurnaroundMetrics,
  } = storeAdapter;
  const autoLoad = options?.autoLoad ?? true;

  // Track the previous flightId to detect real flight changes.
  const prevFlightIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!flightId || !autoLoad) {
      return;
    }

    // Only act when the flightId actually changed.
    if (prevFlightIdRef.current === flightId) {
      return;
    }

    prevFlightIdRef.current = flightId;

    // Clear stale gantt data from the previous flight.
    // The stream SSE (useGanttStream) will load the gantt via updateGanttData
    // on the 'connected' event — we do NOT dispatch fetchFlightGantt here to
    // avoid a second parallel HTTP call that would race with the stream and
    // potentially overwrite valid stream data with a 404/empty result.
    dispatch(clearGanttData());

  // flightId and autoLoad are the only real triggers.
  // dispatch is stable; prevFlightIdRef is a ref — neither needs to be a dep.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId, autoLoad]);

  return {
    gantt,
    loading,
    error,
    flightId: requestedFlightId,
    loadFlightGantt: storeAdapter.loadFlightGantt,
    refreshTurnaroundMetrics,
    patchTask: storeAdapter.patchTask,
  };
};
