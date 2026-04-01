import { RefreshTokenUseCase } from '@/application/useCases/refresh-token-use-case';

describe('RefreshTokenUseCase', () => {
  it('should refresh and persist a new session', async () => {
    const storedSession = {
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      idToken: 'header.eyJleHAiOjQ3NDM4NTYwMDAsIm5hbWUiOiJUZXN0In0.signature',
      expiresAt: Date.now() - 1_000,
    };
    const refreshedSession = {
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      idToken: 'header.eyJleHAiOjQ3NDM4NTYwMDAsIm5hbWUiOiJUZXN0In0.signature',
      expiresAt: Date.now() + 60_000,
    };

    const mockProvider = {
      login: jest.fn(),
      refresh: jest.fn().mockResolvedValue(refreshedSession),
      logout: jest.fn(),
    };
    const mockStorage = {
      save: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(storedSession),
      clear: jest.fn(),
    };

    const useCase = new RefreshTokenUseCase(mockProvider, mockStorage);

    const result = await useCase.execute();

    expect(mockStorage.get).toHaveBeenCalled();
    expect(mockProvider.refresh).toHaveBeenCalledWith('old-refresh');
    expect(mockStorage.save).toHaveBeenCalledWith(refreshedSession);
    expect(result).toEqual(refreshedSession);
  });
});
