import { describe, expect, it, jest } from "@jest/globals";

jest.mock("@/dependencyInjection/container", () => ({
  container: {
    getFlightGanttUseCase: {
      execute: jest.fn(),
    },
  },
}));

import reducer, { fetchFlightGantt } from "./flight-gantt-slice";

describe("flight-gantt-slice", () => {
  it("clears the error when gantt is not found", () => {
    const state = reducer(
      undefined,
      fetchFlightGantt.rejected(
        {
          name: "FlightError",
          message: "No turnaround gantt found",
          code: "GANTT_NOT_FOUND",
        } as Error & { code: string },
        "request-id",
        "JPALA363718/01/2026",
      ),
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBeUndefined();
    expect(state.data).toBeNull();
  });
});
