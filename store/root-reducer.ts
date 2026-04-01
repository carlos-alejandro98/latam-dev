import { combineReducers, type UnknownAction } from '@reduxjs/toolkit';

import { appResetState } from '@/store/actions/app-reset-actions';
import authReducer from '@/store/slices/auth-slice';
import flightCommentsReducer from '@/store/slices/flight-comments-slice';
import flightGanttReducer from '@/store/slices/flight-gantt-slice';
import { flightSelectionReducer } from '@/store/slices/flight-selection-slice';
import flightsReducer from '@/store/slices/flights-slice';
import sessionEventsReducer from '@/store/slices/session-events-slice';

const combinedReducer = combineReducers({
  auth: authReducer,
  flightComments: flightCommentsReducer,
  flightGantt: flightGanttReducer,
  flightSelection: flightSelectionReducer,
  flights: flightsReducer,
  sessionEvents: sessionEventsReducer,
});

export type RootState = ReturnType<typeof combinedReducer>;

export const rootReducer = (
  state: RootState | undefined,
  action: UnknownAction,
): RootState => {
  if (appResetState.match(action)) {
    return combinedReducer(undefined, action);
  }

  return combinedReducer(state, action);
};
