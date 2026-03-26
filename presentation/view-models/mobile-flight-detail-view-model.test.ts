import { describe, expect, it } from '@jest/globals';

import type { Flight } from '@/domain/entities/flight';
import type { FlightGantt, FlightGanttTask } from '@/domain/entities/flight-gantt';

import { createMobileFlightDetailViewModel } from './mobile-flight-detail-view-model';

const baseFlight: Flight = {
  flightId: 'FLIGHT-123',
  numberArrival: 'LA1234',
  numberDeparture: 'LA5678',
  origin: 'SCL',
  destination: 'LIM',
  aircraftType: 'A320',
  aircraftPrefix: 'PR-FLIGHT',
  staTime: '05:10',
  staDate: '2025-12-01',
  etaTime: '05:14',
  etaDate: '2025-12-01',
  stdTime: '06:45',
  stdDate: '2025-12-01',
  etdTime: '06:50',
  etdDate: '2025-12-01',
  ata: null,
  std: '2025-12-01T06:45:00',
  atd: null,
  pushIn: null,
  pushOut: null,
  estimatedPushIn: '2025-12-01T05:12:00',
  parkPositionArrival: 'A1',
  parkPositionDeparture: 'B2',
  boardingGate: null,
  paxTotalArrival: 150,
  paxCnxArrival: 20,
  paxLocalArrival: 130,
  paxTotalDeparture: 155,
  paxCnxDeparture: 18,
  paxLocalDeparture: 137,
  wchrArrival: 0,
  wchrDeparture: 0,
  bagsCnxArrival: 0,
  bagsCnxDeparture: 0,
  tatVueloMinutos: 95,
  tatType: 'A320_CURTO',
  varianzaMinutos: 0,
  minutosDesembarqueProyectado: null,
  variacionDesembarque: null,
  factorCarga: null,
  tiempoTotalProyectadoRampa: null,
  variacionRampa: null,
  proporcionCarga: null,
  foArrival: 148,
  foDeparture: 152,
  ganttIniciado: false,
  ganttInicioTimestamp: null,
  ingestionTimestamp: '2025-12-01T04:00:00',
};

const buildTask = (
  overrides: Partial<FlightGanttTask> = {},
): FlightGanttTask => ({
  instanceId: 'task-instance-1',
  taskId: 'task-1',
  taskName: 'Desembarque',
  grupoFuncional: 'OPS',
  tipoEvento: 'TASK',
  fase: 'TURNAROUND',
  esPreTat: false,
  tiempoRelativoInicio: 0,
  tiempoRelativoFin: null,
  duracionPlanificada: 10,
  baseDurationMin: 10,
  inicioProgramado: [2025, 12, 1, 10, 0],
  finProgramado: [2025, 12, 1, 10, 10],
  inicioCalculado: [2025, 12, 1, 10, 2],
  finCalculado: [2025, 12, 1, 10, 12],
  estado: 'IN_PROGRESS',
  dependencias: [],
  triggerType: '',
  triggerReference: '',
  triggerOffset: 0,
  dependenciasCompletas: [],
  deberiaEstarEnProgreso: true,
  deberiaEstarCompletada: false,
  progresoActual: 50,
  estaRetrasada: false,
  minutosDeRetraso: 0,
  dependenciasCumplidas: true,
  inicioReal: [2025, 12, 1, 10, 4],
  finReal: null,
  duracionReal: null,
  varianzaInicio: null,
  varianzaFin: null,
  varianzaDuracion: null,
  ultimoUsuario: null,
  ultimoEvento: null,
  notas: null,
  ...overrides,
});

const buildGantt = (tasks: FlightGanttTask[]): FlightGantt => ({
  flight: {
    flightId: baseFlight.flightId,
    numberArrival: baseFlight.numberArrival,
    numberDeparture: baseFlight.numberDeparture,
    aircraftPrefix: baseFlight.aircraftPrefix,
    origin: baseFlight.origin,
    destination: baseFlight.destination,
    ata: null,
    pushIn: null,
    estimatedPushIn: [2025, 12, 1, 9, 12],
    parkPositionArrival: 'A1',
    parkPositionDeparture: 'B2',
    boardingGate: null,
    foArrival: 148,
    foDeparture: 152,
    ganttIniciado: false,
    ganttInicioTimestamp: null,
    tatVueloMinutos: 95,
    tatType: 'A320_CURTO',
  },
  tasks,
  summary: {
    totalTasks: tasks.length,
    completedTasks: 0,
    inProgressTasks: tasks.length,
    pendingTasks: 0,
    delayedTasks: 0,
    progresoGeneral: 50,
    varianzaTotalMinutos: null,
    tatVueloMinutos: 95,
    tatType: 'A320_CURTO',
  },
});

describe('createMobileFlightDetailViewModel', () => {
  it('keeps the correct prefix and hides terminal/service badges when the API has no data', () => {
    const result = createMobileFlightDetailViewModel(baseFlight, null);

    expect(result.departure.prefixLabel).toBe('PR-FLIGHT');
    expect(result.departure.serviceBadgeLabel).toBeNull();
    expect(result.departure.terminalBadgeLabel).toBeNull();
  });

  it('inherits task ids, planned times and status labels from the tablet view model', () => {
    const result = createMobileFlightDetailViewModel(
      baseFlight,
      buildGantt([buildTask()]),
    );

    expect(result.processCards[0].instanceId).toBe('task-instance-1');
    expect(result.processCards[0].statusLabel).toBe('En progreso');
    expect(result.processCards[0].plannedStartTime).toBe('10:02');
    expect(result.processCards[0].plannedEndTime).toBe('10:12');
  });

  it('exposes the last event time from gantt tasks for the mobile summary section', () => {
    const result = createMobileFlightDetailViewModel(
      baseFlight,
      buildGantt([
        buildTask({
          ultimoEvento: [2025, 12, 1, 10, 9],
        }),
      ]),
    );

    expect(result.processCards[0].lastEventTimeLabel).toBe('10:09');
    expect(result.processCards[0].lastEventTimestamp).toBe(
      new Date(2025, 11, 1, 10, 9).getTime(),
    );
  });

  it('shows ETD as fallback once push back exists', () => {
    const result = createMobileFlightDetailViewModel(
      {
        ...baseFlight,
        pushOut: '2025-12-01T06:41:00',
      },
      null,
    );

    expect(result.departure.primaryStats.find((stat) => stat.label === 'ETD')?.value).toBe('--:--');
  });
});
