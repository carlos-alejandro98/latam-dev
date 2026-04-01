import type { AuthProviderPort } from '@/application/ports/auth-provider-port';
import type { TokenStoragePort } from '@/application/ports/token-storage-port';
import type { AuthSession } from '@/domain/entities/auth-session';
import { AuthError } from '@/domain/errors/auth-error';
import { validateJwtExpiration } from '@/domain/services/jwt-validator';

const hasActiveSession = (session: AuthSession): boolean => {
  const primaryToken = session.idToken || session.accessToken;

  return session.expiresAt > Date.now() && validateJwtExpiration(primaryToken);
};

export class LoginWithAzureUseCase {
  constructor(
    private readonly authProvider: AuthProviderPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  async execute(): Promise<AuthSession> {
    const session = await this.authProvider.login();

    if (!hasActiveSession(session)) {
      throw new AuthError('Azure AD returned an expired or invalid token', 'AUTH_TOKEN_INVALID');
    }

    await this.tokenStorage.save(session);

    return session;
  }
}
