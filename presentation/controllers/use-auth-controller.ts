import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';

import { container } from '@/dependencyInjection/container';
import type { AuthSession } from '@/domain/entities/auth-session';
import { decodeJwtPayload, extractUserNameFromToken } from '@/domain/services/jwt-validator';
import {
  applyAuthSessionToHttpClient,
  clearAuthSessionFromHttpClient,
} from '@/infrastructure/api/axios-client';
import { useAuthStoreAdapter } from '@/presentation/adapters/redux-auth-adapter';
import type { AppDispatch } from '@/store';
import { appResetState } from '@/store/actions/app-reset-actions';
import type { AuthRole } from '@/store/slices/auth-slice';

interface TokenClaims {
  role?: string | string[];
  roles?: string[];
}

const extractRolesFromToken = (token: string): string[] => {
  if (!token) return [];
  try {
    const claims = decodeJwtPayload(token) as TokenClaims;
    return [
      ...(Array.isArray(claims.roles) ? claims.roles : []),
      ...(Array.isArray(claims.role) ? claims.role : typeof claims.role === 'string' ? [claims.role] : []),
    ].map((r) => r.toLowerCase());
  } catch {
    return [];
  }
};

const resolveRoleFromSession = (
  session: AuthSession,
  fallbackRole: AuthRole,
): AuthRole => {
  // Check both id_token and access_token since App Roles can appear in either
  // depending on the requested scopes.
  const candidateRoles = [...new Set([
    ...extractRolesFromToken(session.idToken),
    ...extractRolesFromToken(session.accessToken),
  ])];

  if (candidateRoles.includes('admin')) {
    return 'admin';
  }

  if (candidateRoles.includes('viewer')) {
    return 'viewer';
  }

  if (candidateRoles.includes('controller')) {
    return 'controller';
  }

  if (candidateRoles.includes('above_the_wing')) {
    return 'above_the_wing';
  }

  if (candidateRoles.includes('below_the_wing')) {
    return 'below_the_wing';
  }

  return fallbackRole;
};

export const useAuthController = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { role, session, setRole, setSession } = useAuthStoreAdapter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (): Promise<void> => {
      const fallbackRole: AuthRole = 'controller';
      setLoading(true);
      setError(null);

      try {
        const authSession = await container.loginWithAzureUseCase.execute();

        // On web, login() triggers a redirect and never returns
        // The OAuth callback route will handle the session setup
        // This code only runs on native platforms
        const userName = extractUserNameFromToken(authSession.idToken);
        const enrichedSession: AuthSession = { ...authSession, userName };

        setRole(resolveRoleFromSession(enrichedSession, fallbackRole));
        setSession(enrichedSession);
        applyAuthSessionToHttpClient(enrichedSession);
        router.replace('/turnaround' as never);
      } catch (loginError) {
        setError(
          loginError instanceof Error
            ? loginError.message
            : 'No fue posible iniciar sesión.',
        );
      } finally {
        setLoading(false);
      }
    },
    [router, setRole, setSession],
  );

  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Clear storage and Redux state first, regardless of Azure AD revocation
      await container.tokenStorage.clear();
      dispatch(appResetState());
      clearAuthSessionFromHttpClient();
      router.replace('/login' as never);
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : 'No fue posible cerrar sesión.',
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch, router]);

  return {
    error,
    loading,
    login,
    logout,
    session,
  };
};
