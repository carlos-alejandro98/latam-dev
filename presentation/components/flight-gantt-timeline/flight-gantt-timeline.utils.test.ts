import { describe, expect, it } from '@jest/globals';

import type { FlightGanttTask } from '@/domain/entities/flight-gantt';

import {
  buildTimelineDomain,
  buildTimelineRows,
  getRealBarColor,
} from './flight-gantt-timeline.utils';

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
  inicioProgramado: [2026, 3, 19, 10, 0],
  finProgramado: [2026, 3, 19, 10, 10],
  inicioCalculado: [2026, 3, 19, 10, 0],
  finCalculado: [2026, 3, 19, 10, 10],
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
  inicioReal: [2026, 3, 19, 10, 0],
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

describe('flight-gantt-timeline.utils', () => {
  it('uses STA - 2h and ETD + 2h as the visible timeline window', () => {
    const domain = buildTimelineDomain('05:10', '06:45', '06:50', null);

    expect(domain).toEqual({
      minMinute: 190,
      maxMinute: 530,
    });
  });

  it('prioritizes push back over ETD and STD for the visible timeline end', () => {
    const domain = buildTimelineDomain('05:10', '06:45', '06:50', '07:05');

    expect(domain.maxMinute).toBe(545);
  });

  it('keeps the in-progress real bar blue while it is within the planned range', () => {
    const [row] = buildTimelineRows(
      [buildTask()],
      '2026-03-19',
      '10:20',
      new Date('2026-03-19T10:05:00').getTime(),
    );

    expect(row.realRange?.endMinute).toBe(605);
    expect(getRealBarColor(row)).toBe('#2C31C9');
  });

  it('turns the in-progress real bar red once it exceeds the planned end', () => {
    const [row] = buildTimelineRows(
      [buildTask()],
      '2026-03-19',
      '10:20',
      new Date('2026-03-19T10:12:00').getTime(),
    );

    expect(row.realRange?.endMinute).toBe(612);
    expect(getRealBarColor(row)).toBe('#C8001E');
  });
});
