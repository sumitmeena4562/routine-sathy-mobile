import { Platform } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Storage } from '@/utils/storage';

export const AUTH_TOKEN_STORAGE_KEY = 'routine_sathy_auth_token_v1';
export const REFRESH_TOKEN_STORAGE_KEY = 'routine_sathy_refresh_token_v1';
export const USER_STORAGE_KEY = 'routine_sathy_auth_user_v1';

/**
 * Resolves the appropriate base API URL depending on environment and platform.
 * 
 * 1. STANDALONE PRODUCTION APK & RELEASE BUILDS (!__DEV__):
 *    ALWAYS connects directly to the live secure cloud backend (HTTPS) on Vercel.
 *    Never attempts to reach 10.0.2.2 or localhost in production, eliminating
 *    Android cleartext HTTP blocking and network connection errors permanently.
 * 
 * 2. LOCAL DEVELOPMENT (__DEV__ === true):
 *    - If EXPO_PUBLIC_USE_LOCAL is set or URL contains localhost, routes to local backend (port 5001).
 *      - Android Emulator: http://10.0.2.2:5001/api
 *      - iOS Simulator / Web: http://localhost:5001/api
 *      - Physical Device via Expo Go: dynamic Mac IP from hostUri
 *    - Otherwise, default to live production backend so local dev works seamlessly even without running local server!
 */
function getApiBaseUrl(): string {
  const cloudBackendUrl = 'https://routine-sathy.vercel.app/api';
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

  // 1. Release / Standalone APK builds: Guaranteed live cloud backend (HTTPS)
  if (!__DEV__) {
    return configuredUrl && configuredUrl.startsWith('https://')
      ? configuredUrl
      : cloudBackendUrl;
  }

  // 2. Local Development (__DEV__ === true):
  // Check if developer wants local backend on port 5001
  const wantsLocal =
    process.env.EXPO_PUBLIC_USE_LOCAL === 'true' ||
    (configuredUrl && (configuredUrl.includes('localhost') || configuredUrl.includes('127.0.0.1') || configuredUrl.includes('10.0.2.2')));

  if (wantsLocal) {
    // 1. Dynamic Mac IP from Metro connection (works for physical devices AND emulators)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return `http://${hostIp}:5001/api`;
      }
    }

    // 2. Explicit Local IP from .env
    if (process.env.EXPO_PUBLIC_LOCAL_IP) {
      return `http://${process.env.EXPO_PUBLIC_LOCAL_IP}:5001/api`;
    }

    // 3. Android Emulator fallback
    if (Platform.OS === 'android' && !Device.isDevice) {
      return 'http://10.0.2.2:5001/api';
    }

    // 4. iOS Simulator & Web -> direct localhost
    return 'http://localhost:5001/api';
  }

  // Default in local dev: use configured URL or cloud backend
  return configuredUrl || cloudBackendUrl;
}

const resolvedBaseUrl = getApiBaseUrl();
if (__DEV__) {
  console.log(`🌐 [API INIT] Base URL resolved to: ${resolvedBaseUrl}`);
}

// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 25000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically if present & log request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    (config as any)._requestStartTime = Date.now();

    try {
      const token = await Storage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Continue without token
    }

    if (__DEV__) {
      const method = (config.method || 'GET').toUpperCase();
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      console.log(`\n🌐 [API REQ] ${method} ${fullUrl}`);
      if (config.params) {
        console.log(`   Query:`, JSON.stringify(config.params));
      }
      if (config.data) {
        let loggedData = config.data;
        if (typeof loggedData === 'string') {
          try {
            const parsed = JSON.parse(loggedData);
            if (parsed && typeof parsed === 'object' && 'password' in parsed) {
              loggedData = { ...parsed, password: '••••••••' };
            }
          } catch {
            // Keep original
          }
        } else if (typeof loggedData === 'object' && loggedData !== null && 'password' in loggedData) {
          loggedData = { ...loggedData, password: '••••••••' };
        }
        console.log(`   Payload:`, typeof loggedData === 'object' ? JSON.stringify(loggedData, null, 2) : loggedData);
      }
    }

    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ [API REQ ERROR]', error);
    }
    return Promise.reject(error);
  }
);

