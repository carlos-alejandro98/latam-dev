import * as ExpoAuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import type { AuthProviderPort } from '@/application/ports/auth-provider-port';
import { AUTH_CONFIG, getRedirectUri } from '@/config/auth.config';
import { IS_WEB } from '@/config/platform';
import type { AuthSession } from '@/domain/entities/auth-session';
import { AuthError } from '@/domain/errors/auth-error';

// Only call maybeCompleteAuthSession on native platforms
// On web, we handle the callback differently to avoid COOP issues
if (!IS_WEB) {
  WebBrowser.maybeCompleteAuthSession();
}

const PKCE_STORAGE_KEY = 'aptotatgantt.azure_pkce_verifier';
const PKCE_STATE_KEY = 'aptotatgantt.azure_oauth_state';

const mapTokenResponseToSession = (
  tokenResponse: ExpoAuthSession.TokenResponse,
  fallbackRefreshToken?: string,
): AuthSession => {
  if (!tokenResponse.accessToken || !tokenResponse.idToken || !tokenResponse.expiresIn) {
    throw new AuthError(
      'Azure AD did not return the required token payload',
      'AUTH_LOGIN_FAILED',
    );
  }

  return {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken ?? fallbackRefreshToken ?? '',
    idToken: tokenResponse.idToken,
    expiresAt: Date.now() + tokenResponse.expiresIn * 1000,
  };
};

/**
 * Stores PKCE code verifier for web flow (needed for token exchange after redirect)
 * Uses localStorage for persistence across redirects
 */
const storePKCEVerifier = (codeVerifier: string, state: string): void => {
  if (IS_WEB && typeof localStorage !== 'undefined') {
    localStorage.setItem(PKCE_STORAGE_KEY, codeVerifier);
    localStorage.setItem(PKCE_STATE_KEY, state);
  }
};

/**
 * Retrieves and clears stored PKCE code verifier
 */
const retrievePKCEVerifier = (): string | null => {
  if (IS_WEB && typeof localStorage !== 'undefined') {
    const verifier = localStorage.getItem(PKCE_STORAGE_KEY);
    localStorage.removeItem(PKCE_STORAGE_KEY);
    localStorage.removeItem(PKCE_STATE_KEY);
    return verifier;
  }
  return null;
};

export class AzureAuthAdapter implements AuthProviderPort {
  /**
   * Initiates the login flow.
   * - On native: Uses popup flow with expo-auth-session
   * - On web: Redirects to Azure AD (full page redirect to avoid COOP issues)
   */
  async login(): Promise<AuthSession> {
    const redirectUri = getRedirectUri();

    const request = new ExpoAuthSession.AuthRequest({
      clientId: AUTH_CONFIG.clientId,
      scopes: [...AUTH_CONFIG.scopes],
      redirectUri,
      responseType: ExpoAuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: {
        prompt: 'select_account',
      },
    });

    const authUrl = await request.makeAuthUrlAsync(AUTH_CONFIG.discovery);

    if (IS_WEB) {
      // Store PKCE verifier for later token exchange
      if (request.codeVerifier && request.state) {
        storePKCEVerifier(request.codeVerifier, request.state);
      }
      // Redirect to Azure AD (full page redirect avoids COOP issues)
      window.location.href = authUrl;
      // Return a never-resolving promise since we're redirecting
      return new Promise(() => { });
    }

    // Native flow: use popup
    const result = await request.promptAsync(AUTH_CONFIG.discovery);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      throw new AuthError('The Azure AD login flow was cancelled', 'AUTH_LOGIN_CANCELLED');
    }

    if (result.type !== 'success') {
      throw new AuthError('The Azure AD login flow failed', 'AUTH_LOGIN_FAILED');
    }

    try {
      const tokenResponse = await ExpoAuthSession.exchangeCodeAsync(
        {
          clientId: AUTH_CONFIG.clientId,
          code: result.params.code,
          redirectUri,
          extraParams: {
            code_verifier: request.codeVerifier ?? '',
          },
        },
        AUTH_CONFIG.discovery,
      );

      return mapTokenResponseToSession(tokenResponse);
    } catch {
      throw new AuthError('The Azure AD code exchange failed', 'AUTH_LOGIN_FAILED');
    }
  }

  /**
   * Handles the OAuth callback on web after Azure AD redirects back.
   * Exchanges the authorization code directly with Azure AD using PKCE.
   * Azure AD supports cross-origin token redemption when PKCE is used.
   */
  async handleWebCallback(code: string): Promise<AuthSession> {
    const codeVerifier = retrievePKCEVerifier();
    const redirectUri = getRedirectUri();

    if (!codeVerifier) {
      throw new AuthError(
        'PKCE code verifier not found. Please try logging in again.',
        'AUTH_LOGIN_FAILED',
      );
    }

    try {
      // Exchange code directly with Azure AD token endpoint using PKCE
      const tokenEndpoint = AUTH_CONFIG.discovery.tokenEndpoint;
      const body = new URLSearchParams({
        client_id: AUTH_CONFIG.clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        scope: AUTH_CONFIG.scopes.join(' '),
      });

      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });

      const tokenData = await response.json() as {
        access_token?: string;
        id_token?: string;
        refresh_token?: string;
        expires_in?: number;
        error?: string;
        error_description?: string;
      };

      if (!response.ok || tokenData.error) {
        throw new Error(tokenData.error_description ?? tokenData.error ?? 'Token exchange failed');
      }

      if (!tokenData.access_token || !tokenData.id_token || !tokenData.expires_in) {
        throw new Error('Azure AD did not return the required token fields');
      }

      return {
        accessToken: tokenData.access_token,
        idToken: tokenData.id_token,
        refreshToken: tokenData.refresh_token ?? '',
        expiresAt: Date.now() + tokenData.expires_in * 1000,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token exchange failed';
      throw new AuthError(message, 'AUTH_LOGIN_FAILED');
    }
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    try {
      const tokenResponse = await ExpoAuthSession.refreshAsync(
        {
          clientId: AUTH_CONFIG.clientId,
          refreshToken,
        },
        AUTH_CONFIG.discovery,
      );

      return mapTokenResponseToSession(tokenResponse, refreshToken);
    } catch {
      throw new AuthError(
        'The Azure AD refresh token flow failed',
        'AUTH_TOKEN_REFRESH_FAILED',
      );
    }
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }
}
