import { describe, it, expect, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";

import { useFlightsStoreAdapter } from "../adapters/redux/flights-store-adapter";

import { useHomeController } from "./use-home-controller";

// ✅ Jest hoists this automatically
jest.mock("../adapters/redux/flights-store-adapter", () => ({
  useFlightsStoreAdapter: jest.fn(),
}));

describe("useHomeController", () => {
  it("should load flights on mount", async () => {
    const loadFlightsMock = jest.fn(() => Promise.resolve());

    (useFlightsStoreAdapter as jest.Mock).mockReturnValue({
      flights: [],
      loading: false,
      loadFlights: loadFlightsMock,
    });

    renderHook(() => useHomeController());

    await act(async () => {
      await Promise.resolve();
    });

    expect(loadFlightsMock).toHaveBeenCalled();
  });

  it("exposes manual reload for flights", async () => {
    const loadFlightsMock = jest.fn(() => Promise.resolve());

    (useFlightsStoreAdapter as jest.Mock).mockReturnValue({
      flights: [],
      loading: false,
      loadFlights: loadFlightsMock,
    });

    const { result } = renderHook(() => useHomeController());

    await act(async () => {
      await Promise.resolve();
    });

    const initialCallCount = loadFlightsMock.mock.calls.length;
    result.current.reloadFlights();

    expect(loadFlightsMock).toHaveBeenCalledTimes(initialCallCount + 1);
  });

  it("does not auto-select the nearest flight on initial load", async () => {
    (useFlightsStoreAdapter as jest.Mock).mockReturnValue({
      flights: [
        {
          flightId: "TOMORROW",
          numberArrival: "LA100",
          numberDeparture: "LA200",
          origin: "SCL",
          destination: "LIM",
          aircraftType: "A320",
          aircraftPrefix: "PR-ONE",
          staTime: "08:00",
          staDate: "2026-03-20",
          etaTime: "08:10",
          etaDate: "2026-03-20",
          stdTime: "00:10",
          stdDate: "2026-03-20",
          etdTime: "",
          etdDate: "",
          ata: null,
          std: "2026-03-20T00:10:00",
          atd: null,
          pushIn: null,
          pushOut: null,
          estimatedPushIn: null,
          parkPositionArrival: null,
          parkPositionDeparture: null,
          boardingGate: null,
          paxTotalArrival: 0,
          paxCnxArrival: 0,
          paxLocalArrival: 0,
          paxTotalDeparture: 0,
          paxCnxDeparture: 0,
          paxLocalDeparture: 0,
          wchrArrival: 0,
          wchrDeparture: 0,
          bagsCnxArrival: 0,
          bagsCnxDeparture: 0,
          tatVueloMinutos: null,
          tatType: null,
          varianzaMinutos: null,
          minutosDesembarqueProyectado: null,
          variacionDesembarque: null,
          factorCarga: null,
          tiempoTotalProyectadoRampa: null,
          variacionRampa: null,
          proporcionCarga: null,
          foArrival: 0,
          foDeparture: 0,
          ganttIniciado: false,
          ganttInicioTimestamp: null,
          ingestionTimestamp: "2026-03-19T00:00:00",
        },
        {
          flightId: "TODAY-NEAREST",
          numberArrival: "LA101",
          numberDeparture: "LA201",
          origin: "SCL",
          destination: "GRU",
          aircraftType: "A320",
          aircraftPrefix: "PR-TWO",
          staTime: "08:00",
          staDate: "2026-03-19",
          etaTime: "08:10",
          etaDate: "2026-03-19",
          stdTime: "12:20",
          stdDate: "2026-03-19",
          etdTime: "",
          etdDate: "",
          ata: null,
          std: "2026-03-19T12:20:00",
          atd: null,
          pushIn: null,
          pushOut: null,
          estimatedPushIn: null,
          parkPositionArrival: null,
          parkPositionDeparture: null,
          boardingGate: null,
          paxTotalArrival: 0,
          paxCnxArrival: 0,
          paxLocalArrival: 0,
          paxTotalDeparture: 0,
          paxCnxDeparture: 0,
          paxLocalDeparture: 0,
          wchrArrival: 0,
          wchrDeparture: 0,
          bagsCnxArrival: 0,
          bagsCnxDeparture: 0,
          tatVueloMinutos: null,
          tatType: null,
          varianzaMinutos: null,
          minutosDesembarqueProyectado: null,
          variacionDesembarque: null,
          factorCarga: null,
          tiempoTotalProyectadoRampa: null,
          variacionRampa: null,
          proporcionCarga: null,
          foArrival: 0,
          foDeparture: 0,
          ganttIniciado: false,
          ganttInicioTimestamp: null,
          ingestionTimestamp: "2026-03-19T00:00:00",
        },
      ],
      loading: false,
      loadFlights: jest.fn(() => Promise.resolve()),
    });

    const { result } = renderHook(() => useHomeController());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.selectedFlightId).toBeNull();
    expect(result.current.selectedFlight).toBeNull();
    expect(result.current.selectedFlightIds).toEqual([]);
  });

  it("keeps an initial loading state until the first fetch settles", async () => {
    let resolveLoad: (() => void) | null = null;
    const loadFlightsMock = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        }),
    );

    (useFlightsStoreAdapter as jest.Mock).mockReturnValue({
      flights: [],
      loading: false,
      loadFlights: loadFlightsMock,
    });

    const { result } = renderHook(() => useHomeController());

    expect(result.current.initialLoading).toBe(true);

    await act(async () => {
      resolveLoad?.();
      await Promise.resolve();
    });

    expect(result.current.initialLoading).toBe(false);
  });
});
