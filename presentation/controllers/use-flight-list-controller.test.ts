import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react-native';

import type { Flight } from '@/domain/entities/flight';

import { useFlightListController } from './use-flight-list-controller';

const buildFlight = (overrides: Partial<Flight>): Flight => ({
  flightId: 'FLIGHT-1',
  numberArrival: 'LA100',
  numberDeparture: 'LA200',
  origin: 'SCL',
  destination: 'LIM',
  aircraftType: 'A320',
  aircraftPrefix: 'PR-TEST',
  staTime: '08:00',
  staDate: '2026-03-19',
  etaTime: '08:10',
  etaDate: '2026-03-19',
  stdTime: '10:00',
  stdDate: '2026-03-19',
  etdTime: '',
  etdDate: '',
  ata: null,
  std: '2026-03-19T10:00:00',
  atd: null,
  pushIn: null,
  pushOut: null,
  estimatedPushIn: null,
  parkPositionArrival: null,
  parkPositionDeparture: null,
  boardingGate: null,
  paxTotalArrival: 0,
  paxCnxArrival: 0,
  paxLocalArrival: 0,
  paxTotalDeparture: 0,
  paxCnxDeparture: 0,
  paxLocalDeparture: 0,
  wchrArrival: 0,
  wchrDeparture: 0,
  bagsCnxArrival: 0,
  bagsCnxDeparture: 0,
  tatVueloMinutos: null,
  tatType: null,
  varianzaMinutos: null,
  minutosDesembarqueProyectado: null,
  variacionDesembarque: null,
  factorCarga: null,
  tiempoTotalProyectadoRampa: null,
  variacionRampa: null,
  proporcionCarga: null,
  foArrival: 0,
  foDeparture: 0,
  ganttIniciado: false,
  ganttInicioTimestamp: null,
  ingestionTimestamp: '2026-03-19T00:00:00',
  ...overrides,
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useFlightListController', () => {
  it('defaults the selected day to the current user day when available', () => {
    jest.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-03-19T23:50:00').getTime(),
    );

    const { result } = renderHook(() =>
      useFlightListController({
        flights: [
          buildFlight({
            flightId: 'TOMORROW',
            stdDate: '2026-03-20',
            stdTime: '00:10',
          }),
          buildFlight({
            flightId: 'TODAY',
            stdDate: '2026-03-19',
            stdTime: '23:55',
          }),
        ],
      }),
    );

    expect(result.current.selectedDateKey).toBe('2026-03-19');
    expect(result.current.flights.map((flight) => flight.flightId)).toEqual([
      'TODAY',
    ]);
  });
});
