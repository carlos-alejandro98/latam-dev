import { useEffect, useMemo, useState } from 'react';

import type { Flight } from '@/domain/entities/flight';
import {
  matchesSearch,
  normalizeSearch,
  sortFlights,
} from '@/presentation/components/flight-list/utils';
import type { OrderKey } from '@/presentation/components/flight-list/flight-list.types';
import { getFlightDisplayDateKey } from '@/presentation/view-models/flight-view-model';

export type { OrderKey };

export interface FlightListController {
  collapsed: boolean;
  searchQuery: string;
  orderBy: OrderKey | null;
  selectedDateKey: string | null;
  availableDateKeys: string[];
  flights: Flight[];
  toggleCollapsed: () => void;
  collapse: () => void;
  expand: () => void;
  setSearchQuery: (value: string) => void;
  setOrderBy: (value: OrderKey | null) => void;
  setSelectedDateKey: (value: string) => void;
  goToPreviousDate: () => void;
  goToNextDate: () => void;
}

interface Params {
  flights: Flight[];
}

const getCurrentLocalDateKey = (timestamp: number = Date.now()): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Controlador del FlightList.
 * Orquesta estado UI y datos derivados en un solo useMemo.
 */
export const useFlightListController = ({
  flights,
}: Params): FlightListController => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderBy, setOrderBy] = useState<OrderKey | null>(null);
  const [selectedDateKey, setSelectedDateKeyState] = useState<string | null>(
    null,
  );

  const searchOrderedFlights = useMemo(() => {
    const normalized = normalizeSearch(searchQuery);

    const filtered = normalized
      ? flights.filter((f) => matchesSearch(f, normalized, orderBy))
      : flights;

    return orderBy ? sortFlights(filtered, orderBy) : filtered;
  }, [flights, searchQuery, orderBy]);

  // Normaliza cualquier formato de fecha a YYYY-MM-DD
  const normalizeDateKey = (key: string): string => {
    if (!key) return '';
    // Ya está en YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
    // DD/MM/YYYY → YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(key)) {
      const [d, m, y] = key.split('/');
      return `${y}-${m}-${d}`;
    }
    // ISO timestamp → tomar solo los primeros 10 caracteres
    const match = key.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    return key;
  };

  const availableDateKeys = useMemo(() => {
    const keys = new Set<string>();

    for (const flight of searchOrderedFlights) {
      const rawKey = getFlightDisplayDateKey(flight);
      const dateKey = normalizeDateKey(rawKey);
      if (dateKey) {
        keys.add(dateKey);
      }
    }

    return Array.from(keys).sort();
  }, [searchOrderedFlights]);

  const defaultSelectedDateKey = useMemo(() => {
    const currentDateKey = getCurrentLocalDateKey();
    if (availableDateKeys.includes(currentDateKey)) {
      return currentDateKey;
    }

    return availableDateKeys[0] ?? null;
  }, [availableDateKeys]);

  useEffect(() => {
    if (!availableDateKeys.length) {
      if (selectedDateKey !== null) {
        setSelectedDateKeyState(null);
      }
      return;
    }

    // Solo inicializa automáticamente cuando no hay fecha seleccionada.
    // No sobreescribe una selección manual aunque no esté en availableDateKeys.
    if (selectedDateKey === null) {
      setSelectedDateKeyState(defaultSelectedDateKey);
    }
  }, [availableDateKeys, defaultSelectedDateKey, selectedDateKey]);

  const resolvedSelectedDateKey =
    selectedDateKey ?? defaultSelectedDateKey ?? availableDateKeys[0] ?? null;

  const currentDateIndex = useMemo(() => {
    if (!resolvedSelectedDateKey) return -1;
    return availableDateKeys.indexOf(resolvedSelectedDateKey);
  }, [resolvedSelectedDateKey, availableDateKeys]);

  const derivedFlights = useMemo(() => {
    if (!resolvedSelectedDateKey) return searchOrderedFlights;
    return searchOrderedFlights.filter(
      (flight) => normalizeDateKey(getFlightDisplayDateKey(flight)) === resolvedSelectedDateKey,
    );
  }, [resolvedSelectedDateKey, searchOrderedFlights]);

  // Solo acepta fechas que estén en availableDateKeys.
  const setSelectedDateKey = (value: string): void => {
    const isIncluded = availableDateKeys.includes(value);
    if (isIncluded) {
      setSelectedDateKeyState(value);
    }
  };

  const goToPreviousDate = (): void => {
    if (currentDateIndex > 0) {
      setSelectedDateKeyState(availableDateKeys[currentDateIndex - 1]);
    }
  };

  const goToNextDate = (): void => {
    if (currentDateIndex >= 0 && currentDateIndex < availableDateKeys.length - 1) {
      setSelectedDateKeyState(availableDateKeys[currentDateIndex + 1]);
    }
  };

  return {
    collapsed,
    searchQuery,
    orderBy,
    selectedDateKey: resolvedSelectedDateKey,
    availableDateKeys,
    flights: derivedFlights,
    toggleCollapsed: () => setCollapsed((prev) => !prev),
    collapse: () => setCollapsed(true),
    expand: () => setCollapsed(false),
    setSearchQuery,
    setOrderBy,
    setSelectedDateKey,
    goToPreviousDate,
    goToNextDate,
  };
};
