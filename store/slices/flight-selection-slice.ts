import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { FlightSelectionPersistedState } from '@/application/ports/flight-selection-persistence-port';
import { FLIGHT_SELECTION_PERSISTENCE_VERSION } from '@/application/ports/flight-selection-persistence-port';

export interface FlightSelectionState {
  selectedFlightIds: string[];
  activeFlightId: string | null;
  /** Avoid persisting before first load from storage (web). */
  hasRehydrated: boolean;
}

const initialState: FlightSelectionState = {
  selectedFlightIds: [],
  activeFlightId: null,
  hasRehydrated: false,
};

const normalizeActiveAfterTabChange = (state: FlightSelectionState): void => {
  if (
    state.activeFlightId &&
    state.selectedFlightIds.includes(state.activeFlightId)
  ) {
    return;
  }

  state.activeFlightId = state.selectedFlightIds[0] ?? null;
};

export const flightSelectionSlice = createSlice({
  name: 'flightSelection',
  initialState,
  reducers: {
    rehydrateFlightSelection: (
      state,
      action: PayloadAction<FlightSelectionPersistedState | null>,
    ) => {
      state.hasRehydrated = true;

      if (!action.payload) {
        state.selectedFlightIds = [];
        state.activeFlightId = null;
        return;
      }

      state.selectedFlightIds = [...action.payload.selectedFlightIds];
      state.activeFlightId = action.payload.activeFlightId;

      const activeStillValid =
        state.activeFlightId !== null &&
        state.selectedFlightIds.includes(state.activeFlightId);

      if (!activeStillValid) {
        normalizeActiveAfterTabChange(state);
      }
    },

    addOrFocusFlightTab: (state, action: PayloadAction<string>) => {
      const flightId = action.payload;

      if (!state.selectedFlightIds.includes(flightId)) {
        state.selectedFlightIds.push(flightId);
      }

      state.activeFlightId = flightId;
    },

    closeFlightTab: (state, action: PayloadAction<string>) => {
      const flightId = action.payload;
      state.selectedFlightIds = state.selectedFlightIds.filter(
        (id) => id !== flightId,
      );
      normalizeActiveAfterTabChange(state);
    },

    openSingleFlightTab: (state, action: PayloadAction<string>) => {
      state.selectedFlightIds = [action.payload];
      state.activeFlightId = action.payload;
    },

    clearFlightWorkspaceSelection: (state) => {
      state.selectedFlightIds = [];
      state.activeFlightId = null;
      state.hasRehydrated = true;
    },

    pruneFlightSelectionByIds: (
      state,
      action: PayloadAction<{ validFlightIds: string[] }>,
    ) => {
      const valid = new Set(action.payload.validFlightIds);
      state.selectedFlightIds = state.selectedFlightIds.filter((id) =>
        valid.has(id),
      );
      normalizeActiveAfterTabChange(state);
    },
  },
});

export const {
  addOrFocusFlightTab,
  clearFlightWorkspaceSelection,
  closeFlightTab,
  openSingleFlightTab,
  pruneFlightSelectionByIds,
  rehydrateFlightSelection,
} = flightSelectionSlice.actions;

export const flightSelectionReducer = flightSelectionSlice.reducer;

export const toPersistedFlightSelection = (
  state: FlightSelectionState,
): FlightSelectionPersistedState => ({
  version: FLIGHT_SELECTION_PERSISTENCE_VERSION,
  selectedFlightIds: state.selectedFlightIds,
  activeFlightId: state.activeFlightId,
});
