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

export const resolveSecondsToAvailableEnd = ({
  end,
  endDate,
  endTime,
  nowTimestamp = Date.now(),
}: Pick<
  ResolveAvailableTimeInput,
  'end' | 'endDate' | 'endTime' | 'nowTimestamp'
>): number | null => {
  const endTimestamp = resolveTimestamp(end, endDate, endTime);
  if (endTimestamp === null) {
    return null;
  }

  return Math.round((endTimestamp - nowTimestamp) / 1000);
};

export const resolveFrozenPushOutDelaySeconds = ({
  end,
  endDate,
  endTime,
  pushOut,
}: Pick<ResolveAvailableTimeInput, 'end' | 'endDate' | 'endTime'> & {
  pushOut?: string | null;
}): number | null => {
  const endTimestamp = resolveTimestamp(end, endDate, endTime);
  const pushOutTimestamp = resolveTimestamp(pushOut);

  if (endTimestamp === null || pushOutTimestamp === null) {
    return null;
  }

  return Math.min(0, Math.round((endTimestamp - pushOutTimestamp) / 1000));
};

const ganttDateTimeToIsoString = (value?: GanttDateTime | null): string | null => {
  if (!value || value.length < 5) {
    return null;
  }

  const [year, month, day, hours, minutes] = value;
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
};

const normalizeTaskText = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const isPushBackTask = (task: FlightGanttTask): boolean => {
  const normalizedTaskName = normalizeTaskText(task.taskName);

  return (
    normalizedTaskName.includes('push back') ||
    normalizedTaskName.includes('pushback') ||
    normalizedTaskName.includes('push out') ||
    normalizedTaskName.includes('pushout')
  );
};

const isCompletedTask = (task: FlightGanttTask): boolean => {
  const status = task.estado.toUpperCase().trim();

  return (
    Boolean(task.finReal) ||
    (task.tipoEvento?.toUpperCase().trim() === 'HITO' && Boolean(task.inicioReal)) ||
    status === 'COMPLETED' ||
    status === 'COMPLETADA' ||
    status === 'COMPLETADO' ||
    status === 'FINALIZADO' ||
    status === 'FINALIZADA'
  );
};

const getTaskActualMomentIsoString = (task: FlightGanttTask): string | null => {
  return ganttDateTimeToIsoString(task.finReal ?? task.inicioReal);
};

export const resolveConfirmedPushOutTime = ({
  pushOut,
  tasks,
}: {
  pushOut?: string | null;
  tasks?: FlightGanttTask[] | null;
}): string | null => {
  const taskList = tasks ?? [];
  const pushOutTimestamp = resolveTimestamp(pushOut);

  const confirmedPushBackTask = taskList.find((task) => {
    if (!isCompletedTask(task) || !isPushBackTask(task)) {
      return false;
    }

    const actualMoment = getTaskActualMomentIsoString(task);
    if (!actualMoment) {
      return false;
    }

    if (pushOutTimestamp === null) {
      return true;
    }

    return resolveTimestamp(actualMoment) === pushOutTimestamp;
  });

  if (confirmedPushBackTask) {
    return getTaskActualMomentIsoString(confirmedPushBackTask);
  }

  if (pushOutTimestamp === null) {
    return null;
  }

  const completedHitoWithMatchingTime = taskList.find((task) => {
    if (
      task.tipoEvento?.toUpperCase().trim() !== 'HITO' ||
      !isCompletedTask(task)
    ) {
      return false;
    }

    const actualMoment = getTaskActualMomentIsoString(task);
    return actualMoment !== null && resolveTimestamp(actualMoment) === pushOutTimestamp;
  });

  return completedHitoWithMatchingTime ? pushOut ?? null : null;
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
