import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";
import {
  fetchFlightGantt,
  refreshTurnaroundMetrics,
  updateGanttData,
  optimisticUpdateTask,
} from "@/store/slices/flight-gantt-slice";
import type { FlightGantt } from "@/domain/entities/flight-gantt";

export const useFlightGanttStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();

  const gantt = useSelector((state: RootState) => state.flightGantt.data);
  const loading = useSelector((state: RootState) => state.flightGantt.loading);
  const error = useSelector((state: RootState) => state.flightGantt.error);
  const flightId = useSelector(
    (state: RootState) => state.flightGantt.flightId,
  );

  return {
    gantt,
    loading,
    error,
    flightId,
    loadFlightGantt: (selectedFlightId: string) =>
      dispatch(fetchFlightGantt(selectedFlightId)),
    refreshTurnaroundMetrics: (turnaroundId: string) =>
      dispatch(refreshTurnaroundMetrics(turnaroundId)),
    /** Applies a gantt update silently (no loading flash) — used by SSE stream. */
    applyGanttUpdate: (data: FlightGantt) =>
      dispatch(updateGanttData(data)),
    /** Optimistically patches a single task before the backend confirms. */
    patchTask: (payload: { instanceId: string; startTime?: string | null; endTime?: string | null }) =>
      dispatch(optimisticUpdateTask(payload)),
  };
};
