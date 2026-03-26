import { describe, it, expect, jest } from "@jest/globals";

/**
 * ✅ Use Case Test Template
 *
 * Rules:
 * - Mock ports, not implementations
 * - No Redux
 * - No Axios
 * - No React
 */

describe("ExampleUseCase", () => {
  it("should execute business logic correctly", async () => {
    const portMock = {
      execute: jest.fn().mockResolvedValue("result"),
    };

    const useCase = new ExampleUseCase(portMock as any);

    const result = await useCase.execute();

    expect(result).toBe("result");
    expect(portMock.execute).toHaveBeenCalledTimes(1);
  });
});
