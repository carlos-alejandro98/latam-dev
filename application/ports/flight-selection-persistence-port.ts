export const FLIGHT_SELECTION_PERSISTENCE_VERSION = 1 as const;

export interface FlightSelectionPersistedState {
  version: typeof FLIGHT_SELECTION_PERSISTENCE_VERSION;
  selectedFlightIds: string[];
  activeFlightId: string | null;
}

export interface FlightSelectionPersistencePort {
  load: (userKey: string) => FlightSelectionPersistedState | null;
  save: (userKey: string, state: FlightSelectionPersistedState) => void;
  clear: (userKey: string) => void;
}
