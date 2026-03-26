import { LoginWithAzureUseCase } from '@/application/useCases/login-with-azure-use-case';

describe('LoginWithAzureUseCase', () => {
  it('should save session after successful Azure login', async () => {
    const session = {
      accessToken:
        'header.eyJleHAiOjQ3NDM4NTYwMDAsIm5hbWUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature',
      refreshToken: 'refresh-token',
      idToken:
        'header.eyJleHAiOjQ3NDM4NTYwMDAsIm5hbWUiOiJUZXN0IFVzZXIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.signature',
      expiresAt: Date.now() + 60_000,
    };

    const mockProvider = {
      login: jest.fn().mockResolvedValue(session),
      refresh: jest.fn(),
      logout: jest.fn(),
    };
    const mockStorage = {
      save: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      clear: jest.fn(),
    };

    const useCase = new LoginWithAzureUseCase(mockProvider, mockStorage);

    const result = await useCase.execute();

    expect(mockProvider.login).toHaveBeenCalled();
    expect(mockStorage.save).toHaveBeenCalledWith(session);
    expect(result).toEqual(session);
  });
});
