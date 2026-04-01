import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { container } from '@/dependencyInjection/container';
import {
  applyAuthSessionToHttpClient,
  axiosClient,
  clearAuthSessionFromHttpClient,
} from '@/infrastructure/api/axios-client';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let isRegistered = false;

export const setupAuthInterceptor = (): void => {
  if (isRegistered) {
    return;
  }

  axiosClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetryableRequestConfig | undefined;

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const newSession = await container.refreshTokenUseCase.execute();

            applyAuthSessionToHttpClient(newSession);
          } finally {
            isRefreshing = false;
          }
        }

        return axiosClient(originalRequest);
      }

      if (error.response?.status === 401) {
        clearAuthSessionFromHttpClient();
      }

      return Promise.reject(error);
    },
  );

  isRegistered = true;
};
