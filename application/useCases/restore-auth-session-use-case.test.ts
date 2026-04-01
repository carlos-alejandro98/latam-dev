import { RestoreAuthSessionUseCase } from '@/application/useCases/restore-auth-session-use-case';

describe('RestoreAuthSessionUseCase', () => {
  it('should return stored session when it is still valid', async () => {
    const storedSession = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      idToken: 'header.eyJleHAiOjQ3NDM4NTYwMDAsIm5hbWUiOiJUZXN0In0.signature',
      expiresAt: Date.now() + 60_000,
    };

    const mockStorage = {
      save: jest.fn(),
      get: jest.fn().mockResolvedValue(storedSession),
      clear: jest.fn(),
    };
    const mockRefreshTokenUseCase = {
      execute: jest.fn(),
    };

    const useCase = new RestoreAuthSessionUseCase(
      mockStorage,
      mockRefreshTokenUseCase as never,
    );

    const result = await useCase.execute();

    expect(result).toEqual(storedSession);
    expect(mockRefreshTokenUseCase.execute).not.toHaveBeenCalled();
  });

  it('should refresh expired session when refresh token exists', async () => {
    const expiredSession = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      idToken: 'header.eyJleHAiOjEwMDAsIm5hbWUiOiJUZXN0In0.signature',
      expiresAt: Date.now() - 60_000,
    };
    const refreshedSession = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      idToken: 'header.eyJleHAiOjQ3NDM4NTYwMDAsIm5hbWUiOiJUZXN0In0.signature',
      expiresAt: Date.now() + 60_000,
    };

    const mockStorage = {
      save: jest.fn(),
      get: jest.fn().mockResolvedValue(expiredSession),
      clear: jest.fn(),
    };
    const mockRefreshTokenUseCase = {
      execute: jest.fn().mockResolvedValue(refreshedSession),
    };

    const useCase = new RestoreAuthSessionUseCase(
      mockStorage,
      mockRefreshTokenUseCase as never,
    );

    const result = await useCase.execute();

    expect(mockRefreshTokenUseCase.execute).toHaveBeenCalledWith('refresh-token');
    expect(result).toEqual(refreshedSession);
  });
});
