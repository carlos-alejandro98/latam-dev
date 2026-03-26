import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { container } from '@/dependencyInjection/container';
import type { Flight } from '@/domain/entities/flight';
import { flightShallowCompare } from '@/store/flight-shallow-compare';

export const fetchActiveFlights = createAsyncThunk(
  'flights/fetchActive',
  async () => {
    return container.getActiveFlightsUseCase.execute();
  },
);

interface FlightsState {
  data: Flight[];
  loading: boolean;
  error?: string;
}

const initialState: FlightsState = {
  data: [],
  loading: false,
};

const flightsSlice = createSlice({
  name: 'flights',
  initialState,
  reducers: {
    /** Actualización diferencial: mantiene referencias estables para vuelos no modificados. */
    updateFlightsPatch: (state, action: PayloadAction<Flight[]>) => {
      const updates = action.payload;
      const flightMap = new Map<string, Flight>(
        state.data.map((f) => [f.flightId, f]),
      );

      for (const updated of updates) {
        const existing = flightMap.get(updated.flightId);

        if (!existing) {
          flightMap.set(updated.flightId, updated);
          continue;
        }

        if (flightShallowCompare(existing, updated)) {
          continue;
        }

        flightMap.set(updated.flightId, { ...existing, ...updated });
      }

      state.data = Array.from(flightMap.values());
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveFlights.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchActiveFlights.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchActiveFlights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { updateFlightsPatch } = flightsSlice.actions;
export default flightsSlice.reducer;
