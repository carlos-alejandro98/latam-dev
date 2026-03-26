import type { AuthProviderPort } from '@/application/ports/auth-provider-port';
import type { TokenStoragePort } from '@/application/ports/token-storage-port';
import type { AuthSession } from '@/domain/entities/auth-session';
import { AuthError } from '@/domain/errors/auth-error';
import { validateJwtExpiration } from '@/domain/services/jwt-validator';

const hasActiveSession = (session: AuthSession): boolean => {
  const primaryToken = session.idToken || session.accessToken;

  return session.expiresAt > Date.now() && validateJwtExpiration(primaryToken);
};

export class RefreshTokenUseCase {
  constructor(
    private readonly authProvider: AuthProviderPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  async execute(refreshToken?: string): Promise<AuthSession> {
    const storedSession = await this.tokenStorage.get();
    const tokenToRefresh = refreshToken ?? storedSession?.refreshToken;

    if (!tokenToRefresh) {
      throw new AuthError('No refresh token available', 'AUTH_TOKEN_REFRESH_FAILED');
    }

    const refreshedSession = await this.authProvider.refresh(tokenToRefresh);

    if (!hasActiveSession(refreshedSession)) {
      throw new AuthError(
        'Azure AD returned an invalid refreshed token',
        'AUTH_TOKEN_REFRESH_FAILED',
      );
    }

    await this.tokenStorage.save(refreshedSession);

    return refreshedSession;
  }
}
