import type { FlightRepositoryPort } from "../ports/flight-repository-port";

export class RefreshTurnaroundMetricsUseCase {
  constructor(private readonly flightRepo: FlightRepositoryPort) {}

  async execute(turnaroundId: string): Promise<void> {
    await this.flightRepo.refreshTurnaroundMetrics(turnaroundId);
  }
}
