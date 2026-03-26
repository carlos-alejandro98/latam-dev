import type { Flight } from '@/domain/entities/flight';

/**
 * Normaliza un string de fecha (ISO timestamp o YYYY-MM-DD) a YYYY-MM-DD.
 */
const toDateKey = (dateStr: string): string => {
  if (!dateStr) return '';
  // Soporta ISO "2025-03-11T10:00:00Z" y "YYYY-MM-DD"
  const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : dateStr;
};

/**
 * Clave de fecha para agrupación (regla de negocio en ViewModel).
 * Prioridad: stdDate > etaDate. Siempre retorna formato YYYY-MM-DD.
 */
export const getFlightDisplayDateKey = (flight: Flight): string =>
  toDateKey(flight.stdDate || flight.etaDate || '');

/**
 * Formatea fecha ISO (YYYY-MM-DD) a DD/MM/YYYY.
 * Lógica de presentación en ViewModel; no altera dominio.
 */
export const formatDate = (date: string | undefined): string => {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length !== 3) return date;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/**
 * ViewModel de presentación para Flight.
 * NO transforma estructura del backend.
 * Solo expone helpers derivados para UI.
 */
export interface FlightViewModel {
  flight: Flight;
  aircraftLabel: string;
  statusType: 'success' | 'warning' | 'error' | 'neutral';
  formattedStdDate: string;
}

/**
 * Crea un ViewModel para evitar lógica en componentes.
 */
export const createFlightViewModel = (flight: Flight): FlightViewModel => {
  const aircraftLabel = flight.tatType ?? flight.aircraftType ?? '';

  let statusType: FlightViewModel['statusType'] = 'neutral';
  if (flight.varianzaMinutos !== null) {
    if (flight.varianzaMinutos >= 15) statusType = 'error';
    else if (flight.varianzaMinutos > 0) statusType = 'warning';
    else statusType = 'success';
  }

  return {
    flight,
    aircraftLabel,
    statusType,
    formattedStdDate: formatDate(flight.stdDate),
  };
};
