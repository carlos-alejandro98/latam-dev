import { useMemo } from 'react';

import type { Flight } from '@/domain/entities/flight';
import { useMinuteTimestamp } from '@/presentation/hooks/use-minute-timestamp';
import {
  createFlightInfoPanelViewModel,
  type FlightInfoPanelViewModel,
} from '@/presentation/view-models/flight-info-panel-view-model';

import { useFlightGanttController } from './use-flight-gantt-controller';

export const useFlightInfoPanelController = (
  flight: Flight | null,
): {
  viewModel: FlightInfoPanelViewModel | null;
  loading: boolean;
  error: string | undefined;
} => {
  const nowTimestamp = useMinuteTimestamp();
  const {
    gantt,
    loading,
    error,
  } = useFlightGanttController(flight?.flightId);

  // El gantt se muestra siempre que haya un vuelo activo.
  // La garantía de que el gantt corresponde al vuelo correcto viene de dos mecanismos:
  // 1. clearGanttData() en useFlightGanttController limpia el store al cambiar de vuelo.
  // 2. El stream SSE y fetchFlightGantt siempre usan el flightId activo.
  // La validación estricta requestedFlightId === flight.flightId creaba una ventana de
  // tiempo donde resolvedGantt era null incluso con datos válidos en el store,
  // causando que el timeline no renderizara las barras de procesos.
  const resolvedGantt = flight ? gantt : null;

  const shouldUseRequestState = Boolean(flight);

  const viewModel = useMemo((): FlightInfoPanelViewModel | null => {
    if (!flight) {
      return null;
    }
    return createFlightInfoPanelViewModel(flight, resolvedGantt, nowTimestamp);
  }, [flight, resolvedGantt, nowTimestamp]);

  return {
    viewModel,
    loading: shouldUseRequestState ? loading : false,
    error: shouldUseRequestState ? error : undefined,
  };
};
