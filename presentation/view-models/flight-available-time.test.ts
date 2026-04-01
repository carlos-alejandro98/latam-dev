import { describe, expect, it } from '@jest/globals';

import type { FlightGanttTask } from '@/domain/entities/flight-gantt';

import {
  resolveConfirmedPushOutTime,
  resolveFrozenPushOutDelaySeconds,
  resolveSecondsToAvailableEnd,
} from './flight-available-time';

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
  inicioCalculado: [2025, 12, 1, 10, 0],
  finCalculado: [2025, 12, 1, 10, 10],
  estado: 'PENDING',
  dependencias: [],
  triggerType: '',
  triggerReference: '',
  triggerOffset: 0,
  dependenciasCompletas: [],
  deberiaEstarEnProgreso: false,
  deberiaEstarCompletada: false,
  progresoActual: 0,
  estaRetrasada: false,
  minutosDeRetraso: 0,
  dependenciasCumplidas: true,
  inicioReal: null,
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

describe('flight-available-time helpers', () => {
  it('counts down against ETD/STD using the provided flight date and time', () => {
    const seconds = resolveSecondsToAvailableEnd({
      endDate: '2025-12-01',
      endTime: '06:50',
      nowTimestamp: new Date('2025-12-01T06:45:00').getTime(),
    });

    expect(seconds).toBe(300);
  });

  it('freezes the timer with only the push-back delay when departure is late', () => {
    const seconds = resolveFrozenPushOutDelaySeconds({
      endDate: '2025-12-01',
      endTime: '06:50',
      pushOut: '2025-12-01T06:53:00',
    });

    expect(seconds).toBe(-180);
  });

  it('freezes the timer at zero when push-back happens on time or earlier', () => {
    const seconds = resolveFrozenPushOutDelaySeconds({
      endDate: '2025-12-01',
      endTime: '06:50',
      pushOut: '2025-12-01T06:48:00',
    });

    expect(seconds).toBe(0);
  });

  it('does not confirm push-back from the API alone when no milestone was marked', () => {
    const confirmedPushOut = resolveConfirmedPushOutTime({
      pushOut: '2025-12-01T06:53:00',
      tasks: [],
    });

    expect(confirmedPushOut).toBeNull();
  });

  it('confirms push-back when the push-back hito was completed with a real time', () => {
    const confirmedPushOut = resolveConfirmedPushOutTime({
      pushOut: '2025-12-01T06:53:00',
      tasks: [
        buildTask({
          taskId: 'push-back',
          instanceId: 'push-back-instance',
          taskName: 'Push Back',
          tipoEvento: 'HITO',
          estado: 'COMPLETED',
          inicioReal: [2025, 12, 1, 6, 53],
          inicioProgramado: [2025, 12, 1, 6, 53],
          finProgramado: [2025, 12, 1, 6, 53],
          inicioCalculado: [2025, 12, 1, 6, 53],
          finCalculado: [2025, 12, 1, 6, 53],
        }),
      ],
    });

    expect(confirmedPushOut).toBe('2025-12-01T06:53:00');
  });
});
