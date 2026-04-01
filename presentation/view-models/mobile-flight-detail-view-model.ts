import type { Flight } from '@/domain/entities/flight';
import type { FlightGantt, FlightGanttTask, GanttDateTime } from '@/domain/entities/flight-gantt';

import {
  createTabletFlightDetailViewModel,
  type TabletTaskStatusTone,
} from './tablet-flight-detail-view-model';

const FALLBACK_TEXT = '--';
const FALLBACK_TIME = '--:--';

export type MobileFlightPnaeIcon = 'baggage' | 'wheelchair' | 'connection';

export interface MobileFlightStatViewModel {
  label: string;
  value: string;
}

export interface MobileFlightPnaeItemViewModel {
  id: string;
  label: string;
  value: string;
  icon: MobileFlightPnaeIcon;
}

export interface MobileFlightProcessViewModel {
  id: string;
  instanceId: string;
  title: string;
  statusLabel: string;
  statusTone: TabletTaskStatusTone;
  lastEventTimeLabel: string;
  lastEventTimestamp: number | null;
  scheduledRangeLabel: string;
  startTimeLabel: string;
  endTimeLabel: string;
  plannedStartTime: string;
  plannedEndTime: string;
  durationLabel: string;
  scheduledValue: string;
  estimatedValue: string;
  isStarted: boolean;
  isFinished: boolean;
  tipoEvento: string;
}

export interface MobileFlightDetailViewModel {
  arrival: {
    title: string;
    stationLabel: string;
    flightNumber: string;
    dateLabel: string;
    prefixLabel: string;
    serviceBadgeLabel?: string | null;
    terminalBadgeLabel?: string | null;
    gateLabel: string;
    primaryStats: MobileFlightStatViewModel[];
    actionTime: MobileFlightStatViewModel;
  };
  departure: {
    title: string;
    stationLabel: string;
    flightNumber: string;
    dateLabel: string;
    prefixLabel: string;
    serviceBadgeLabel?: string | null;
    terminalBadgeLabel?: string | null;
    gateLabel: string;
    primaryStats: MobileFlightStatViewModel[];
    actionTime: MobileFlightStatViewModel;
  };
  pax: {
    total: string;
    onboard: string;
    remaining: string;
  };
  pnae: {
    items: MobileFlightPnaeItemViewModel[];
  };
  processCards: MobileFlightProcessViewModel[];
}

const formatCount = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return FALLBACK_TEXT;
  }

  return String(Math.round(value));
};

const parseCount = (value?: number | null): number => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
};

const getEstimatedValue = (
  startTimeLabel: string,
  endTimeLabel: string,
  scheduledRangeLabel: string,
): string => {
  if (startTimeLabel && startTimeLabel !== FALLBACK_TIME) {
    return startTimeLabel;
  }

  if (endTimeLabel && endTimeLabel !== FALLBACK_TIME) {
    return endTimeLabel;
  }

  return scheduledRangeLabel.split(' - ')[0] ?? FALLBACK_TIME;
};

const hasRealTime = (value: string): boolean => {
  return value !== FALLBACK_TIME;
};

