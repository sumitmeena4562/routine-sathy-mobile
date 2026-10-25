import { Platform } from 'react-native';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Storage } from '@/utils/storage';

export const AUTH_TOKEN_STORAGE_KEY = 'routine_sathy_auth_token_v1';
export const USER_STORAGE_KEY = 'routine_sathy_auth_user_v1';

/**
 * Resolves the appropriate base API URL depending on platform.
 * Android Emulator connects to Mac host machine via 10.0.2.2.
 * iOS Simulator and Web connect via localhost.
 */
function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
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
