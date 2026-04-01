import type { Flight } from '@/domain/entities/flight';
import { getFlightDisplayDateKey } from '@/presentation/view-models/flight-view-model';

/**
 * Agrupa vuelos por fecha usando la clave del ViewModel (regla de negocio centralizada).
 * Función pura para memoización por sección.
 */
export function groupFlightsByDate(flights: Flight[]): Map<string, Flight[]> {
  const map = new Map<string, Flight[]>();

  for (const flight of flights) {
    const key = getFlightDisplayDateKey(flight);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(flight);
  }

  return map;
}
