import type { Flight } from '@/domain/entities/flight';
import type { OrderKey } from '../flight-list.types';

const getFleetFromTatType = (tatType?: string | null): string => {
  if (!tatType) return '';
  const match = tatType.match(/A\d{3}/i);
  return match ? match[0].toUpperCase() : '';
};

export const getAircraftLabel = (flight: Flight): string =>
  getFleetFromTatType(flight.tatType) || flight.aircraftType || '';

export const normalizeSearch = (value: string): string =>
  value.trim().toLowerCase();

/**
 * Indica si un vuelo coincide con la query de búsqueda según orderBy.
 */
export const matchesSearch = (
  flight: Flight,
  query: string,
  orderBy: OrderKey | null,
  getLabel: (f: Flight) => string = getAircraftLabel,
): boolean => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  if (orderBy === 'eta') {
    return (flight.etaTime?.toLowerCase() ?? '').includes(normalized);
  }
  if (orderBy === 'etd') {
    return (flight.etdTime?.toLowerCase() ?? '').includes(normalized);
  }
  if (orderBy === 'fleet') {
    return getLabel(flight).toLowerCase().includes(normalized);
  }
  const arrival = flight.numberArrival?.toLowerCase() ?? '';
  const departure = flight.numberDeparture?.toLowerCase() ?? '';
  const flightId = flight.flightId?.toLowerCase() ?? '';
  return (
    arrival.includes(normalized) ||
    departure.includes(normalized) ||
    flightId.includes(normalized)
  );
};
