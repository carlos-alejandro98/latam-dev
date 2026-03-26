import { describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import type { Flight } from '@/domain/entities/flight';
import type { FlightGantt } from '@/domain/entities/flight-gantt';
import { useMinuteTimestamp } from '@/presentation/hooks/use-minute-timestamp';

import { useFlightGanttController } from './use-flight-gantt-controller';
import { useFlightInfoPanelController } from './use-flight-info-panel-controller';

jest.mock('./use-flight-gantt-controller', () => ({
  useFlightGanttController: jest.fn(),
}));
jest.mock('@/presentation/hooks/use-minute-timestamp', () => ({
  useMinuteTimestamp: jest.fn(),
}));

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
  boardingGate: 'G12',
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

const buildGantt = (flightId: string): FlightGantt => ({
  flight: {
    flightId,
    numberArrival: 'LA9999',
    numberDeparture: 'LA0001',
    aircraftPrefix: 'PR-GANTT',
    origin: 'GRU',
    destination: 'MIA',
    ata: null,
    pushIn: null,
    estimatedPushIn: [2025, 12, 1, 5, 13],
    parkPositionArrival: 'C3',
    parkPositionDeparture: 'D4',
    boardingGate: 'G20',
    foArrival: 160,
    foDeparture: 162,
    ganttIniciado: false,
    ganttInicioTimestamp: null,
    tatVueloMinutos: 90,
    tatType: 'A321_FOCO',
  },
  tasks: [],
  summary: {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    delayedTasks: 0,
    progresoGeneral: 0,
    varianzaTotalMinutos: null,
    tatVueloMinutos: 90,
    tatType: 'A321_FOCO',
  },
});

describe('useFlightInfoPanelController', () => {
  it('switches to a live countdown once the flight-day ETA has passed and prioritizes ETD over STD', () => {
    (useMinuteTimestamp as jest.Mock).mockReturnValue(
      new Date('2025-12-01T06:30:00').getTime(),
    );
    (useFlightGanttController as jest.Mock).mockReturnValue({
      gantt: buildGantt(baseFlight.flightId),
      loading: false,
      error: undefined,
      flightId: baseFlight.flightId,
    });

    const { result } = renderHook(() =>
      useFlightInfoPanelController(baseFlight),
    );

    expect(result.current.viewModel?.summary.availableTime).toBe('00:20');
    expect(result.current.viewModel?.summary.availableTimeDelayed).toBe(false);
  });

  it('maps the matching gantt into the view model', () => {
    (useMinuteTimestamp as jest.Mock).mockReturnValue(
      new Date('2025-12-01T06:30:00').getTime(),
    );
    (useFlightGanttController as jest.Mock).mockReturnValue({
      gantt: buildGantt(baseFlight.flightId),
      loading: false,
      error: undefined,
      flightId: baseFlight.flightId,
    });

    const { result } = renderHook(() =>
      useFlightInfoPanelController(baseFlight),
    );

    expect(result.current.viewModel?.arrival.flightNumber).toBe('LA9999');
    expect(result.current.viewModel?.summary.prefix).toBe('PR-GANTT');
    expect(result.current.viewModel?.summary.fleetLabel).toBe('A321');
  });

  it('ignores gantt data from another flight id', () => {
    (useMinuteTimestamp as jest.Mock).mockReturnValue(
      new Date('2025-12-01T06:30:00').getTime(),
    );
    (useFlightGanttController as jest.Mock).mockReturnValue({
      gantt: buildGantt('OTHER-FLIGHT'),
      loading: false,
      error: undefined,
      flightId: baseFlight.flightId,
    });

    const { result } = renderHook(() =>
      useFlightInfoPanelController(baseFlight),
    );

    expect(result.current.viewModel?.arrival.flightNumber).toBe('LA1234');
    expect(result.current.viewModel?.summary.prefix).toBe('PR-FLIGHT');
    expect(result.current.viewModel?.summary.fleetLabel).toBe('A320');
  });
});
