import { useCallback } from 'react';
import { useDispatch, useSelector } from "react-redux";

import type { DateRangeParams } from "@/application/ports/flight-repository-port";
import type { AppDispatch, RootState } from "@/store";
import { fetchActiveFlights } from "@/store/slices/flights-slice";

export const useFlightsStoreAdapter = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  /**
   * Carga los vuelos activos para un rango de fechas.
   * @param dateRange - Rango de fechas en formato ddMMyyyy (ej: { stdDateFrom: "25032026", stdDateTo: "25032026" })
   *                    Si no se proporciona, usa un rango por defecto de 3 días antes y después de hoy.
   */
  const loadFlights = useCallback(
    (dateRange?: DateRangeParams) => dispatch(fetchActiveFlights(dateRange)),
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
