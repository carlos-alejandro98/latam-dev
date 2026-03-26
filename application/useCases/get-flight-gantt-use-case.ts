import type { FlightGantt } from "@/domain/entities/flight-gantt";

import type { FlightRepositoryPort } from "../ports/flight-repository-port";

export class GetFlightGanttUseCase {
  constructor(private readonly flightRepo: FlightRepositoryPort) {}

  async execute(flightId: string): Promise<FlightGantt> {
    return this.flightRepo.getFlightGantt(flightId);
  }
}