const ganttDateTimeToHHmm = (value?: GanttDateTime | null): string => {
  if (!value || value.length < 5) {
    return FALLBACK_TIME;
  }

  const hours = value[3];
  const minutes = value[4];

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return FALLBACK_TIME;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const ganttDateTimeToTimestamp = (value?: GanttDateTime | null): number | null => {
  if (!value || value.length < 5) {
    return null;
  }

  const [year, month, day, hours, minutes] = value;
  const timestamp = new Date(year, month - 1, day, hours, minutes).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
};

export const createMobileFlightDetailViewModel = (
  flight: Flight,
  gantt?: FlightGantt | null,
): MobileFlightDetailViewModel => {
  const tabletViewModel = createTabletFlightDetailViewModel(flight, gantt);
  const ganttTasksByInstanceId = new Map<string, FlightGanttTask>(
    (gantt?.tasks ?? []).map((task) => [task.instanceId, task]),
  );
  const prefixLabel = tabletViewModel.header.registrationLabel;
  const totalPax = parseCount(flight.paxTotalDeparture);
  const onboardPax = Math.min(
    totalPax,
    parseCount(gantt?.flight.foDeparture ?? flight.foDeparture),
  );
  const remainingPax = Math.max(totalPax - onboardPax, 0);

  return {
    arrival: {
      title: tabletViewModel.arrival.title,
      stationLabel: tabletViewModel.arrival.stationLabel,
      flightNumber: tabletViewModel.arrival.flightNumber,
      dateLabel: tabletViewModel.arrival.dateLabel,
      prefixLabel,
      serviceBadgeLabel: tabletViewModel.arrival.serviceBadgeLabel ?? null,
      terminalBadgeLabel: tabletViewModel.arrival.terminalBadgeLabel ?? null,
      gateLabel: tabletViewModel.arrival.boxValue,
      primaryStats: tabletViewModel.arrival.primaryStats,
      actionTime: {
        label: tabletViewModel.arrival.actionTimeLabel,
        value: tabletViewModel.arrival.actionTimeValue,
      },
    },
    departure: {
      title: tabletViewModel.departure.title,
      stationLabel: tabletViewModel.departure.stationLabel,
      flightNumber: tabletViewModel.departure.flightNumber,
      dateLabel: tabletViewModel.departure.dateLabel,
      prefixLabel,
      serviceBadgeLabel: tabletViewModel.departure.serviceBadgeLabel ?? null,
      terminalBadgeLabel: tabletViewModel.departure.terminalBadgeLabel ?? null,
      gateLabel: tabletViewModel.departure.boxValue,
      primaryStats: tabletViewModel.departure.primaryStats,
      actionTime: {
        label: tabletViewModel.departure.actionTimeLabel,
        value: tabletViewModel.departure.actionTimeValue,
      },
    },
    pax: {
      total: formatCount(totalPax),
      onboard: formatCount(onboardPax),
      remaining: formatCount(remainingPax),
    },
    pnae: {
      items: [
        {
          id: 'bags-departure',
          label: 'Bagagens em conexao',
          value: formatCount(flight.bagsCnxDeparture),
          icon: 'baggage',
        },
        {
          id: 'wheelchair-departure',
          label: 'WCHR partida',
          value: formatCount(flight.wchrDeparture),
          icon: 'wheelchair',
        },
        {
          id: 'connection-departure',
          label: 'PAX conexao partida',
          value: formatCount(flight.paxCnxDeparture),
          icon: 'connection',
        },
        {
          id: 'bags-arrival',
          label: 'Bagagens chegada',
          value: formatCount(flight.bagsCnxArrival),
          icon: 'baggage',
        },
        {
          id: 'wheelchair-arrival',
          label: 'WCHR chegada',
          value: formatCount(flight.wchrArrival),
          icon: 'wheelchair',
        },
        {
          id: 'connection-arrival',
          label: 'PAX conexao chegada',
          value: formatCount(flight.paxCnxArrival),
          icon: 'connection',
        },
      ],
    },
    processCards: tabletViewModel.tasks.map((task) => {
      const ganttTask = ganttTasksByInstanceId.get(task.instanceId);

      return {
        id: task.id,
        instanceId: task.instanceId,
        title: task.title,
        statusLabel: task.statusLabel,
        statusTone: task.statusTone,
        lastEventTimeLabel: ganttDateTimeToHHmm(ganttTask?.ultimoEvento),
        lastEventTimestamp: ganttDateTimeToTimestamp(ganttTask?.ultimoEvento),
        scheduledRangeLabel: task.scheduledRangeLabel,
        startTimeLabel: task.startTimeLabel,
        endTimeLabel: task.endTimeLabel,
        plannedStartTime: task.plannedStartTime,
        plannedEndTime: task.plannedEndTime,
        durationLabel: task.durationLabel,
        scheduledValue: task.scheduledRangeLabel.split(' - ')[0] ?? FALLBACK_TIME,
        estimatedValue: getEstimatedValue(
          task.startTimeLabel,
          task.endTimeLabel,
          task.scheduledRangeLabel,
        ),
        isStarted: hasRealTime(task.startTimeLabel),
        isFinished: hasRealTime(task.endTimeLabel),
        tipoEvento: task.tipoEvento,
      };
    }),
  };
};
