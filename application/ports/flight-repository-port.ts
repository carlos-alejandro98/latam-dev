import type { Flight } from "@/domain/entities/flight";
import type { FlightGantt } from "@/domain/entities/flight-gantt";

export interface FlightRepositoryPort {
  getActiveFlights(): Promise<Flight[]>;
  getFlightGantt(flightId: string): Promise<FlightGantt>;
  refreshTurnaroundMetrics(turnaroundId: string): Promise<void>;
}
