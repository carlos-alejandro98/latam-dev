import { useCallback, useEffect, useMemo, useState } from 'react';

import type { Flight } from '@/domain/entities/flight';
import {
  createTabletFlightDetailViewModel,
  type TabletTaskCategory,
  type TabletFlightTaskViewModel,
} from '@/presentation/view-models/tablet-flight-detail-view-model';
import { useMinuteTimestamp } from '@/presentation/hooks/use-minute-timestamp';
import { useGanttPolling } from '@/presentation/hooks/use-gantt-polling';

import { useFlightGanttController } from './use-flight-gantt-controller';
import {
  useFlightTaskActions,
  type FlightTaskActionResult,
} from './use-flight-task-actions';
import { useTaskEditModalController } from './use-task-edit-modal-controller';

const TABLET_TASK_FILTERS: Array<{
  id: TabletTaskCategory;
  label: string;
}> = [
  { id: 'all', label: 'Todos' },
  { id: 'aircraft', label: 'Aeronave' },
  { id: 'services', label: 'Servicios' },
  { id: 'cargo', label: 'Carga' },
];

const FALLBACK_TIME = '--:--';

const applyOptimisticTask = (
  task: TabletFlightTaskViewModel,
  override?: FlightTaskActionResult,
): TabletFlightTaskViewModel => {
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
    realStartTime: startTimeLabel === FALLBACK_TIME ? null : startTimeLabel,
    realEndTime: endTimeLabel === FALLBACK_TIME ? null : endTimeLabel,
  };
};

export const useTabletFlightDetailController = (flight: Flight | null) => {
  const nowTimestamp = useMinuteTimestamp();
  const {
    gantt,
    loading,
    error,
    flightId: requestedFlightId,
    loadFlightGantt,
    refreshTurnaroundMetrics,
    patchTask,
  } = useFlightGanttController(flight?.flightId);
  const taskActions = useFlightTaskActions({
    flight,
    patchTask,
    loadFlightGantt,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isReloading, setIsReloading] = useState(false);
  const [activeCategory, setActiveCategory] =
    useState<TabletTaskCategory>('all');

  useEffect(() => {
    setSearchDraft('');
    setSearchQuery('');
    setActiveCategory('all');
  }, [flight?.flightId]);

  const resolvedGantt =
    flight && gantt?.flight?.flightId === flight.flightId ? gantt : null;
  const shouldUseRequestState =
    Boolean(flight) && requestedFlightId === flight?.flightId;

  const viewModel = useMemo(() => {
    if (!flight) {
      return null;
    }

    const baseViewModel = createTabletFlightDetailViewModel(
      flight,
      resolvedGantt,
      nowTimestamp,
    );

    return {
      ...baseViewModel,
      tasks: baseViewModel.tasks.map((task) =>
        applyOptimisticTask(task, taskActions.optimisticTasks[task.instanceId]),
      ),
    };
  }, [flight, nowTimestamp, resolvedGantt, taskActions.optimisticTasks]);

  const filteredTasks = useMemo(() => {
    if (!viewModel) {
      return [];
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();

    return viewModel.tasks.filter((task) => {
      const matchesCategory =
        activeCategory === 'all' || task.category === activeCategory;
      const matchesSearch =
        !normalizedQuery || task.searchText.includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, viewModel]);

  const applySearch = useCallback(() => {
    setSearchQuery(searchDraft);
  }, [searchDraft]);

  const reload = useCallback(async () => {
    if (!flight?.flightId || isReloading) {
      return;
    }

    setIsReloading(true);

    try {
      if (resolvedGantt?.turnaroundId) {
        await refreshTurnaroundMetrics(resolvedGantt.turnaroundId);
      }

      await loadFlightGantt(flight.flightId);
    } finally {
      setIsReloading(false);
    }
  }, [
    flight?.flightId,
    isReloading,
    loadFlightGantt,
    refreshTurnaroundMetrics,
    resolvedGantt?.turnaroundId,
  ]);

  // Periodic polling — refreshes gantt automatically every ENV.ganttPollingIntervalMs
  const { refresh: refreshGantt } = useGanttPolling(flight?.flightId ?? null, loadFlightGantt);
  const taskEditModal = useTaskEditModalController<TabletFlightTaskViewModel>({
    flightId: flight?.flightId,
    onStartTask: taskActions.startTask,
    onFinishTask: taskActions.finishTask,
    onUpdateTask: taskActions.updateTask,
  });

  return {
    viewModel,
    filteredTasks,
    filterOptions: TABLET_TASK_FILTERS,
    searchDraft,
    setSearchDraft,
    activeCategory,
    setActiveCategory,
    applySearch,
    reload,
    refreshGantt,
    patchTask,
    taskEditModal,
    taskActions,
    loadFlightGantt,
    reloading: isReloading,
    flightId: flight?.flightId ?? null,
    std: flight?.stdTime ?? null,
    loading: shouldUseRequestState ? loading : false,
    error: shouldUseRequestState ? error : undefined,
  };
};
