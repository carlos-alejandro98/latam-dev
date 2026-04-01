import type { FlightUpdatesPort } from '../ports/flight-updates-port';
import type { ProcessFlightUpdatesUseCase } from './process-flight-updates-use-case';

/**
 * Inicia la suscripción a actualizaciones en tiempo real de vuelos.
 * Cada patch recibido se procesa con ProcessFlightUpdatesUseCase.
 */
export class StartFlightRealtimeUpdatesUseCase {
  constructor(
    private readonly flightUpdatesPort: FlightUpdatesPort,
    private readonly processFlightUpdatesUseCase: ProcessFlightUpdatesUseCase,
  ) {}

  /**
   * Ejecuta la suscripción.
   * @returns Función para detener las actualizaciones.
   */
  execute(): () => void {
    return this.flightUpdatesPort.subscribe((patch) => {
      this.processFlightUpdatesUseCase.execute(patch);
    });
  }
}
