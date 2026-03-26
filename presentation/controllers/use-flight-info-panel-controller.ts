import { useMemo } from 'react';

import type { Flight } from '@/domain/entities/flight';
import { useMinuteTimestamp } from '@/presentation/hooks/use-minute-timestamp';
import { createFlightInfoPanelViewModel } from '@/presentation/view-models/flight-info-panel-view-model';

import { useFlightGanttController } from './use-flight-gantt-controller';

export const useFlightInfoPanelController = (flight: Flight | null) => {
  const nowTimestamp = useMinuteTimestamp();
  const {
    gantt,
    loading,
    error,
    flightId: requestedFlightId,
  } = useFlightGanttController(flight?.flightId);

  const resolvedGantt =
    flight && gantt?.flight?.flightId === flight.flightId ? gantt : null;
  const shouldUseRequestState =
    Boolean(flight) && requestedFlightId === flight?.flightId;

  const viewModel = useMemo(() => {
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
