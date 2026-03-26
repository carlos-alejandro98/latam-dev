import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { extractAuthSubjectForStorageKey } from '@/domain/services/jwt-validator';
import { createFlightSelectionLocalStorageAdapter } from '@/infrastructure/storage/flight-selection-local-storage-adapter';
import { IS_WEB } from '@/config/platform';
import type { AppDispatch, RootState } from '@/store';
import {
  addOrFocusFlightTab,
  clearFlightWorkspaceSelection,
  closeFlightTab,
  openSingleFlightTab,
  pruneFlightSelectionByIds,
  rehydrateFlightSelection,
} from '@/store/slices/flight-selection-slice';

const persistence = createFlightSelectionLocalStorageAdapter();

export const useFlightSelectionStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedFlightIds = useSelector(
    (state: RootState) => state.flightSelection.selectedFlightIds,
  );
  const activeFlightId = useSelector(
    (state: RootState) => state.flightSelection.activeFlightId,
  );
  const hasRehydrated = useSelector(
    (state: RootState) => state.flightSelection.hasRehydrated,
  );
  const idToken = useSelector(
    (state: RootState) => state.auth.session?.idToken,
  );

  const rehydrateFromStorage = useCallback(() => {
    if (hasRehydrated) {
      return;
    }

    if (!IS_WEB) {
      dispatch(rehydrateFlightSelection(null));
      return;
    }

    const userKey = extractAuthSubjectForStorageKey(idToken);

    if (!userKey) {
      return;
    }

    const persisted = persistence.load(userKey);
    dispatch(rehydrateFlightSelection(persisted));
  }, [dispatch, hasRehydrated, idToken]);

  const selectFlight = useCallback(
    (flightId: string) => {
      dispatch(addOrFocusFlightTab(flightId));
    },
    [dispatch],
  );

  const closeFlight = useCallback(
    (flightId: string) => {
      dispatch(closeFlightTab(flightId));
    },
    [dispatch],
  );

  const openFlightSingle = useCallback(
    (flightId: string) => {
      dispatch(openSingleFlightTab(flightId));
    },
    [dispatch],
  );

  const clearSelectedFlight = useCallback(() => {
    dispatch(clearFlightWorkspaceSelection());
  }, [dispatch]);

  const pruneInvalidIds = useCallback(
    (validFlightIds: string[]) => {
      dispatch(pruneFlightSelectionByIds({ validFlightIds }));
    },
    [dispatch],
  );

  return {
    activeFlightId,
    clearSelectedFlight,
    closeFlight,
    openFlightSingle,
    pruneInvalidIds,
    rehydrateFromStorage,
    selectFlight,
    selectedFlightIds,
  };
};
