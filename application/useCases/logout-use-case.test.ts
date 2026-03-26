import { LogoutUseCase } from '@/application/useCases/logout-use-case';

describe('LogoutUseCase', () => {
  it('should clear local session even when provider logout succeeds', async () => {
    const mockProvider = {
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn().mockResolvedValue(undefined),
    };
    const mockStorage = {
      save: jest.fn(),
      get: jest.fn(),
      clear: jest.fn().mockResolvedValue(undefined),
    };

    const useCase = new LogoutUseCase(mockProvider, mockStorage);

    await useCase.execute();

    expect(mockProvider.logout).toHaveBeenCalled();
    expect(mockStorage.clear).toHaveBeenCalled();
  });
});
