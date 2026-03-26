import { useCallback, useEffect, useMemo, useState } from 'react';

import { useFlightSelectionStoreAdapter } from '@/presentation/adapters/redux/flight-selection-store-adapter';
import { useFlightsStoreAdapter } from '@/presentation/adapters/redux/flights-store-adapter';

export const useHomeController = () => {
  const { flights, loading, loadFlights } = useFlightsStoreAdapter();
  const {
    activeFlightId,
    clearSelectedFlight,
    closeFlight,
    openFlightSingle,
    pruneInvalidIds,
    rehydrateFromStorage,
    selectFlight,
    selectedFlightIds,
  } = useFlightSelectionStoreAdapter();

  const [initialLoading, setInitialLoading] = useState(() => flights.length === 0);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve(loadFlights()).finally(() => {
      if (!cancelled) {
        setInitialLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [loadFlights]);

  useEffect(() => {
    rehydrateFromStorage();
  }, [rehydrateFromStorage]);

  useEffect(() => {
    if (!flights.length) {
      return;
    }

    pruneInvalidIds(flights.map((flight) => flight.flightId));
  }, [flights, pruneInvalidIds]);

  const selectedFlight = useMemo(() => {
    if (!activeFlightId) {
      return null;
    }

    return (
      flights.find((flight) => flight.flightId === activeFlightId) ?? null
    );
  }, [flights, activeFlightId]);

  const reloadFlights = useCallback(() => {
    return loadFlights();
  }, [loadFlights]);

  return {
    activeFlightId,
    clearSelectedFlight,
    closeFlight,
    flights,
    initialLoading,
    loading,
    openFlightSingle,
    reloadFlights,
    selectFlight,
    selectedFlight,
    selectedFlightId: activeFlightId,
    selectedFlightIds,
  };
};
