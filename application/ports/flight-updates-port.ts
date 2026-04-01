import type { Flight } from '@/domain/entities/flight';

/**
 * Puerto para suscripción a actualizaciones de vuelos en tiempo real
 * (WebSocket, SSE o polling).
 */
export interface FlightUpdatesPort {
  /**
   * Suscribe al canal de actualizaciones.
   * @param callback Se invoca con el patch de vuelos actualizados.
   * @returns Función para cancelar la suscripción.
   */
  subscribe(callback: (flights: Flight[]) => void): () => void;
}
