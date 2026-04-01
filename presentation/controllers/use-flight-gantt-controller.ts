import { useEffect } from 'react';
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
    loadFlightGantt,
    refreshTurnaroundMetrics,
  } = storeAdapter;
  const autoLoad = options?.autoLoad ?? true;

  useEffect(() => {
    if (flightId && autoLoad) {
      // Limpiar el gantt anterior antes de cargar el nuevo vuelo para evitar
      // que las tareas del vuelo previo se muestren durante la transición.
      dispatch(clearGanttData());
      loadFlightGantt(flightId);
    }
  }, [autoLoad, dispatch, flightId, loadFlightGantt]);

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
