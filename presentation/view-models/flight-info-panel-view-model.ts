import type { Flight } from '@/domain/entities/flight';
import type {
  FlightGantt,
  FlightGanttTask,
} from '@/domain/entities/flight-gantt';
import {
  resolveAvailableTime,
  resolveMtd,
  resolveTaskImpactSummary,
  type FlightMtdTone,
} from '@/presentation/view-models/flight-available-time';

export type FlightInfoPanelTagType = 'successSoftDot' | 'infoSoftDot';

export interface FlightInfoPanelInfoItemViewModel {
  label: string;
  value: string;
}

export interface FlightInfoPanelStatusViewModel {
  label: string;
  type: FlightInfoPanelTagType;
}

export interface FlightInfoPanelSideViewModel {
  title: 'ARRIVAL' | 'DEPARTURE';
  flightNumber: string;
  dateLabel: string;
  passengerCount: string;
  station: string;
  infoItems: FlightInfoPanelInfoItemViewModel[];
  status?: FlightInfoPanelStatusViewModel;
  actionTime: {
    label: string;
    value: string;
  };
}

export interface FlightInfoPanelSummaryViewModel {
  prefix: string;
  fleetLabel: string;
  availableTime: string;
  availableTimeDelayed: boolean;
  mtdLabel: string;
  mtdTone: FlightMtdTone;
}

export interface FlightInfoPanelEventItemViewModel {
  id: string;
  timeLabel: string;
  description: string;
  source?: string; // badge label e.g. "SIGA"
}

export interface FlightInfoPanelEventsViewModel {
  title: string;
  items: FlightInfoPanelEventItemViewModel[];       // Hitos
  alertItems: FlightInfoPanelEventItemViewModel[];  // Alertas
  chatItems: FlightInfoPanelEventItemViewModel[];   // Chat
  emptyMessage: string;
}

export interface FlightInfoPanelTimelineViewModel {
  staTime?: string | null;
  stdDate?: string | null;
  stdTime?: string | null;
  etdTime?: string | null;
  pushOutTime?: string | null;
  tatVueloMinutos?: number | null;
  tasks: FlightGanttTask[];
}

export interface FlightInfoPanelViewModel {
  arrival: FlightInfoPanelSideViewModel;
  departure: FlightInfoPanelSideViewModel;
  summary: FlightInfoPanelSummaryViewModel;
  timeline: FlightInfoPanelTimelineViewModel;
  events: FlightInfoPanelEventsViewModel;
}

const FALLBACK_DATE = '--/--';
const FALLBACK_TIME = '--:--';
const FALLBACK_TEXT = '--';
const ETD_FALLBACK_TEXT = '----';

const formatShortDate = (value?: string | null): string => {
  if (!value) {
    return FALLBACK_DATE;
  }

  const datePart = value.split('T')[0]?.trim();
  if (!datePart) {
    return FALLBACK_DATE;
  }

  if (datePart.includes('-')) {
    const parts = datePart.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
  }

  if (datePart.includes('/')) {
    const parts = datePart.split('/');
    if (parts.length === 3) {
      const [first, second, third] = parts;
      if (first.length === 4) {
        return `${third}/${second}`;
      }

      return `${first}/${second}`;
    }
  }

  return FALLBACK_DATE;
};

