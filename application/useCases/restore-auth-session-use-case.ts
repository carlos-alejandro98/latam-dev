import type { TokenStoragePort } from '@/application/ports/token-storage-port';
import { RefreshTokenUseCase } from '@/application/useCases/refresh-token-use-case';
import type { AuthSession } from '@/domain/entities/auth-session';
import { validateJwtExpiration } from '@/domain/services/jwt-validator';

const hasActiveSession = (session: AuthSession): boolean => {
  const primaryToken = session.idToken || session.accessToken;

  return session.expiresAt > Date.now() && validateJwtExpiration(primaryToken);
};

export class RestoreAuthSessionUseCase {
  constructor(
    private readonly tokenStorage: TokenStoragePort,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  async execute(): Promise<AuthSession | null> {
    const storedSession = await this.tokenStorage.get();

    if (!storedSession) {
      return null;
    }

    if (hasActiveSession(storedSession)) {
      return storedSession;
    }

    if (!storedSession.refreshToken) {
      await this.tokenStorage.clear();
      return null;
    }

    try {
      return await this.refreshTokenUseCase.execute(storedSession.refreshToken);
    } catch {
      await this.tokenStorage.clear();
      return null;
    }
  }
}
