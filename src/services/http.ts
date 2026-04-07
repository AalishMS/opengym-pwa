import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/lib/env";
import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from "@/services/auth-storage";

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshResponse = {
  access_token?: string;
  refresh_token?: string;
  accessToken?: string;
  refreshToken?: string;
};

const apiBaseUrl = env.apiUrl;

export const http = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

function getTokenPair(payload: RefreshResponse) {
  const accessToken = payload.access_token ?? payload.accessToken;
  const refreshToken = payload.refresh_token ?? payload.refreshToken;

  if (!accessToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthTokens();
        return null;
      }

      try {
        const response = await axios.post<RefreshResponse>(
          `${apiBaseUrl}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const parsed = getTokenPair(response.data);

        if (!parsed) {
          clearAuthTokens();
          return null;
        }

        setAuthTokens({
          accessToken: parsed.accessToken,
          refreshToken: parsed.refreshToken ?? refreshToken,
        });
        return parsed.accessToken;
      } catch {
        clearAuthTokens();
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

http.interceptors.request.use((config) => {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshedAccessToken = await refreshAccessToken();

    if (!refreshedAccessToken) {
      return Promise.reject(error);
    }

    if (!originalRequest.headers) {
      originalRequest.headers = new AxiosHeaders();
    }

    originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;

    return http(originalRequest);
  },
);
