import { makeRedirectUri } from 'expo-auth-session';

import { ENV } from '@/config/environment';
import { IS_WEB } from '@/config/platform';

type AuthEnvironment = 'dev' | 'intg' | 'prod';

interface AuthEnvironmentConfig {
  clientId: string;
  tenantId: string;
  redirectUriWeb: string;
}

/**
 * Client IDs del registro Azure orientado a app móvil (PKCE + compass://).
 * Deben coincidir con el registro donde está `compass://oauth` como redirect.
 */
const AUTH_MOBILE_CLIENT_BY_ENV: Partial<Record<AuthEnvironment, string>> = {
  dev: 'a0911d9d-a90d-4e7d-8f6c-b3421c93b209',
  intg: 'a0911d9d-a90d-4e7d-8f6c-b3421c93b209',
  prod: 'a0911d9d-a90d-4e7d-8f6c-b3421c93b209',
};

/**
 * Si un entorno no tiene entrada en AUTH_MOBILE_CLIENT_BY_ENV, nativo usa esto
 * — nunca el client web (evita AADSTS50011 en APK prod con solo registro móvil dev).
 */
const AUTH_MOBILE_CLIENT_FALLBACK = 'a0911d9d-a90d-4e7d-8f6c-b3421c93b209';

const AUTH_CONFIG_BY_ENV: Record<AuthEnvironment, AuthEnvironmentConfig> = {
  dev: {
    clientId: '87eecec0-cc69-4add-b7b8-f40b024a1466',
    tenantId: '99d911b9-6dc3-401c-9398-08fc6b377b74',
    redirectUriWeb: 'https://compass.dev.appslatam.com/oauth/',
  },
  intg: {
    clientId: '382fb4dc-9185-43fe-af24-4930c71491fa',
    tenantId: '99d911b9-6dc3-401c-9398-08fc6b377b74',
    redirectUriWeb: 'https://compass.intg.appslatam.com/oauth/',
  },
  prod: {
    clientId: '8915a712-e527-43b0-9dfb-6787a505c07a',
    tenantId: '99d911b9-6dc3-401c-9398-08fc6b377b74',
    redirectUriWeb: 'https://compass.appslatam.com/oauth/',
  },
};

const selectedEnvironmentConfig = AUTH_CONFIG_BY_ENV[ENV.authEnvironment];

/** Client ID de Azure: web usa el registro SPA; nativo solo registro móvil (nunca el SPA). */
export const getAuthClientId = (): string => {
  if (IS_WEB) {
    return selectedEnvironmentConfig.clientId;
  }
  if (ENV.authClientIdMobile) {
    return ENV.authClientIdMobile;
  }
  return (
    AUTH_MOBILE_CLIENT_BY_ENV[ENV.authEnvironment] ?? AUTH_MOBILE_CLIENT_FALLBACK
  );
};

/** Tenant de Azure para endpoints OAuth (mismo que web salvo EXPO_PUBLIC_AUTH_TENANT_ID_MOBILE en nativo). */
export const getAuthTenantId = (): string => {
  if (IS_WEB) {
    return selectedEnvironmentConfig.tenantId;
  }
  return ENV.authTenantIdMobile ?? selectedEnvironmentConfig.tenantId;
};

export const getAuthDiscovery = () => ({
  authorizationEndpoint: `https://login.microsoftonline.com/${getAuthTenantId()}/oauth2/v2.0/authorize`,
  tokenEndpoint: `https://login.microsoftonline.com/${getAuthTenantId()}/oauth2/v2.0/token`,
});

/**
 * En web sobre localhost, Azure debe recibir la misma URI que el navegador (origen + path).
 * Convención alineada con `redirectUriWeb`: barra final (`.../oauth/`).
 */
const getWebLocalhostRedirectUri = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const { hostname, protocol, port } = window.location;
  const isLocal =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]';
  if (!isLocal) {
    return null;
  }
  const path = (ENV.authRedirectPath ?? 'oauth').replace(/^\/+|\/+$/g, '');
  const portSegment =
    port && port !== '80' && port !== '443' ? `:${port}` : '';
  return `${protocol}//${hostname}${portSegment}/${path}/`;
};

/**
 * Redirect nativo: `makeRedirectUri` con `scheme` + `path` y además `native`.
 *
 * En expo-auth-session (~7), `native` solo se usa si `expo-constants` reporta
 * `executionEnvironment` **standalone** o **bare** (APK/IPA, `expo run:*`).
 * Ahí fuerza la URI fija p. ej. `compass://oauth` para Azure.
 *
 * En **Expo Go** (`storeClient`) la librería ignora `native` y sigue devolviendo
 * `exp://<IP>:8081/--/oauth`; para OAuth con Azure hace falta dev build, no Go.
 */
export const getRedirectUri = (): string => {
  if (IS_WEB) {
    const localhostUri = getWebLocalhostRedirectUri();
    if (localhostUri) {
      return localhostUri;
    }
    return selectedEnvironmentConfig.redirectUriWeb;
  }

  const scheme = ENV.authRedirectScheme;
  const path = ENV.authRedirectPath;
  const nativeRedirectUri = `${scheme}://${path}`;

  return makeRedirectUri({
    scheme,
    path,
    native: nativeRedirectUri,
  });
};

export const AUTH_CONFIG = {
  environment: ENV.authEnvironment,
  /** Registro web (SPA). En nativo usar getAuthClientId(). */
  clientId: selectedEnvironmentConfig.clientId,
  tenantId: selectedEnvironmentConfig.tenantId,
  redirectUriWeb: selectedEnvironmentConfig.redirectUriWeb,
  // 'https://graph.microsoft.com/User.Read' ensures the access_token
  // audience is graph.microsoft.com so we can call the Graph photo endpoint.
  scopes: ['openid', 'profile', 'offline_access', 'https://graph.microsoft.com/User.Read'] as const,
  /** Solo referencia web; en runtime usar getAuthDiscovery(). */
  discovery: {
    authorizationEndpoint: `https://login.microsoftonline.com/${selectedEnvironmentConfig.tenantId}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${selectedEnvironmentConfig.tenantId}/oauth2/v2.0/token`,
  },
};
