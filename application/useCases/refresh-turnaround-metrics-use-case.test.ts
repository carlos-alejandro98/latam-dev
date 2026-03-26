import { describe, expect, it } from "@jest/globals";

import { RefreshTurnaroundMetricsUseCase } from "./refresh-turnaround-metrics-use-case";

import type { FlightRepositoryPort } from "../ports/flight-repository-port";

describe("RefreshTurnaroundMetricsUseCase", () => {
  it("delegates the refresh-metrics request to the repository", async () => {
    const repositoryMock: FlightRepositoryPort = {
      getActiveFlights: jest.fn(),
      getFlightGantt: jest.fn(),
      refreshTurnaroundMetrics: jest.fn().mockResolvedValue(undefined),
    };
    const useCase = new RefreshTurnaroundMetricsUseCase(repositoryMock);

    await useCase.execute("turnaround-123");

    expect(repositoryMock.refreshTurnaroundMetrics).toHaveBeenCalledWith("turnaround-123");
  });
});
