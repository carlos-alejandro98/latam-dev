import type {
  FlightGanttTask,
  GanttDateTime,
} from '@/domain/entities/flight-gantt';

const FALLBACK_TIME = '--:--';

type ResolveAvailableTimeInput = {
  end?: string | null;
  endDate?: string | null;
  endTime?: string | null;
  fallbackMinutes?: number | null;
  nowTimestamp?: number;
  start?: string | null;
  startDate?: string | null;
  startTime?: string | null;
};

export interface FlightAvailableTimeViewModel {
  isDelayed: boolean;
  label: string;
}

export type FlightMtdTone = 'ahead' | 'delayed' | 'neutral';

export interface FlightMtdViewModel {
  label: string;
  tone: FlightMtdTone;
}

export interface FlightTaskImpactSummary {
  delayMinutes: number;
  gainMinutes: number;
  netImpactMinutes: number;
}

const formatClockMinutes = (minutes: number): string => {
  const absoluteMinutes = Math.abs(minutes);
  const hours = Math.floor(absoluteMinutes / 60);
  const remainingMinutes = absoluteMinutes % 60;

  return `${String(hours).padStart(2, '0')}:${String(remainingMinutes).padStart(2, '0')}`;
};

const formatSignedClockMinutes = (minutes: number): string => {
  const clockValue = formatClockMinutes(minutes);
  return minutes < 0 ? `-${clockValue}` : clockValue;
};

