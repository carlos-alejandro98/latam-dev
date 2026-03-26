import React, { useMemo, useRef, useState, useEffect } from 'react';

import { AppPressable } from '@/presentation/components/common/app-pressable';
import { Box, Text } from '@/presentation/components/design-system';
import { formatDate } from '@/presentation/view-models/flight-view-model';

import type { FlightListDateSelectorProps } from './flight-list-date-selector.types';
import { FlightListCalendarPopover } from './flight-list-calendar-popover.web';
import {
  CalendarOutlined,
  ChevronLeftOutlined,
  ChevronRightOutlined,
} from './icons';
import { styles } from './flight-list.styles';

function parseKey(key: string | null): Date | null {
  if (!key || typeof key !== 'string') return null;
  const parts = key.split('-');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}



export const FlightListDateSelector: React.FC<FlightListDateSelectorProps> = ({
  colors,
  selectedDateKey,
  availableDateKeys,
  onDateChange,
  onPreviousDate,
  onNextDate,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedDate = useMemo(() => parseKey(selectedDateKey), [selectedDateKey]);

  // availableDateKeys ya vienen normalizados a YYYY-MM-DD desde el controller
  const sortedKeys = useMemo(() => [...(availableDateKeys ?? [])].sort(), [availableDateKeys]);
  const minDate = useMemo(() => parseKey(sortedKeys[0] ?? null), [sortedKeys]);
  const maxDate = useMemo(() => parseKey(sortedKeys[sortedKeys.length - 1] ?? null), [sortedKeys]);

  const selectedIndex = useMemo(() => {
    if (!selectedDateKey || !Array.isArray(availableDateKeys)) return -1;
    return availableDateKeys.indexOf(selectedDateKey);
  }, [selectedDateKey, availableDateKeys]);

  const prevDisabled = selectedIndex <= 0;
  const nextDisabled = selectedIndex < 0 || selectedIndex >= (availableDateKeys?.length ?? 0) - 1;

  const formattedDate = useMemo(
    () => formatDate(selectedDateKey ?? '') || '--/--/----',
    [selectedDateKey],
  );
  const normalizeDateKeyForInput = (value: string | null | undefined) => {
    if (!value) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parts = value.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day && month && year) {
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    return '';
  };
  const inputSelectedDate = normalizeDateKeyForInput(selectedDateKey);
  const inputMinDate = normalizeDateKeyForInput(availableDateKeys[0]);
  const inputMaxDate = normalizeDateKeyForInput(
    availableDateKeys[availableDateKeys.length - 1],
  );
  const datePickerButtonStyle: React.CSSProperties = {
    display: 'inline-flex',
    flex: '1 1 auto',
    flexDirection: 'row',
    position: 'relative',
    minWidth: 170,
    maxHeight: 48,
    padding: '12px',
    border: `1px solid ${colors.borderPrimary}`,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    color: colors.textPrimary,
    boxSizing: 'border-box',
    appearance: 'none',
    WebkitAppearance: 'none',
    cursor: 'pointer',
  };

  const initialYear = useMemo(
    () => selectedDate?.getFullYear() ?? new Date().getFullYear(),
    [selectedDate],
  );
  const initialMonth = useMemo(
    () => selectedDate?.getMonth() ?? new Date().getMonth(),
    [selectedDate],
  );

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (key: string) => {
    onDateChange(key);
    setOpen(false);
  };

  return (
    <Box
      style={{
        ...styles.dateSelectorBlock,
        backgroundColor: colors.surfacePrimary,
        borderBottomColor: colors.borderPrimary,
      }}
    >
      <AppPressable
        onPress={onPreviousDate}
        disabled={prevDisabled}
        style={{
          ...styles.dateNavButton,
          backgroundColor: colors.interactionSoftDefault,
          opacity: prevDisabled ? 0.4 : 1,
        }}
        accessibilityLabel="Fecha anterior"
      >
        <ChevronLeftOutlined size={28} color="#ffffff" />
      </AppPressable>

      <div ref={containerRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          style={{
            ...styles.datePickerButton,
            borderColor: open ? colors.interactionSoftDefault : colors.borderPrimary,
            color: colors.textPrimary,
            outline: 'none',
          } as React.CSSProperties}
          aria-label="Seleccionar fecha de vuelos"
          aria-expanded={open}
        >
          <Box style={styles.datePickerIconWrapper}>
            <CalendarOutlined size={24} color={colors.textPrimary} />
          </Box>
          <Text variant="label-lg">{formattedDate}</Text>
        </button>

        {open && (
          <FlightListCalendarPopover
            key={`${selectedDateKey ?? 'none'}-${initialYear}-${initialMonth}`}
            selectedDateKey={selectedDateKey}
            availableDateKeys={availableDateKeys}
            initialYear={initialYear}
            initialMonth={initialMonth}
            minDate={minDate}
            maxDate={maxDate}
            onSelect={handleSelect}
          />
        )}
      </div>

      <AppPressable
        onPress={onNextDate}
        disabled={nextDisabled}
        style={{
          ...styles.dateNavButton,
          backgroundColor: colors.interactionSoftDefault,
          opacity: nextDisabled ? 0.4 : 1,
        }}
        accessibilityLabel="Fecha siguiente"
      >
        <ChevronRightOutlined size={28} color="#ffffff" />
      </AppPressable>
    </Box>
  );
};