import { useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@/store";
import { fetchActiveFlights } from "@/store/slices/flights-slice";

export const useFlightsStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loadFlights = useCallback(
    () => dispatch(fetchActiveFlights()),
    [dispatch],
  );

  const flights = useSelector((state: RootState) => state.flights.data);

  const loading = useSelector((state: RootState) => state.flights.loading);

  return {
    flights,
    loading,
    loadFlights,
  };
};
