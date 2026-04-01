import { describe, it, expect } from "@jest/globals";

import type { Flight } from "@/domain/entities/flight";

import { GetActiveFlightsUseCase } from "./get-active-flights-use-case";

import type { FlightRepositoryPort } from "../ports/flight-repository-port";

describe("GetActiveFlightsUseCase", () => {
  it("should return active flights from repository", async () => {
    // Arrange
    const flightsMock: Flight[] = [
      {
        flightId: "FL001",
        numberArrival: "LA123",
        numberDeparture: "LA124",
        origin: "SCL",
        destination: "LIM",
        prefix: "LA",
        staTime: "10:00",
        staDate: "2026-01-01",
        stdTime: "11:00",
        stdDate: "2026-01-01",
        ganttIniciado: false,
      },
    ];
    const flightRepositoryMock: FlightRepositoryPort = {
      getActiveFlights: jest.fn().mockResolvedValue(flightsMock),
      getFlightGantt: jest.fn(),
      refreshTurnaroundMetrics: jest.fn(),
    };
    const useCase = new GetActiveFlightsUseCase(flightRepositoryMock);
    // Act
    const result = await useCase.execute();
    // Assert
    expect(result).toEqual(flightsMock);
    expect(flightRepositoryMock.getActiveFlights).toHaveBeenCalledTimes(1);
  });
  it("should throw when repository fails", async () => {
    const repositoryMock: FlightRepositoryPort = {
      getActiveFlights: jest.fn().mockRejectedValue(new Error("Network error")),
      getFlightGantt: jest.fn(),
      refreshTurnaroundMetrics: jest.fn(),
    };

    const useCase = new GetActiveFlightsUseCase(repositoryMock);

    await expect(useCase.execute()).rejects.toThrow("Network error");
  });
});
