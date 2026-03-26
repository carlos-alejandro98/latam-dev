import type { Flight } from "@/domain/entities/flight";

import type { FlightRepositoryPort } from "../ports/flight-repository-port";

export class GetActiveFlightsUseCase {
  constructor(private readonly flightRepo: FlightRepositoryPort) {}

  async execute(): Promise<Flight[]> {
    return this.flightRepo.getActiveFlights();
  }
}
