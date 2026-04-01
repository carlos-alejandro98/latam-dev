import type { Middleware } from '@reduxjs/toolkit';

import type { FlightSelectionPersistencePort } from '@/application/ports/flight-selection-persistence-port';
import { extractAuthSubjectForStorageKey } from '@/domain/services/jwt-validator';
import { appResetState } from '@/store/actions/app-reset-actions';
import type { RootState } from '@/store/root-reducer';
import {
  addOrFocusFlightTab,
  clearFlightWorkspaceSelection,
  closeFlightTab,
  openSingleFlightTab,
  pruneFlightSelectionByIds,
  rehydrateFlightSelection,
  toPersistedFlightSelection,
} from '@/store/slices/flight-selection-slice';

const getPersistenceUserKey = (state: RootState): string | null =>
  extractAuthSubjectForStorageKey(state.auth.session?.idToken);

export const createFlightSelectionPersistenceMiddleware = (
  persistence: FlightSelectionPersistencePort,
): Middleware<object, RootState> => {
  return (storeApi) => (next) => (action) => {
    if (appResetState.match(action)) {
      const userKeyBeforeReset = getPersistenceUserKey(storeApi.getState());
      const result = next(action);

      if (userKeyBeforeReset) {
        persistence.clear(userKeyBeforeReset);
      }

      return result;
    }

    const result = next(action);

    if (
      !(
        addOrFocusFlightTab.match(action) ||
        closeFlightTab.match(action) ||
        openSingleFlightTab.match(action) ||
        clearFlightWorkspaceSelection.match(action) ||
        pruneFlightSelectionByIds.match(action) ||
        rehydrateFlightSelection.match(action)
      )
    ) {
      return result;
    }

    const state = storeApi.getState();

    if (
      !state.flightSelection.hasRehydrated &&
      !rehydrateFlightSelection.match(action)
    ) {
      return result;
    }

    if (clearFlightWorkspaceSelection.match(action)) {
      const userKey = getPersistenceUserKey(state);

      if (userKey) {
        persistence.clear(userKey);
      }

      return result;
    }

    const userKey = getPersistenceUserKey(state);

    if (!userKey) {
      return result;
    }

    persistence.save(userKey, toPersistedFlightSelection(state.flightSelection));

    return result;
  };
};
