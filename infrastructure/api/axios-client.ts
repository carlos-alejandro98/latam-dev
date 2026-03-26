import axios from 'axios';

import type { AuthSession } from '@/domain/entities/auth-session';
import { ENV } from '@/config/environment';

export const axiosClient = axios.create({
  baseURL: ENV.apiBaseUrl,
  timeout: 10000,
});

export const applyAuthSessionToHttpClient = (session: AuthSession): void => {
  axiosClient.defaults.headers.common.Authorization =
    `Bearer ${session.accessToken}`;
};

export const clearAuthSessionFromHttpClient = (): void => {
  delete axiosClient.defaults.headers.common.Authorization;
};