const parseDateParts = (
  dateValue?: string | null,
): { day: number; month: number; year: number } | null => {
  if (!dateValue) {
    return null;
  }

  const rawDate = dateValue.split('T')[0]?.trim();
  if (!rawDate) {
    return null;
  }

  if (rawDate.includes('/')) {
    const parts = rawDate.split('/');
    if (parts.length !== 3) {
      return null;
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (!day || !month || !year) {
      return null;
    }

    return { day, month, year };
  }

  if (rawDate.includes('-')) {
    const parts = rawDate.split('-');
    if (parts.length !== 3) {
      return null;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    if (!day || !month || !year) {
      return null;
    }

    return { day, month, year };
  }

  return null;
};

const parseTimeParts = (
  timeValue?: string | null,
): { hours: number; minutes: number } | null => {
  if (!timeValue) {
    return null;
  }

  const normalizedTime =
    timeValue.includes('T') && timeValue.length >= 16
      ? timeValue.slice(11, 16)
      : timeValue;
  const parts = normalizedTime.split(':');

  if (parts.length < 2) {
    return null;
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return { hours, minutes };
};

const resolveTimestamp = (
  isoDateTime?: string | null,
  dateValue?: string | null,
  timeValue?: string | null,
): number | null => {
  if (isoDateTime) {
    const parsedDateTime = new Date(isoDateTime);
    if (!Number.isNaN(parsedDateTime.getTime())) {
      return parsedDateTime.getTime();
    }
  }

  const parsedDate = parseDateParts(dateValue);
  const parsedTime = parseTimeParts(timeValue);
  if (!parsedDate || !parsedTime) {
    return null;
  }

  const resolvedDateTime = new Date(
    parsedDate.year,
    parsedDate.month - 1,
    parsedDate.day,
    parsedTime.hours,
    parsedTime.minutes,
    0,
    0,
  );

  return Number.isNaN(resolvedDateTime.getTime())
    ? null
    : resolvedDateTime.getTime();
};

const ganttDateTimeToTimestamp = (value?: GanttDateTime): number | null => {
  if (!value || value.length < 5) {
    return null;
  }

  const [year, month, day, hours, minutes] = value;
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const getPlannedEndTimestamp = (task: FlightGanttTask): number | null => {
  const plannedEnd = ganttDateTimeToTimestamp(task.finProgramado);
  if (plannedEnd !== null) {
    return plannedEnd;
  }

  const plannedStart = ganttDateTimeToTimestamp(task.inicioProgramado);
  if (plannedStart !== null) {
    return plannedStart + task.duracionPlanificada * 60_000;
  }

  const calculatedEnd = ganttDateTimeToTimestamp(task.finCalculado);
  if (calculatedEnd !== null) {
    return calculatedEnd;
  }

  const calculatedStart = ganttDateTimeToTimestamp(task.inicioCalculado);
  if (calculatedStart !== null) {
    return calculatedStart + task.duracionPlanificada * 60_000;
  }

  return null;
};

const getPlannedStartTimestamp = (task: FlightGanttTask): number | null => {
  const plannedStart = ganttDateTimeToTimestamp(task.inicioProgramado);
  if (plannedStart !== null) {
    return plannedStart;
  }

  const plannedEnd = ganttDateTimeToTimestamp(task.finProgramado);
  if (plannedEnd !== null) {
    return plannedEnd - task.duracionPlanificada * 60_000;
  }

  const calculatedStart = ganttDateTimeToTimestamp(task.inicioCalculado);
  if (calculatedStart !== null) {
    return calculatedStart;
  }

  const calculatedEnd = ganttDateTimeToTimestamp(task.finCalculado);
  if (calculatedEnd !== null) {
    return calculatedEnd - task.duracionPlanificada * 60_000;
  }

  return null;
};

const getCompletedActualEndTimestamp = (
  task: FlightGanttTask,
  plannedEndTimestamp: number,
): number | null => {
  const realEnd = ganttDateTimeToTimestamp(task.finReal);
  if (realEnd !== null) {
    return realEnd;
  }

  const realStart = ganttDateTimeToTimestamp(task.inicioReal);
  if (realStart !== null && task.duracionReal !== null) {
    return realStart + task.duracionReal * 60_000;
  }

  if (task.varianzaFin !== null) {
    return plannedEndTimestamp + task.varianzaFin * 60_000;
  }

  return null;
};

export const resolveTaskImpactMinutes = (
  tasks: FlightGanttTask[],
  nowTimestamp: number = Date.now(),
): number => {
  return resolveTaskImpactSummary(tasks, nowTimestamp).netImpactMinutes;
};

const resolveOpenTaskDelayMinutes = (
  task: FlightGanttTask,
  nowTimestamp: number,
): number => {
  if (task.estaRetrasada && task.minutosDeRetraso > 0) {
    return task.minutosDeRetraso;
  }

  const realStartTimestamp = ganttDateTimeToTimestamp(task.inicioReal);
  const plannedStartTimestamp = getPlannedStartTimestamp(task);
  const plannedEndTimestamp = getPlannedEndTimestamp(task);

  if (realStartTimestamp === null && plannedStartTimestamp !== null) {
    return Math.max(
      0,
      Math.round((nowTimestamp - plannedStartTimestamp) / 60_000),
    );
  }

  if (plannedEndTimestamp !== null) {
    return Math.max(
      0,
      Math.round((nowTimestamp - plannedEndTimestamp) / 60_000),
    );
  }

  return 0;
};

export const resolveTaskImpactSummary = (
  tasks: FlightGanttTask[],
  nowTimestamp: number = Date.now(),
): FlightTaskImpactSummary => {
  const summary = tasks.reduce(
    (accumulator, task) => {
      const plannedEndTimestamp = getPlannedEndTimestamp(task);
      if (plannedEndTimestamp === null) {
        return accumulator;
      }

      const status = task.estado.toUpperCase().trim();
      const isCompleted = Boolean(task.finReal) || status === 'COMPLETED';
      if (!isCompleted) {
        const openDelayMinutes = resolveOpenTaskDelayMinutes(task, nowTimestamp);
        return {
          ...accumulator,
          delayMinutes: accumulator.delayMinutes + openDelayMinutes,
        };
      }

      const actualEndTimestamp = getCompletedActualEndTimestamp(
        task,
        plannedEndTimestamp,
      );

      if (actualEndTimestamp === null) {
        return accumulator;
      }

      const taskImpactMinutes = Math.round(
        (actualEndTimestamp - plannedEndTimestamp) / 60_000,
      );

      if (taskImpactMinutes > 0) {
        return {
          ...accumulator,
          delayMinutes: accumulator.delayMinutes + taskImpactMinutes,
        };
      }

      return {
        ...accumulator,
        gainMinutes: accumulator.gainMinutes + Math.abs(taskImpactMinutes),
      };
    },
    {
      delayMinutes: 0,
      gainMinutes: 0,
    },
  );

  return {
    ...summary,
    netImpactMinutes: summary.delayMinutes - summary.gainMinutes,
  };
};

export const resolveMtd = (
  taskImpactMinutes: number,
): FlightMtdViewModel => {
  if (taskImpactMinutes > 0) {
    return {
      label: `MTD -${formatClockMinutes(taskImpactMinutes)}`,
      tone: 'delayed',
    };
  }

  if (taskImpactMinutes < 0) {
    return {
      label: `MTD +${formatClockMinutes(taskImpactMinutes)}`,
      tone: 'ahead',
    };
  }

  return {
    label: 'MTD 00:00',
    tone: 'neutral',
  };
};

export const resolveAvailableTime = ({
  end,
  endDate,
  endTime,
  fallbackMinutes,
  nowTimestamp = Date.now(),
  start,
  startDate,
  startTime,
  taskDelayMinutes = 0,
  taskGainMinutes = 0,
}: ResolveAvailableTimeInput & {
  taskDelayMinutes?: number;
  taskGainMinutes?: number;
}): FlightAvailableTimeViewModel => {
  const startTimestamp = resolveTimestamp(start, startDate, startTime);
  const endTimestamp = resolveTimestamp(end, endDate, endTime);

  if (startTimestamp !== null && endTimestamp !== null) {
    const countdownStartTimestamp =
      nowTimestamp > startTimestamp ? nowTimestamp : startTimestamp;
    const diffMs = endTimestamp - countdownStartTimestamp;
    const diffMinutes =
      diffMs >= 0
        ? Math.ceil(diffMs / 60_000)
        : Math.floor(diffMs / 60_000);
    const delayedMinutes = diffMinutes - taskDelayMinutes;
    const adjustedMinutes =
      delayedMinutes < 0 ? delayedMinutes + taskGainMinutes : delayedMinutes;

    return {
      isDelayed: adjustedMinutes < 0,
      label: formatSignedClockMinutes(adjustedMinutes),
    };
  }

  if (fallbackMinutes !== null && fallbackMinutes !== undefined) {
    const delayedMinutes = Math.round(fallbackMinutes) - taskDelayMinutes;
    const adjustedMinutes =
      delayedMinutes < 0 ? delayedMinutes + taskGainMinutes : delayedMinutes;

    return {
      isDelayed: adjustedMinutes < 0,
      label: formatSignedClockMinutes(adjustedMinutes),
    };
  }

  return {
    isDelayed: false,
    label: FALLBACK_TIME,
  };
};
