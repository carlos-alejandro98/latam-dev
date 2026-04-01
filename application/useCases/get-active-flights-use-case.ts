import type { Flight } from '@/domain/entities/flight';

import type {
  DateRangeParams,
  FlightRepositoryPort,
} from '../ports/flight-repository-port';

export class GetActiveFlightsUseCase {
  constructor(private readonly flightRepo: FlightRepositoryPort) {}

  async execute(
    dateRange?: DateRangeParams,
    signal?: AbortSignal,
  ): Promise<Flight[]> {
    return this.flightRepo.getActiveFlights(dateRange, signal);
  }
}
