import { Platform } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Storage } from '@/utils/storage';

export const AUTH_TOKEN_STORAGE_KEY = 'routine_sathy_auth_token_v1';
export const USER_STORAGE_KEY = 'routine_sathy_auth_user_v1';

/**
 * Resolves the appropriate base API URL depending on environment and platform.
 * - If EXPO_PUBLIC_API_URL is set to a live remote backend (https://), always connect to it!
 * - Android Emulator: uses 10.0.2.2 for local development.
 * - iOS Simulator / Web: uses localhost:5001 for local development.
 * - Expo Go on physical device: dynamically resolves Mac's Wi-Fi IP from Constants.expoConfig?.hostUri.
 * - Fallback: live production backend (https://routine-sathy.vercel.app/api).
 */
function getApiBaseUrl(): string {
  // 1. Android Emulator: Android emulator DNS cannot resolve WAN hosts like *.vercel.app reliably.
  // Routing to 10.0.2.2:5001 connects directly to local backend on Mac (which connects directly to MongoDB Atlas).
  if (Platform.OS === 'android' && !Device.isDevice) {
    return 'http://10.0.2.2:5001/api';
  }

  // 2. iOS Simulator: direct localhost
  if (Platform.OS === 'ios' && !Device.isDevice) {
    return 'http://localhost:5001/api';
  }

  // 3. Web: direct localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:5001/api';
  }

  // 4. Physical device via Expo Go: dynamically resolve Mac IP from Metro connection
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5001/api`;
    }
  }

  // 5. Remote / Production cloud fallback (Vercel)
  return process.env.EXPO_PUBLIC_API_URL || 'https://routine-sathy.vercel.app/api';
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
      errorMessage = 'Unable to connect to server. Please check if your backend is running.';
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your internet connection.';
    }

    return Promise.reject(new Error(errorMessage));
  }
);
