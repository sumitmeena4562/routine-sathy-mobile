import { Platform } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Storage } from '@/utils/storage';

export const AUTH_TOKEN_STORAGE_KEY = 'routine_sathy_auth_token_v1';
export const USER_STORAGE_KEY = 'routine_sathy_auth_user_v1';

/**
 * Resolves the appropriate base API URL depending on environment and platform.
 * - Explicit EXPO_PUBLIC_API_URL takes highest priority.
 * - Expo Go on a physical phone: dynamically resolves dev machine's Wi-Fi IP from Constants.expoConfig?.hostUri.
 * - Physical device fallback: uses local network LAN IP (192.168.2.21).
 * - Android Emulator: uses 10.0.2.2.
 * - iOS Simulator / Web: uses localhost.
 */
function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Dynamically extract computer IP from Expo Metro connection (e.g., 192.168.2.21:8081 -> 192.168.2.21)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:5001/api`;
    }
  }

  // Real physical mobile phone fallback (connected on same Wi-Fi as Mac)
  if (Device.isDevice) {
    return 'http://192.168.2.21:5001/api';
  }

  // Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001/api';
  }

  // iOS Simulator / Web
  return 'http://localhost:5001/api';
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
