import type { Flight } from "@/domain/entities/flight";
import type { FlightGantt } from "@/domain/entities/flight-gantt";

export interface DateRangeParams {
  stdDateFrom: string; // Formato ddMMyyyy
  stdDateTo: string;   // Formato ddMMyyyy
}

export interface FlightRepositoryPort {
  getActiveFlights(dateRange?: DateRangeParams): Promise<Flight[]>;
  getFlightGantt(flightId: string): Promise<FlightGantt>;
  refreshTurnaroundMetrics(turnaroundId: string): Promise<void>;
}
