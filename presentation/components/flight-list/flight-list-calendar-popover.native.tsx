import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Dimensions } from 'react-native';

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
  visible: boolean;
  selectedDateKey: string | null;
  availableDateKeys: string[];
  initialYear: number;
  initialMonth: number;
  minDate: Date | null;
  maxDate: Date | null;
  onSelect: (key: string) => void;
  onClose: () => void;
}

// ─── component ─────────────────────────────────────────────────────────────────
export const FlightListCalendarPopoverNative: React.FC<Props> = ({
  visible,
  selectedDateKey,
  availableDateKeys,
  initialYear,
  initialMonth,
  minDate,
  maxDate,
  onSelect,
  onClose,
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

  const canGoPrev = useMemo(() => {
    if (!minDate) return true;
    return viewYear > minDate.getFullYear() ||
      (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth());
  }, [viewYear, viewMonth, minDate]);

  const canGoNext = useMemo(() => {
    if (!maxDate) return true;
    return viewYear < maxDate.getFullYear() ||
      (viewYear === maxDate.getFullYear() && viewMonth < maxDate.getMonth());
  }, [viewYear, viewMonth, maxDate]);

  const prevMonth = useCallback(() => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const todayKey = toKey(new Date());
  const screenWidth = Dimensions.get('window').width;
  const cellSize = Math.floor((screenWidth - 64) / 7);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={nativeStyles.overlay} onPress={onClose}>
        <Pressable style={nativeStyles.popover} onPress={e => e.stopPropagation()}>
          <View style={nativeStyles.header}>
            <Pressable onPress={prevMonth} disabled={!canGoPrev} style={nativeStyles.navBtn}>
              <Text style={[nativeStyles.navBtnText, !canGoPrev && nativeStyles.disabled]}>{'‹'}</Text>
            </Pressable>
            <Text style={nativeStyles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <Pressable onPress={nextMonth} disabled={!canGoNext} style={nativeStyles.navBtn}>
              <Text style={[nativeStyles.navBtnText, !canGoNext && nativeStyles.disabled]}>{'›'}</Text>
            </Pressable>
          </View>

          <View style={nativeStyles.grid}>
            {DAYS.map((d, i) => (
              <View key={i} style={[nativeStyles.dayHeader, { width: cellSize }]}>
                <Text style={nativeStyles.dayHeaderText}>{d}</Text>
              </View>
            ))}
            {grid.map((day, i) => {
              if (!day) return <View key={i} style={{ width: cellSize, height: cellSize }} />;
              const key = toKey(new Date(viewYear, viewMonth, day));
              const isRestricted = Array.isArray(availableDateKeys) && availableDateKeys.length > 0;
              const isAvailable = !isRestricted || availableDateKeys.includes(key);
              const isSelected = key === selectedDateKey;
              const isToday = key === todayKey && !isSelected;
              return (
                <Pressable
                  key={i}
                  onPress={() => { if (isAvailable) { onSelect(key); onClose(); } }}
                  disabled={!isAvailable}
                  style={[
                    nativeStyles.dayCell,
                    { width: cellSize, height: cellSize },
                    isSelected && nativeStyles.dayCellSelected,
                    isToday && nativeStyles.dayCellToday,
                    !isAvailable && nativeStyles.dayCellDisabled,
                  ]}
                >
                  <Text style={[
                    nativeStyles.dayCellText,
                    isSelected && nativeStyles.dayCellTextSelected,
                    isToday && nativeStyles.dayCellTextBold,
                    !isAvailable && nativeStyles.dayCellTextDisabled,
                  ]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const nativeStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popover: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navBtn: { padding: 8 },
  navBtnText: { fontSize: 24, color: '#2c31c9', fontWeight: '600' },
  disabled: { opacity: 0.3 },
  monthLabel: { fontSize: 16, fontWeight: '600', color: '#303030' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  dayHeader: { alignItems: 'center', paddingVertical: 4 },
  dayHeaderText: { fontSize: 12, fontWeight: '600', color: '#888' },
  dayCell: { alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  dayCellSelected: { backgroundColor: '#2c31c9' },
  dayCellToday: { backgroundColor: '#eef0fd' },
  dayCellDisabled: { opacity: 0.35 },
  dayCellText: { fontSize: 14, color: '#303030' },
  dayCellTextSelected: { color: '#fff' },
  dayCellTextDisabled: { color: '#c0c0c0', textDecorationLine: 'line-through' },
  dayCellTextBold: { fontWeight: '600' },
});