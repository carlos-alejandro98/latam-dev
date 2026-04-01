import { useEffect, useState } from 'react';

import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { IS_WEB } from '@/config/platform';
import { container } from '@/dependencyInjection/container';
import { decodeJwtPayload, extractUserNameFromToken } from '@/domain/services/jwt-validator';
import { applyAuthSessionToHttpClient } from '@/infrastructure/api/axios-client';
import type { AppDispatch } from '@/store';
import { setSession, setRole, setUserPhotoUrl, type AuthRole } from '@/store/slices/auth-slice';

interface TokenClaims {
  role?: string | string[];
  roles?: string[];
  groups?: string[];
}

/**
 * Safely decodes a JWT and extracts role-like claims.
 * Returns an empty array if the token is opaque or cannot be decoded.
 */
const extractRolesFromToken = (token: string): string[] => {
  if (!token) return [];
  try {
    const claims = decodeJwtPayload(token) as TokenClaims;
    const roles: string[] = [
      ...(Array.isArray(claims.roles) ? claims.roles : []),
      ...(Array.isArray(claims.role) ? claims.role : typeof claims.role === 'string' ? [claims.role] : []),
    ];
    return roles.map((r) => r.toLowerCase());
  } catch {
    // access_token may be opaque — ignore decode errors silently
    return [];
  }
};

/**
 * Returns the resolved AuthRole, or null if the token carries no recognised role.
 * A null result means the user should be blocked and redirected back to login.
 */
const resolveRoleFromSession = (
  idToken: string,
  accessToken: string,
): AuthRole | null => {
  // Search roles in id_token first, then in access_token as fallback.
  // Azure AD includes App Roles in the access_token when the app-scope is requested.
  const idTokenRoles = extractRolesFromToken(idToken);
  const accessTokenRoles = extractRolesFromToken(accessToken);
  const candidateRoles = [...new Set([...idTokenRoles, ...accessTokenRoles])];

  console.log(
    '[Auth] Claims de roles encontrados:',
    '\n  id_token roles:', idTokenRoles,
    '\n  access_token roles:', accessTokenRoles,
    '\n  Candidatos combinados:', candidateRoles,
  );

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

  // No recognised role found — access denied.
  return null;
};

/**
 * OAuth callback route for Azure AD authentication.
 * This route handles the redirect from Azure AD after authentication on web.
 * It extracts the authorization code from URL params and exchanges it for tokens.
 */
export default function OAuthCallbackRoute() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  const canUseBrowserLocation =
    IS_WEB &&
    typeof window.location?.search === 'string' &&
    typeof window.history?.replaceState === 'function';

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (!canUseBrowserLocation) {
          router.replace('/login');
          return;
        }

        // Extract the authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          setTimeout(() => router.replace('/login'), 3000);
          return;
        }

        if (!code) {
          setError('No authorization code received');
          setTimeout(() => router.replace('/login'), 3000);
          return;
        }

        // Exchange code for tokens using the auth adapter
        const authProvider = container.authProvider;

        if (!authProvider.handleWebCallback) {
          setError('Web callback handler not available');
          setTimeout(() => router.replace('/login'), 3000);
          return;
        }

        const session = await authProvider.handleWebCallback(code);

        // ─── DEBUG: log completo del token de Azure AD ───────────────────────
        try {
          const idTokenPayload = decodeJwtPayload(session.idToken);
          console.log(
            ' ══════════════════════════════════════════════════\n' +
            ' AZURE AD — id_token payload completo:\n' +
              JSON.stringify(idTokenPayload, null, 2) +
            '\n ══════════════════════════════════════════════════',
          );
          console.log('Campos clave del usuario:', {
            given_name:         idTokenPayload.given_name,
            family_name:        idTokenPayload.family_name,
            name:               idTokenPayload.name,
            preferred_username: idTokenPayload.preferred_username,
            email:              idTokenPayload.email,
            upn:                idTokenPayload.upn,
            oid:                idTokenPayload.oid,
            roles:              idTokenPayload.roles,
          });
        } catch (decodeErr) {
          console.log('No se pudo decodificar id_token:', decodeErr);
        }

        try {
          const accessTokenPayload = decodeJwtPayload(session.accessToken);
          console.log('access_token payload (roles/groups):', {
            roles:  accessTokenPayload.roles,
            groups: (accessTokenPayload as Record<string, unknown>).groups,
            scp:    (accessTokenPayload as Record<string, unknown>).scp,
          });
        } catch {
          console.log('access_token es opaco (no decodificable) — esto es normal en algunos flujos de Azure.');
        }
        // ─────────────────────────────────────────────────────────────────────

        // Extract display name from the id_token
        const userName = extractUserNameFromToken(session.idToken);

        // Fetch user profile photo from Microsoft Graph.
        // The access_token now includes the User.Read scope so it is valid
        // for Graph API calls. If the request fails for any reason (no photo
        // configured, wrong audience, network error) we fall back gracefully.
        let userPhotoUrl: string | undefined;
        try {
          const photoResponse = await fetch(
            'https://graph.microsoft.com/v1.0/me/photo/$value',
            { headers: { Authorization: `Bearer ${session.accessToken}` } },
          );
          if (photoResponse.ok) {
            const blob = await photoResponse.blob();
            userPhotoUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            console.log('[Auth] Foto de perfil obtenida exitosamente desde Microsoft Graph.');
          } else {
            console.log('[Auth] Foto de perfil no disponible — status:', photoResponse.status, '| audience del token puede ser incorrecto si es distinto de 401.');
          }
        } catch (photoErr) {
          console.log('[Auth] Error al obtener foto de perfil desde Graph:', photoErr);
        }

        const enrichedSession = { ...session, userName, userPhotoUrl };

        // Resolve role from token claims — null means no recognised role.
        const resolvedRole = resolveRoleFromSession(
          enrichedSession.idToken,
          enrichedSession.accessToken,
        );

        console.log('[Auth] Usuario autenticado con Azure AD — Rol resuelto:', resolvedRole, '| Nombre:', userName);

        // If no role was found, block access and redirect back to login.
        if (!resolvedRole) {
          console.log('[Auth] Sin rol reconocido — redirigiendo al login con error de permisos.');
          window.history.replaceState({}, document.title, '/oauth');
          router.replace('/login?error=no_permissions');
          return;
        }

        // Store session and role in Redux
        dispatch(setSession(enrichedSession));
        dispatch(setRole(resolvedRole));
        if (userPhotoUrl) {
          dispatch(setUserPhotoUrl(userPhotoUrl));
        }

        // Store session for persistence
        await container.tokenStorage.save(enrichedSession);

        // Apply auth session to HTTP client for API calls
        applyAuthSessionToHttpClient(session);

        // Clear URL params and redirect to turnaround
        window.history.replaceState({}, document.title, '/oauth');
        router.replace('/turnaround');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Authentication failed';
        setError(message);
        setTimeout(() => router.replace('/login'), 3000);
      }
    };

    // Only run on web
    if (canUseBrowserLocation) {
      handleCallback();
    }
  }, [canUseBrowserLocation, router, dispatch]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Authentication Error</Text>
        <Text style={styles.errorDescription}>{error}</Text>
        <Text style={styles.redirectText}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0066CC" />
      <Text style={styles.loadingText}>Completing authentication...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CC0000',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  redirectText: {
    fontSize: 14,
    color: '#999999',
  },
});
