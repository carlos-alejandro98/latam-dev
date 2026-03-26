import type { AuthProviderPort } from '@/application/ports/auth-provider-port';
import type { TokenStoragePort } from '@/application/ports/token-storage-port';

export class LogoutUseCase {
  constructor(
    private readonly authProvider: AuthProviderPort,
    private readonly tokenStorage: TokenStoragePort,
  ) {}

  async execute(): Promise<void> {
    try {
      await this.authProvider.logout();
    } finally {
      await this.tokenStorage.clear();
    }
  }
}
