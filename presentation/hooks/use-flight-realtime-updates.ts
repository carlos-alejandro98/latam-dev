import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { container } from '@/dependencyInjection/container';
import type { Flight } from '@/domain/entities/flight';
import { updateFlightsPatch } from '@/store/slices/flights-slice';

/**
 * Inicia la suscripción a actualizaciones en tiempo real de vuelos (WebSocket).
 * Si EXPO_PUBLIC_FLIGHTS_WS_URL no está configurada, no hace nada.
 * El store aplica patches con actualización diferencial (referencias estables).
 */
export function useFlightRealtimeUpdates(): void {
  const dispatch = useDispatch();

  const updatePatch = useCallback(
    (flights: Flight[]) => {
      dispatch(updateFlightsPatch(flights));
    },
    [dispatch],
  );

  useEffect(() => {
    const { startFlightRealtimeUpdatesUseCase } =
      container.createRealtimeUseCases(updatePatch);
    const unsubscribe = startFlightRealtimeUpdatesUseCase.execute();
    return unsubscribe;
  }, [updatePatch]);
}
