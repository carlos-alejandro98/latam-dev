import type { AuthSession } from '@/domain/entities/auth-session';

export interface TokenStoragePort {
  save(session: AuthSession): Promise<void>;
  get(): Promise<AuthSession | null>;
  clear(): Promise<void>;
}
