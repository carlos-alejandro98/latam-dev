import type { Flight } from '@/domain/entities/flight';

/**
 * Compara campos relevantes para actualizaciones en tiempo real.
 * Si son iguales, no se actualiza la referencia (FlatList no re-renderiza el ítem).
 */
export function flightShallowCompare(a: Flight, b: Flight): boolean {
  return (
    a.etaTime === b.etaTime &&
    a.stdTime === b.stdTime &&
    a.etdTime === b.etdTime &&
    a.aircraftPrefix === b.aircraftPrefix &&
    a.varianzaMinutos === b.varianzaMinutos &&
    a.boardingGate === b.boardingGate &&
    a.parkPositionArrival === b.parkPositionArrival &&
    a.parkPositionDeparture === b.parkPositionDeparture &&
    a.pushIn === b.pushIn &&
    a.pushOut === b.pushOut &&
    a.estimatedPushIn === b.estimatedPushIn &&
    a.std === b.std &&
    a.ata === b.ata &&
    a.atd === b.atd &&
    a.ganttIniciado === b.ganttIniciado &&
    a.ganttInicioTimestamp === b.ganttInicioTimestamp
  );
}