interface FailedRequestQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequestQueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Format error message cleanly & log response
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      const startTime = (response.config as any)?._requestStartTime;
      const duration = startTime ? `${Date.now() - startTime}ms` : '';
      const method = (response.config.method || 'GET').toUpperCase();
      const url = response.config.url || '';
      console.log(`✅ [API RES] ${response.status} ${method} ${url} (${duration})`);
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log(`   Data: [Array with ${response.data.length} items]`);
        } else if (typeof response.data === 'object' && response.data !== null) {
          const json = JSON.stringify(response.data);
          if (json.length > 500) {
            console.log(`   Data: ${json.slice(0, 500)}... (truncated)`);
          } else {
            console.log(`   Data:`, json);
          }
        } else {
          console.log(`   Data:`, response.data);
        }
      }
    }
    return response;
  },
  async (error: AxiosError<{ message?: string }>) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number }) | undefined;
    const isAuthRoute =
      config?.url?.includes('/auth/login') ||
      config?.url?.includes('/auth/register') ||
      config?.url?.includes('/auth/refresh');

    // 1. Auto-refresh access token on 401 Unauthorized
    if (error.response?.status === 401 && !isAuthRoute && config && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (config.headers) {
              config.headers.Authorization = `Bearer ${token}`;
            }
            return api(config);
          })
          .catch((err) => Promise.reject(err));
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const savedRefreshToken = await Storage.getItem(REFRESH_TOKEN_STORAGE_KEY);
        if (!savedRefreshToken) {
          throw new Error('No refresh token stored');
        }

        if (__DEV__) {
          console.log('🔄 [API AUTH] Access token expired, requesting new token with refreshToken...');
        }

        const refreshRes = await axios.post<{ success: boolean; token: string; refreshToken?: string }>(
          `${resolvedBaseUrl}/auth/refresh`,
          { refreshToken: savedRefreshToken },
          { headers: { 'Content-Type': 'application/json' }, timeout: 15000 }
        );

        const newToken = refreshRes.data.token;
        const newRefreshToken = refreshRes.data.refreshToken;

        await Storage.setItem(AUTH_TOKEN_STORAGE_KEY, newToken);
        if (newRefreshToken) {
          await Storage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
        }

        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }

        if (__DEV__) {
          console.log('✅ [API AUTH] Access token refreshed successfully, replaying queued requests');
        }

        processQueue(null, newToken);
        return api(config);
      } catch (refreshErr) {
        if (__DEV__) {
          console.warn('❌ [API AUTH] Refresh token exchange failed, clearing session:', refreshErr);
        }
        processQueue(refreshErr, null);
        await Storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        await Storage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        await Storage.removeItem(USER_STORAGE_KEY);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // 2. Auto-retry once for idempotent GET/HEAD requests on transient network drops or timeouts
    if (
      config &&
      (!config._retryCount || config._retryCount < 1) &&
      (config.method?.toUpperCase() === 'GET' || config.method?.toUpperCase() === 'HEAD') &&
      (error.message === 'Network Error' || error.code === 'ECONNABORTED' || error.message.includes('timeout'))
    ) {
      config._retryCount = (config._retryCount || 0) + 1;
      if (__DEV__) {
        console.warn(`🔄 [API RETRY] Retrying ${config.method?.toUpperCase()} ${config.url} after transient network drop...`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      return api(config);
    }

    if (__DEV__) {
      const method = (error.config?.method || 'GET').toUpperCase();
      const url = error.config?.url || '';
      const status = error.response?.status || 'ERR';
      const isClientError = typeof status === 'number' && status >= 400 && status < 500;

      // Use console.warn for expected 4xx client responses (e.g. 401 wrong password)
      // so Expo LogBox full-screen modal doesn't disrupt user testing
      const logger = isClientError ? console.warn : console.error;
      logger(`⚠️ [API ERR] ${status} ${method} ${url}`);
      logger(`   Message:`, error.message);
      if (error.response?.data) {
        logger(`   Error Data:`, JSON.stringify(error.response.data, null, 2));
      }
    }

    let errorMessage = 'An unexpected error occurred. Please try again.';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message === 'Network Error') {
      errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your internet connection.';
    }

    return Promise.reject(new Error(errorMessage));
  }
);
