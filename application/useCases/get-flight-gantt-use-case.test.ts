import { describe, it, expect } from "@jest/globals";

import type { FlightGantt } from "@/domain/entities/flight-gantt";

import { GetFlightGanttUseCase } from "./get-flight-gantt-use-case";

import type { FlightRepositoryPort } from "../ports/flight-repository-port";

describe("GetFlightGanttUseCase", () => {
  it("should return flight gantt data from repository", async () => {
    const ganttMock: FlightGantt = {
      flight: {
        flightId: "JPALA363718/01/2026",
        numberArrival: "LA123",
        numberDeparture: "LA124",
        origin: "SCL",
        destination: "LIM",
        ata: null,
        pushIn: null,
        estimatedPushIn: null,
        parkPositionArrival: null,
        parkPositionDeparture: null,
        boardingGate: null,
        foArrival: 0,
        foDeparture: 0,
        ganttIniciado: false,
        ganttInicioTimestamp: null,
        tatVueloMinutos: null,
        tatType: null,
      },
      tasks: [],
      summary: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        delayedTasks: 0,
        progresoGeneral: 0,
        varianzaTotalMinutos: null,
        tatVueloMinutos: null,
        tatType: null,
      },
    };

    const flightRepositoryMock: FlightRepositoryPort = {
      getActiveFlights: jest.fn(),
      getFlightGantt: jest.fn().mockResolvedValue(ganttMock),
      refreshTurnaroundMetrics: jest.fn(),
    };
    const useCase = new GetFlightGanttUseCase(flightRepositoryMock);

    const result = await useCase.execute("JPALA363718/01/2026");

    expect(result).toEqual(ganttMock);
    expect(flightRepositoryMock.getFlightGantt).toHaveBeenCalledWith(
      "JPALA363718/01/2026",
    );
  });

  it("should throw when repository fails", async () => {
    const repositoryMock: FlightRepositoryPort = {
      getActiveFlights: jest.fn(),
      getFlightGantt: jest
        .fn()
        .mockRejectedValue(new Error("Network error")),
      refreshTurnaroundMetrics: jest.fn(),
    };

    const useCase = new GetFlightGanttUseCase(repositoryMock);

    await expect(
      useCase.execute("JPALA363718/01/2026"),
    ).rejects.toThrow("Network error");
  });
});
