import { useEffect, useState } from 'react';

const TICK_MS = 1000;

/**
 * Reloj interno para el Gantt: actualiza cada 1s sin golpear el backend.
 * Usar para línea "ahora", animaciones suaves y cálculos locales.
 */
export function useClock(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return now;
}
