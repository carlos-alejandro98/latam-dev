import { describe, it, expect, jest } from "@jest/globals";

import { flightsHttpGet, flightsHttpPost } from "@/infrastructure/http/flights-http-methods";

import { FlightApiRepository } from "./flight-api-repository";

jest.mock("@/infrastructure/http/flights-http-methods", () => ({
  flightsHttpGet: jest.fn(),
  flightsHttpPost: jest.fn(),
}));

const mockedFlightsHttpGet = flightsHttpGet as unknown as jest.Mock;
const mockedFlightsHttpPost = flightsHttpPost as unknown as jest.Mock;

const turnaroundApiResponseMock = {
  turnaroundId: "turnaround-123",
  flightId: "JPALA363718/01/2026",
  flightNumber: "LA3637",
  aircraftType: "A320",
  aircraftRegistration: "PR-ABC",
  aircraftPrefix: "PR-ABC",
  airport: "SCL",
  gate: "G1",
  origin: "SCL",
  destination: "LIM",
  ganttStarted: true,
  ganttStartTimestamp: [2026, 1, 18, 6, 0],
  tatFlightMinutes: 95,
  tatType: "A320_CURTO",
  status: "IN_PROGRESS",
  flightIndicators: {
    sta: [2026, 1, 18, 5, 0],
    std: [2026, 1, 18, 6, 35],
    eta: [2026, 1, 18, 5, 5],
    etd: [2026, 1, 18, 6, 40],
    ata: [2026, 1, 18, 5, 8],
    atd: [2026, 1, 18, 6, 45],
    pushIn: [2026, 1, 18, 5, 10],
    pushOut: [2026, 1, 18, 6, 42],
    engineOff: [2026, 1, 18, 5, 12],
    doorsOpen: [2026, 1, 18, 5, 15],
  },
  occupancyFactors: {
    paxCount: 150,
    paxCapacity: 174,
    factorOcupacion: 86,
    paxWchr: 0,
    paxUmnr: 0,
    bagsCount: 45,
    cargoWeightKg: 900,
    isInternational: false,
  },
  tasks: [],
  foArrival: 145,
  foDeparture: 148,
  parkPositionArrival: "A1",
  estimatedPushIn: [2026, 1, 18, 5, 7],
};

describe("FlightApiRepository", () => {
  it("should call correct endpoint to get active flights", async () => {
    // Arrange
    const repository = new FlightApiRepository();
    mockedFlightsHttpGet.mockResolvedValue([] as never);
    // Act
    await repository.getActiveFlights();
    // Assert
    expect(flightsHttpGet).toHaveBeenCalledWith(
      "/api/v1/tracking/active-flights-v2",
      expect.objectContaining({
        stdDateFrom: expect.any(String),
        stdDateTo: expect.any(String),
      }),
      undefined,
    );
  });

  it("should call correct endpoint to get flight gantt", async () => {
    const repository = new FlightApiRepository();
    mockedFlightsHttpGet.mockResolvedValue(turnaroundApiResponseMock as never);

    const result = await repository.getFlightGantt("JPALA363718/01/2026");

    expect(flightsHttpGet).toHaveBeenCalledWith(
      "/api/v1/turnarounds/flight/gantt",
      {
        flightId: "JPALA363718/01/2026",
      },
      undefined,
    );
    expect(result.flight.pushOut).toEqual([2026, 1, 18, 6, 42]);
  });

  it("should map 404 errors to FlightError GANTT_NOT_FOUND", async () => {
    const repository = new FlightApiRepository();
    mockedFlightsHttpGet.mockRejectedValue({
      isAxiosError: true,
      response: { status: 404 },
    } as never);

    await expect(
      repository.getFlightGantt("JPALA363718/01/2026"),
    ).rejects.toEqual(
      expect.objectContaining({
        name: "FlightError",
        code: "GANTT_NOT_FOUND",
      }),
    );
  });

  it("should call refresh metrics endpoint for the turnaround", async () => {
    const repository = new FlightApiRepository();
    mockedFlightsHttpPost.mockResolvedValue({
      success: true,
      turnaroundId: "turnaround-123",
      message: "ok",
    } as never);

    await repository.refreshTurnaroundMetrics("turnaround-123");

    expect(flightsHttpPost).toHaveBeenCalledWith(
      "/api/v1/turnarounds/turnaround-123/refresh-metrics",
      undefined,
    );
  });
});
