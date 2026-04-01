/**
 * Centralized environment configuration.
 * Fails fast if required variables are missing.
 */

interface EnvironmentConfig {
  apiBaseUrl: string;
  flightsApiBaseUrl: string;
  /** URL WebSocket para actualizaciones en tiempo real de vuelos. Vacío = desactivado. */
  flightsWsUrl: string;
  environment: 'development' | 'production';
  authEnvironment: 'dev' | 'intg' | 'prod';
  authRedirectScheme: string;
  authRedirectPath: string;
  /** Opcional: client ID del registro Azure "mobile" (sobrescribe el mapa por entorno en nativo). */
  authClientIdMobile: string | undefined;
  /** Opcional: tenant distinto solo para OAuth nativo (por defecto el mismo que web). */
  authTenantIdMobile: string | undefined;
  enableLogs: boolean;
  /** Intervalo de polling para la gantt en milisegundos. 0 = desactivado explícitamente. */
  ganttPollingIntervalMs: number;
}

const resolveAuthEnvironment = (): EnvironmentConfig['authEnvironment'] => {
  const configuredAuthEnvironment = process.env.EXPO_PUBLIC_AUTH_ENV as
    | EnvironmentConfig['authEnvironment']
    | undefined;

  if (
    configuredAuthEnvironment === 'dev' ||
    configuredAuthEnvironment === 'intg' ||
    configuredAuthEnvironment === 'prod'
  ) {
    return configuredAuthEnvironment;
  }

  return process.env.EXPO_PUBLIC_ENV === 'production' ? 'prod' : 'dev';
};

export const ENV: EnvironmentConfig = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,
  flightsApiBaseUrl: (process.env.EXPO_PUBLIC_FLIGHTS_API_BASE_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL) as string,
  flightsWsUrl: process.env.EXPO_PUBLIC_FLIGHTS_WS_URL ?? '',
  environment: process.env.EXPO_PUBLIC_ENV as EnvironmentConfig['environment'],
  authEnvironment: resolveAuthEnvironment(),
  authRedirectScheme: process.env.EXPO_PUBLIC_AUTH_REDIRECT_SCHEME ?? 'compass',
  authRedirectPath: process.env.EXPO_PUBLIC_AUTH_REDIRECT_PATH ?? 'oauth',
  authClientIdMobile:
    process.env.EXPO_PUBLIC_AUTH_CLIENT_ID_MOBILE?.trim() || undefined,
  authTenantIdMobile:
    process.env.EXPO_PUBLIC_AUTH_TENANT_ID_MOBILE?.trim() || undefined,
  enableLogs: process.env.EXPO_PUBLIC_ENABLE_LOGS === 'true',
  ganttPollingIntervalMs: parseInt(
    process.env.EXPO_PUBLIC_GANTT_POLLING_INTERVAL_MS ?? '5000',
    10,
  ),
};

if (!ENV.apiBaseUrl) {
  throw new Error('EXPO_PUBLIC_API_BASE_URL is required');
}

if (!ENV.flightsApiBaseUrl) {
  throw new Error('EXPO_PUBLIC_FLIGHTS_API_BASE_URL is required');
}
