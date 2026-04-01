import * as SecureStore from 'expo-secure-store';

import type { TokenStoragePort } from '@/application/ports/token-storage-port';
import { IS_WEB } from '@/config/platform';
import type { AuthSession } from '@/domain/entities/auth-session';
import { AuthError } from '@/domain/errors/auth-error';

const STORAGE_KEY = 'aptotatgantt.auth-session';

const saveOnWeb = async (value: string): Promise<void> => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, value);
};

const getFromWeb = async (): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY);
};

const clearFromWeb = async (): Promise<void> => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export class SecureStoreAdapter implements TokenStoragePort {
  async save(session: AuthSession): Promise<void> {
    const serializedSession = JSON.stringify(session);

    try {
      if (IS_WEB) {
        await saveOnWeb(serializedSession);
        return;
      }

      await SecureStore.setItemAsync(STORAGE_KEY, serializedSession);
    } catch {
      throw new AuthError('Unable to persist auth session', 'AUTH_STORAGE_FAILED');
    }
  }

  async get(): Promise<AuthSession | null> {
    try {
      const value = IS_WEB
        ? await getFromWeb()
        : await SecureStore.getItemAsync(STORAGE_KEY);

      return value ? (JSON.parse(value) as AuthSession) : null;
    } catch {
      throw new AuthError('Unable to read auth session', 'AUTH_STORAGE_FAILED');
    }
  }

  async clear(): Promise<void> {
    try {
      if (IS_WEB) {
        await clearFromWeb();
        return;
      }

      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } catch {
      throw new AuthError('Unable to clear auth session', 'AUTH_STORAGE_FAILED');
    }
  }
}
