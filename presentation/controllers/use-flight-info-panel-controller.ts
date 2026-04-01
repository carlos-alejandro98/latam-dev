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
    flightId: requestedFlightId,
  } = useFlightGanttController(flight?.flightId);

  // Solo usamos el gantt del store si el flightId en el store coincide con el
  // vuelo activo. Esto evita que al cambiar de vuelo se muestren tareas del
  // vuelo anterior mientras el nuevo gantt aún está cargando, o que un vuelo
  // sin planificación "contamine" el siguiente vuelo seleccionado.
  const ganttBelongsToFlight =
    Boolean(flight) && requestedFlightId === flight?.flightId;
  const resolvedGantt = ganttBelongsToFlight ? gantt : null;

  const shouldUseRequestState = ganttBelongsToFlight;

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
