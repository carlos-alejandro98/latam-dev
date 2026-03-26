import { describe, it, expect, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react-native";

import { useFlightGanttStoreAdapter } from "../adapters/redux/flight-gantt-store-adapter";

import { useFlightGanttController } from "./use-flight-gantt-controller";

jest.mock("../adapters/redux/flight-gantt-store-adapter", () => ({
  useFlightGanttStoreAdapter: jest.fn(),
}));

describe("useFlightGanttController", () => {
  it("should load flight gantt when flightId is provided", () => {
    const loadFlightGanttMock = jest.fn();

    (useFlightGanttStoreAdapter as jest.Mock).mockReturnValue({
      gantt: null,
      loading: false,
      error: undefined,
      loadFlightGantt: loadFlightGanttMock,
    });

    renderHook(() => useFlightGanttController("JPALA363718/01/2026"));

    expect(loadFlightGanttMock).toHaveBeenCalledWith(
      "JPALA363718/01/2026",
    );
  });

  it("should not load flight gantt when autoLoad is disabled", () => {
    const loadFlightGanttMock = jest.fn();

    (useFlightGanttStoreAdapter as jest.Mock).mockReturnValue({
      gantt: null,
      loading: false,
      error: undefined,
      loadFlightGantt: loadFlightGanttMock,
    });

    renderHook(() =>
      useFlightGanttController("JPALA363718/01/2026", { autoLoad: false }),
    );

    expect(loadFlightGanttMock).not.toHaveBeenCalled();
  });

  it("should not load flight gantt without flightId", () => {
    const loadFlightGanttMock = jest.fn();

    (useFlightGanttStoreAdapter as jest.Mock).mockReturnValue({
      gantt: null,
      loading: false,
      error: undefined,
      loadFlightGantt: loadFlightGanttMock,
    });

    renderHook(() => useFlightGanttController());

    expect(loadFlightGanttMock).not.toHaveBeenCalled();
  });
});
