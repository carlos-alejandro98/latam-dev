import { useCallback, useMemo } from 'react';

import type { Flight } from '@/domain/entities/flight';
import {
  createMobileFlightDetailViewModel,
  type MobileFlightProcessViewModel,
} from '@/presentation/view-models/mobile-flight-detail-view-model';

import {
  useTaskEditModalController,
  type TaskEditModalController,
} from './use-task-edit-modal-controller';
import { useFlightGanttController } from './use-flight-gantt-controller';
import {
  useFlightTaskActions,
  type FlightTaskActionResult,
} from './use-flight-task-actions';

export type MobileTaskEditModalController =
  TaskEditModalController<MobileFlightProcessViewModel>;

const FALLBACK_TIME = '--:--';

const hasRealTime = (value: string): boolean => {
  return value !== FALLBACK_TIME;
};

const getEstimatedValue = (
  startTimeLabel: string,
  endTimeLabel: string,
  scheduledRangeLabel: string,
): string => {
  if (hasRealTime(startTimeLabel)) {
    return startTimeLabel;
  }

  if (hasRealTime(endTimeLabel)) {
    return endTimeLabel;
  }

  return scheduledRangeLabel.split(' - ')[0] ?? FALLBACK_TIME;
};

const applyOptimisticTask = (
  task: MobileFlightProcessViewModel,
  override?: FlightTaskActionResult,
): MobileFlightProcessViewModel => {
  if (!override) {
    return task;
  }

  const startTimeLabel = override.startTimeLabel ?? task.startTimeLabel;
  const endTimeLabel = override.endTimeLabel ?? task.endTimeLabel;

  return {
    ...task,
    statusTone: override.statusTone,
    statusLabel: override.statusLabel,
    startTimeLabel,
    endTimeLabel,
    durationLabel: override.durationLabel ?? task.durationLabel,
    estimatedValue: getEstimatedValue(
      startTimeLabel,
      endTimeLabel,
      task.scheduledRangeLabel,
    ),
    isStarted: hasRealTime(startTimeLabel),
    isFinished: hasRealTime(endTimeLabel),
  };
};

export const useMobileFlightDetailController = (flight: Flight | null) => {
  const {
    gantt,
    loading,
    error,
    flightId: requestedFlightId,
    loadFlightGantt,
    patchTask,
  } = useFlightGanttController(flight?.flightId);
  const taskActions = useFlightTaskActions({
    flight,
    patchTask,
    loadFlightGantt,
  });
  const taskEditModal =
    useTaskEditModalController<MobileFlightProcessViewModel>({
      flightId: flight?.flightId,
      onStartTask: taskActions.startTask,
      onFinishTask: taskActions.finishTask,
      onUpdateTask: taskActions.updateTask,
    });

  const resolvedGantt =
    flight && gantt?.flight?.flightId === flight.flightId ? gantt : null;
  const shouldUseRequestState =
    Boolean(flight) && requestedFlightId === flight?.flightId;

  const viewModel = useMemo(() => {
    if (!flight) {
      return null;
    }

    const baseViewModel = createMobileFlightDetailViewModel(flight, resolvedGantt);

    return {
      ...baseViewModel,
      processCards: baseViewModel.processCards.map((task) =>
        applyOptimisticTask(task, taskActions.optimisticTasks[task.instanceId]),
      ),
    };
  }, [flight, resolvedGantt, taskActions.optimisticTasks]);

  const reload = useCallback(() => {
    if (flight?.flightId) {
      loadFlightGantt(flight.flightId);
    }
  }, [flight?.flightId, loadFlightGantt]);

  return {
    viewModel,
    reload,
    taskEditModal,
    loading: shouldUseRequestState ? loading : false,
    error: shouldUseRequestState ? error : undefined,
  };
};
