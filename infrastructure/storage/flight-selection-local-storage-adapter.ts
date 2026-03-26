import type {
  FlightSelectionPersistencePort,
  FlightSelectionPersistedState,
} from '@/application/ports/flight-selection-persistence-port';
import {
  FLIGHT_SELECTION_PERSISTENCE_VERSION,
} from '@/application/ports/flight-selection-persistence-port';
import { IS_WEB } from '@/config/platform';

const STORAGE_KEY_PREFIX = 'aptotatgantt.flight-selection.v1';

const buildKey = (userKey: string): string =>
  `${STORAGE_KEY_PREFIX}:${encodeURIComponent(userKey)}`;

const isPersistedState = (
  value: unknown,
): value is FlightSelectionPersistedState => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    record.version === FLIGHT_SELECTION_PERSISTENCE_VERSION &&
    Array.isArray(record.selectedFlightIds) &&
    record.selectedFlightIds.every((id) => typeof id === 'string') &&
    (record.activeFlightId === null || typeof record.activeFlightId === 'string')
  );
};

export const createFlightSelectionLocalStorageAdapter =
  (): FlightSelectionPersistencePort => {
    const load = (userKey: string): FlightSelectionPersistedState | null => {
      if (!IS_WEB || typeof window === 'undefined' || !window.localStorage) {
        return null;
      }

      try {
        const raw = window.localStorage.getItem(buildKey(userKey));
        if (!raw) {
          return null;
        }

        const parsed: unknown = JSON.parse(raw);

        if (!isPersistedState(parsed)) {
          return null;
        }

        return parsed;
      } catch {
        return null;
      }
    };

    const save = (userKey: string, state: FlightSelectionPersistedState): void => {
      if (!IS_WEB || typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      try {
        window.localStorage.setItem(buildKey(userKey), JSON.stringify(state));
      } catch {
        // Quota, private mode, etc.
      }
    };

    const clear = (userKey: string): void => {
      if (!IS_WEB || typeof window === 'undefined' || !window.localStorage) {
        return;
      }

      try {
        window.localStorage.removeItem(buildKey(userKey));
      } catch {
        // noop
      }
    };

    return { load, save, clear };
  };
