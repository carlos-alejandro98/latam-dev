import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type SessionEventType = 'started' | 'finished' | 'updated';

export interface SessionEvent {
  id:            string;
  type:          SessionEventType;
  taskInstanceId?: string;
  taskName:      string;
  time:          string;       // HH:mm from the input
  previousTime?: string | null;
  nextTime?: string | null;
  timestamp:     number;       // Date.now() at moment of action (PC clock)
  flightId:      string;
  isDelayed:     boolean;
  delayMinutes:  number;       // 0 if on time
}

interface SessionEventsState {
  events: SessionEvent[];
}

const initialState: SessionEventsState = {
  events: [],
};

const sessionEventsSlice = createSlice({
  name: 'sessionEvents',
  initialState,
  reducers: {
    addSessionEvent(state, action: PayloadAction<Omit<SessionEvent, 'id'>>) {
      state.events.push({
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      });
    },
    clearSessionEvents(state) {
      state.events = [];
    },
  },
});

export const { addSessionEvent, clearSessionEvents } = sessionEventsSlice.actions;
export default sessionEventsSlice.reducer;
