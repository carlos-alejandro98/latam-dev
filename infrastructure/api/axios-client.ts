import axios from 'axios';

import type { AuthSession } from '@/domain/entities/auth-session';
import { ENV } from '@/config/environment';
import { FlightsHttpClient } from '@/infrastructure/http/flights-http-client';

export const axiosClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 10000,
});

export const applyAuthSessionToHttpClient = (session: AuthSession): void => {
  const bearer = `Bearer ${session.accessToken}`;
  axiosClient.defaults.headers.common.Authorization = bearer;
  FlightsHttpClient.defaults.headers.common.Authorization = bearer;
};

export const clearAuthSessionFromHttpClient = (): void => {
  delete axiosClient.defaults.headers.common.Authorization;
  delete FlightsHttpClient.defaults.headers.common.Authorization;
};
