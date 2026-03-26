import React, { useMemo, useState, useCallback, useEffect } from 'react';

import {
  calHeaderStyle,
  dayCellStyle,
  dayHeaderStyle,
  gridStyle,
  monthLabelStyle,
  navBtnStyle,
  popoverStyle,
} from './flight-list-calendar.styles';

// ─── constants ─────────────────────────────────────────────────────────────────
const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

// ─── helpers ───────────────────────────────────────────────────────────────────
function toKey(date: Date): string {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return '0000-00-00';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildGrid(year: number, month: number): (number | null)[] {
  const firstDayRaw = new Date(year, month, 1).getDay();
  const firstDay = Number.isFinite(firstDayRaw) && firstDayRaw >= 0 && firstDayRaw <= 6 ? firstDayRaw : 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(Math.max(0, firstDay)).fill(null);
  for (let i = 1; i <= Math.max(0, daysInMonth); i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─── types ─────────────────────────────────────────────────────────────────────
interface Props {
  selectedDateKey: string | null;
  availableDateKeys: string[];
  initialYear: number;
  initialMonth: number;
  minDate: Date | null;
  maxDate: Date | null;
  onSelect: (key: string) => void;
}

// ─── component ─────────────────────────────────────────────────────────────────
export const FlightListCalendarPopover: React.FC<Props> = ({
  selectedDateKey,
  availableDateKeys,
  initialYear,
  initialMonth,
  minDate,
  maxDate,
  onSelect,
}) => {
  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Sincroniza la vista del mes cuando selectedDateKey cambia externamente
  useEffect(() => {
    if (!selectedDateKey) return;
    const parts = selectedDateKey.split('-');
    if (parts.length !== 3) return;
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    if (Number.isFinite(y) && Number.isFinite(m)) {
      setViewYear(y);
      setViewMonth(m);
    }
  }, [selectedDateKey]);

  const grid = useMemo(() => buildGrid(viewYear, viewMonth), [viewYear, viewMonth]);

  // Si no hay fechas disponibles o no hay minDate/maxDate, se puede navegar libremente
  const canGoPrev = useMemo(() => {
    if (!minDate || !availableDateKeys.length) return true;
    return viewYear > minDate.getFullYear() ||
      (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());
  }, [viewYear, viewMonth, minDate, availableDateKeys.length]);

  const canGoNext = useMemo(() => {
    if (!maxDate || !availableDateKeys.length) return true;
    return viewYear < maxDate.getFullYear() ||
      (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());
  }, [viewYear, viewMonth, maxDate, availableDateKeys.length]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const todayKey = toKey(new Date());

  return (
    <div style={popoverStyle}>
      <div style={calHeaderStyle}>
        <button type="button" onClick={prevMonth} disabled={!canGoPrev}
          style={{ ...navBtnStyle, opacity: canGoPrev ? 1 : 0.3 }} aria-label="Mes anterior">
          ‹
        </button>
        <span style={monthLabelStyle}>{MONTHS[viewMonth]} {viewYear}</span>
        <button type="button" onClick={nextMonth} disabled={!canGoNext}
          style={{ ...navBtnStyle, opacity: canGoNext ? 1 : 0.3 }} aria-label="Próximo mes">
          ›
        </button>
      </div>

      <div style={gridStyle}>
        {DAYS.map((d, i) => <div key={i} style={dayHeaderStyle}>{d}</div>)}
        {grid.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = toKey(new Date(viewYear, viewMonth, day));
          // Si availableDateKeys no existe, está vacío, o undefined: permite seleccionar cualquier día
          const isRestricted = Array.isArray(availableDateKeys) && availableDateKeys.length > 0;
          const isAvailable = !isRestricted || availableDateKeys.includes(key);
          const isSelected = key === selectedDateKey;
          const isToday = key === todayKey && !isSelected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (isAvailable) onSelect(key);
              }}
              style={{
                ...dayCellStyle,
                background: isSelected ? '#2c31c9' : isToday ? '#eef0fd' : 'transparent',
                color: isSelected ? '#fff' : isAvailable ? '#303030' : '#c8c8c8',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                fontWeight: isSelected ? '700' : isToday ? '600' : '400',
                borderRadius: 6,
                border: isToday ? '1px solid #c7caee' : '1px solid transparent',
                textDecoration: !isAvailable ? 'line-through' : 'none',
                opacity: !isAvailable ? 0.4 : 1,
              }}
              disabled={!isAvailable}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};