import { makeRedirectUri } from 'expo-auth-session';

import { ENV } from '@/config/environment';
import { IS_WEB } from '@/config/platform';

type AuthEnvironment = 'dev' | 'intg' | 'prod';

interface AuthEnvironmentConfig {
  clientId: string;
  tenantId: string;
  redirectUriWeb: string;
}

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

/**
 * Gets the redirect URI for the current environment.
 * For web, uses the configured web redirect URI from the environment config.
 * For native, uses expo-auth-session's makeRedirectUri with the app scheme.
 */
export const getRedirectUri = (): string => {
  if (IS_WEB) {
    return selectedEnvironmentConfig.redirectUriWeb;
  }

  return makeRedirectUri({
    scheme: ENV.authRedirectScheme,
    path: ENV.authRedirectPath,
  });
};

export const AUTH_CONFIG = {
  environment: ENV.authEnvironment,
  clientId: selectedEnvironmentConfig.clientId,
  tenantId: selectedEnvironmentConfig.tenantId,
  redirectUriWeb: selectedEnvironmentConfig.redirectUriWeb,
  // 'https://graph.microsoft.com/User.Read' ensures the access_token
  // audience is graph.microsoft.com so we can call the Graph photo endpoint.
  scopes: ['openid', 'profile', 'offline_access', 'https://graph.microsoft.com/User.Read'] as const,
  discovery: {
    authorizationEndpoint: `https://login.microsoftonline.com/${selectedEnvironmentConfig.tenantId}/oauth2/v2.0/authorize`,
    tokenEndpoint: `https://login.microsoftonline.com/${selectedEnvironmentConfig.tenantId}/oauth2/v2.0/token`,
  },
};
