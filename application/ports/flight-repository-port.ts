import type { Flight } from '@/domain/entities/flight';
import type { FlightGantt } from '@/domain/entities/flight-gantt';

export interface DateRangeParams {
  stdDateFrom: string; // Formato ddMMyyyy
  stdDateTo: string; // Formato ddMMyyyy
}

export interface FlightRepositoryPort {
  getActiveFlights(
    dateRange?: DateRangeParams,
    signal?: AbortSignal,
  ): Promise<Flight[]>;
  getFlightGantt(flightId: string, signal?: AbortSignal): Promise<FlightGantt>;
  refreshTurnaroundMetrics(turnaroundId: string): Promise<void>;
}
