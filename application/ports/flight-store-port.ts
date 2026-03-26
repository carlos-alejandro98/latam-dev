import type { Flight } from '@/domain/entities/flight';

/**
 * Puerto para actualizar el store de vuelos por patch (actualización diferencial).
 * Mantiene referencias estables para vuelos no modificados.
 */
export interface FlightStorePort {
  updateFlightsPatch(updatedFlights: Flight[]): void;
}
