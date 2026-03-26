import type { Flight } from '@/domain/entities/flight';
import type { FlightUpdatesPort } from '@/application/ports/flight-updates-port';

/**
 * Adaptador WebSocket para actualizaciones en tiempo real de vuelos.
 * Si la URL está vacía, subscribe() devuelve un no-op (no conecta).
 */
export class FlightSocketAdapter implements FlightUpdatesPort {
  constructor(private readonly url: string) {}

  subscribe(callback: (flights: Flight[]) => void): () => void {
    if (!this.url) {
      return () => {};
    }

    const socket = new WebSocket(this.url);

    socket.onmessage = (event: MessageEvent) => {
      try {
        const patch = JSON.parse(event.data as string) as Flight[];
        if (Array.isArray(patch)) {
          callback(patch);
        }
      } catch {
        // Ignorar mensajes no válidos
      }
    };

    return () => {
      socket.close();
    };
  }
}
