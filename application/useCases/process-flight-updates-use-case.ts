import type { Flight } from '@/domain/entities/flight';
import type { FlightStorePort } from '../ports/flight-store-port';

/**
 * Procesa un patch de vuelos actualizados y los aplica al store de forma diferencial.
 * No reemplaza el dataset completo; mantiene referencias estables.
 */
export class ProcessFlightUpdatesUseCase {
  constructor(private readonly flightStore: FlightStorePort) {}

  execute(updatedFlights: Flight[]): void {
    this.flightStore.updateFlightsPatch(updatedFlights);
  }
}
