/**
 * Utilidades para formateo de fechas requeridas por el API de vuelos.
 * El endpoint espera formato ddMMyyyy (ej: 25032026 para 25/03/2026)
 */

/**
 * Convierte una fecha en formato YYYY-MM-DD a ddMMyyyy (formato del API)
 * @param dateKey - Fecha en formato YYYY-MM-DD (ej: "2026-03-25")
 * @returns Fecha en formato ddMMyyyy (ej: "25032026")
 */
export const dateKeyToApiFormat = (dateKey: string): string => {
  if (!dateKey) return '';
  
  // Si ya está en formato ddMMyyyy (8 dígitos sin separadores), devolverlo
  if (/^\d{8}$/.test(dateKey)) return dateKey;
  
  // Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    const [year, month, day] = dateKey.split('-');
    return `${day}${month}${year}`;
  }
  
  // Formato DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateKey)) {
    const [day, month, year] = dateKey.split('/');
    return `${day}${month}${year}`;
  }
  
  return '';
};

/**
 * Convierte una fecha en formato ddMMyyyy a YYYY-MM-DD
 * @param apiDate - Fecha en formato ddMMyyyy (ej: "25032026")
 * @returns Fecha en formato YYYY-MM-DD (ej: "2026-03-25")
 */
export const apiFormatToDateKey = (apiDate: string): string => {
  if (!apiDate || apiDate.length !== 8) return '';
  
  const day = apiDate.substring(0, 2);
  const month = apiDate.substring(2, 4);
  const year = apiDate.substring(4, 8);
  
  return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha actual en formato ddMMyyyy
 * @returns Fecha actual en formato ddMMyyyy
 */
export const getCurrentDateApiFormat = (): string => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  return `${day}${month}${year}`;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns Fecha actual en formato YYYY-MM-DD
 */
export const getCurrentDateKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Calcula un rango de fechas para el API (desde y hasta)
 * Por defecto retorna un rango de 7 días centrado en la fecha actual
 * @param daysBeforeToday - Días antes de hoy para el inicio del rango
 * @param daysAfterToday - Días después de hoy para el fin del rango
 * @returns Objeto con stdDateFrom y stdDateTo en formato ddMMyyyy
 */
export const getDefaultDateRange = (
  daysBeforeToday: number = 3,
  daysAfterToday: number = 3
): { stdDateFrom: string; stdDateTo: string } => {
  const now = new Date();
  
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - daysBeforeToday);
  
  const toDate = new Date(now);
  toDate.setDate(now.getDate() + daysAfterToday);
  
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}${month}${year}`;
  };
  
  return {
    stdDateFrom: formatDate(fromDate),
    stdDateTo: formatDate(toDate),
  };
};