const formatTimeValue = (
  value?: string | [number, number, number, number, number] | null,
): string => {
  if (!value) {
    return FALLBACK_TIME;
  }

  if (Array.isArray(value)) {
    const hours = value[3];
    const minutes = value[4];
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  if (value.includes('T') && value.length >= 16) {
    return value.slice(11, 16);
  }

  return value;
};

const formatEtdDisplayValue = (
  stdTime?: string | null,
  etdTime?: string | null,
): string => {
  const formattedStd = formatTimeValue(stdTime);
  const formattedEtd = formatTimeValue(etdTime);

  if (
    etdTime &&
    formattedStd !== FALLBACK_TIME &&
    formattedEtd !== FALLBACK_TIME &&
    formattedStd === formattedEtd
  ) {
    return ETD_FALLBACK_TEXT;
  }

  return formattedEtd;
};

const formatMinutesToTime = (minutes?: number | null): string => {
  if (minutes === null || minutes === undefined) {
    return FALLBACK_TIME;
  }

  const totalMinutes = Math.max(0, minutes);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const getFleetFromTatType = (tatType?: string | null): string => {
  if (!tatType) {
    return '';
  }

  const match = tatType.match(/A\d{3}/i);
  return match ? match[0].toUpperCase() : '';
};

const formatCount = (value?: number | null): string => {
  if (value === null || value === undefined) {
    return FALLBACK_TEXT;
  }

  return String(value);
};

const getEventTimeLabel = (task: FlightGanttTask): string => {
  return formatTimeValue(
    task.ultimoEvento ??
    task.inicioReal ??
    task.inicioCalculado ??
    task.inicioProgramado ??
    task.finProgramado,
  );
};

const getComparableTaskTimestamp = (task: FlightGanttTask): number => {
  const dateTime =
    task.ultimoEvento ??
    task.inicioReal ??
    task.inicioCalculado ??
    task.inicioProgramado ??
    task.finProgramado;

  if (!dateTime) {
    return Number.MAX_SAFE_INTEGER;
  }

  const [year, month, day, hours, minutes] = dateTime;
  return new Date(year, month - 1, day, hours, minutes).getTime();
};

const sortTasksByTimeline = (tasks: FlightGanttTask[]): FlightGanttTask[] => {
  return [...tasks].sort((leftTask, rightTask) => {
    return (
      getComparableTaskTimestamp(leftTask) -
      getComparableTaskTimestamp(rightTask)
    );
  });
};

const buildMilestoneItems = (
  tasks: FlightGanttTask[],
): FlightInfoPanelEventItemViewModel[] => {
  return sortTasksByTimeline(tasks).map((task) => ({
    id: task.taskId,
    timeLabel: getEventTimeLabel(task),
    description: task.taskName,
    source: 'SIGA',
  }));
};

const getMinutesDiff = (
  startDate?: string | null,
  startTime?: string | null,
  endDate?: string | null,
  endTime?: string | null,
): number | null => {
  if (!startDate || !startTime || !endDate || !endTime) {
    return null;
  }

  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  let diff = Math.round((end.getTime() - start.getTime()) / 60000);
  if (diff < 0) {
    diff += 24 * 60;
  }

  return diff;
};

export const createFlightInfoPanelViewModel = (
  flight: Flight,
  gantt?: FlightGantt | null,
  nowTimestamp: number = Date.now(),
): FlightInfoPanelViewModel => {
  const ganttFlight = gantt?.flight;
  const ganttSummary = gantt?.summary;
  const timelineTasks = gantt?.tasks ?? [];

  const numberArrival =
    flight.numberArrival ?? ganttFlight?.numberArrival ?? FALLBACK_TEXT;
  const numberDeparture =
    flight.numberDeparture ?? ganttFlight?.numberDeparture ?? FALLBACK_TEXT;
  const prefix =
    ganttFlight?.aircraftPrefix ||
    flight.aircraftPrefix ||
    FALLBACK_TEXT;
  const arrivalPark =
    ganttFlight?.parkPositionArrival ??
    flight.parkPositionArrival ??
    FALLBACK_TEXT;
  const departureBox =
    ganttFlight?.parkPositionDeparture ??
    flight.parkPositionDeparture ??
    FALLBACK_TEXT;
  const boardingGate =
    ganttFlight?.boardingGate ?? flight.boardingGate ?? FALLBACK_TEXT;
  const pushInValue =
    ganttFlight?.pushIn ??
    ganttFlight?.estimatedPushIn ??
    flight.estimatedPushIn ??
    flight.pushIn;
  const pushOutValue = flight.pushOut ?? flight.etdTime;
  const isArrivalReal = Boolean(ganttFlight?.ata ?? flight.ata);
  const tatMinutes =
    ganttSummary?.tatVueloMinutos ??
    ganttFlight?.tatVueloMinutos ??
    flight.tatVueloMinutos;
  const tatType =
    ganttSummary?.tatType ?? ganttFlight?.tatType ?? flight.tatType;
  const fleetLabel =
    getFleetFromTatType(tatType) || flight.aircraftType || FALLBACK_TEXT;
  const availableEndDate = flight.etdDate || flight.stdDate;
  const availableEndTime = flight.etdTime || flight.stdTime;
  const availableMinutes =
    tatMinutes ??
    getMinutesDiff(
      flight.etaDate,
      flight.etaTime,
      availableEndDate,
      availableEndTime,
    );
  const taskImpact = resolveTaskImpactSummary(timelineTasks, nowTimestamp);
  const availableTime = resolveAvailableTime({
    endDate: availableEndDate,
    endTime: availableEndTime,
    fallbackMinutes: availableMinutes,
    nowTimestamp,
    start: ganttFlight?.pushIn ?? flight.pushIn,
    startDate: flight.etaDate,
    startTime: flight.etaTime,
    taskDelayMinutes: taskImpact.delayMinutes,
    taskGainMinutes: taskImpact.gainMinutes,
  });
  const mtd = resolveMtd(taskImpact.netImpactMinutes);
  const origin = ganttFlight?.origin ?? flight.origin ?? FALLBACK_TEXT;
  const destination =
    ganttFlight?.destination ?? flight.destination ?? FALLBACK_TEXT;
  const foArrivalValue = ganttFlight?.foArrival ?? flight.foArrival;
  const foDepartureValue = ganttFlight?.foDeparture ?? flight.foDeparture;

  return {
    arrival: {
      title: 'ARRIVAL',
      flightNumber: numberArrival,
      dateLabel: formatShortDate(flight.staDate),
      passengerCount: formatCount(foArrivalValue),
      station: origin,
      infoItems: [
        { label: 'STA', value: formatTimeValue(flight.staTime) },
        { label: 'ETA', value: formatTimeValue(flight.etaTime) },
        { label: 'BOX', value: arrivalPark },
        { label: 'PORTAO', value: boardingGate },
      ],
      status: {
        label: isArrivalReal ? 'REAL' : 'PREV',
        type: isArrivalReal ? 'successSoftDot' : 'infoSoftDot',
      },
      actionTime: {
        label: 'PUSH-IN',
        value: formatTimeValue(pushInValue),
      },
    },
    departure: {
      title: 'DEPARTURE',
      flightNumber: numberDeparture,
      dateLabel: formatShortDate(flight.staDate),
      passengerCount: formatCount(foDepartureValue),
      station: destination,
      infoItems: [
        { label: 'STD', value: formatTimeValue(flight.stdTime) },
        { label: 'ETD', value: formatEtdDisplayValue(flight.stdTime, flight.etdTime) },
        { label: 'BOX', value: departureBox },
        { label: 'PORTÃO', value: boardingGate },
      ],
      actionTime: {
        label: 'PUSH-BACK',
        value: formatTimeValue(pushOutValue),
      },
    },
    summary: {
      prefix,
      fleetLabel,
      availableTime: availableTime.label,
      availableTimeDelayed: availableTime.isDelayed,
      mtdLabel: mtd.label,
      mtdTone: mtd.tone,
    },
    timeline: {
      staTime: flight.staTime,
      stdDate: flight.stdDate,
      stdTime: flight.stdTime,
      etdTime: flight.etdTime,
      pushOutTime: flight.pushOut,
      tasks: timelineTasks,
      tatVueloMinutos: tatMinutes,
    },
    events: {
      title: 'Eventos de Voo',
      items: buildMilestoneItems(timelineTasks),
      alertItems: [],
      chatItems: [],
      emptyMessage: 'Sin eventos disponibles para este vuelo.',
    },
  };
};
