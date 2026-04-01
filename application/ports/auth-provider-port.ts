import type { AuthSession } from '@/domain/entities/auth-session';

export interface AuthProviderPort {
  login(): Promise<AuthSession>;
  handleWebCallback?(code: string): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  logout(): Promise<void>;
}
