import { configureStore } from '@reduxjs/toolkit';

import { createFlightSelectionLocalStorageAdapter } from '@/infrastructure/storage/flight-selection-local-storage-adapter';
import { createFlightSelectionPersistenceMiddleware } from '@/store/middleware/flight-selection-persistence-middleware';
import { rootReducer } from '@/store/root-reducer';

const flightSelectionPersistence = createFlightSelectionLocalStorageAdapter();

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      createFlightSelectionPersistenceMiddleware(flightSelectionPersistence),
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
