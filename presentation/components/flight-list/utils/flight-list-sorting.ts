import type { Flight } from '@/domain/entities/flight';
import type { OrderKey } from '../flight-list.types';

const toMinutes = (value?: string | null): number => {
  if (!value) return Number.POSITIVE_INFINITY;
  const parts = value.split(':');
  if (parts.length < 2) return Number.POSITIVE_INFINITY;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.POSITIVE_INFINITY;
  }
  return hours * 60 + minutes;
};

/**
 * Compara dos vuelos según el criterio de orden (eta, etd, fleet).
 */
export const compareFlights = (
  a: Flight,
  b: Flight,
  orderBy: OrderKey,
): number => {
  if (orderBy === 'eta') {
    return toMinutes(a.etaTime) - toMinutes(b.etaTime);
  }
  if (orderBy === 'etd') {
    return toMinutes(a.etdTime) - toMinutes(b.etdTime);
  }
  const fleetA = a.aircraftType ?? '';
  const fleetB = b.aircraftType ?? '';
  if (!fleetA && !fleetB) return 0;
  if (!fleetA) return 1;
  if (!fleetB) return -1;
  return fleetA.localeCompare(fleetB, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

/**
 * Ordena una copia de la lista según orderBy; si es null devuelve la lista sin cambios.
 */
export const sortFlights = (
  flights: Flight[],
  orderBy: OrderKey | null,
): Flight[] => {
  if (!orderBy) return flights;
  return flights
    .map((flight, index) => ({ flight, index }))
    .sort((a, b) => {
      const base = compareFlights(a.flight, b.flight, orderBy);
      return base !== 0 ? base : a.index - b.index;
    })
    .map(({ flight }) => flight);
};
