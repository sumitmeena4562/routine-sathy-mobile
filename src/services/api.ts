import { Platform } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Storage } from '@/utils/storage';

export const AUTH_TOKEN_STORAGE_KEY = 'routine_sathy_auth_token_v1';
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
    // Android Emulator -> 10.0.2.2 maps to Mac localhost
    if (Platform.OS === 'android' && !Device.isDevice) {
      return 'http://10.0.2.2:5001/api';
    }

    // iOS Simulator & Web -> direct localhost
    if (Platform.OS === 'ios' || Platform.OS === 'web') {
      return 'http://localhost:5001/api';
    }

    // Physical Device via Expo Go -> dynamically resolve Mac's LAN IP from Metro connection
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const hostIp = hostUri.split(':')[0];
      if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
        return `http://${hostIp}:5001/api`;
      }
    }

    return 'http://localhost:5001/api';
  }

  // Default in local dev: use configured URL or cloud backend
  return configuredUrl || cloudBackendUrl;
}

// eslint-disable-next-line import/no-named-as-default-member
export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token automatically if present
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await Storage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Continue without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format error message cleanly
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
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
