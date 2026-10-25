import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '@/types/auth';
import { Storage } from '@/utils/storage';
import { api, AUTH_TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './api';

export const authService = {
  /**
   * Register a new user with name, email and password.
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    if (response.data.token) {
      await authService.saveSession(response.data);
    }
    return response.data;
  },

  /**
   * Login an existing user with email and password.
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      await authService.saveSession(response.data);
    }
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile.
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    await Storage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Persist auth token and user profile securely.
   */
  async saveSession(auth: AuthResponse): Promise<void> {
    if (auth.token) {
      await Storage.setItem(AUTH_TOKEN_STORAGE_KEY, auth.token);
    }
    const userProfile: User = {
      _id: auth._id,
      name: auth.name,
      email: auth.email,
      role: auth.role,
    };
    await Storage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));
  },

  /**
   * Clear session on logout.
   */
  async clearSession(): Promise<void> {
    await Storage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    await Storage.removeItem(USER_STORAGE_KEY);
  },

  /**
   * Retrieve saved JWT token.
   */
  async getSavedToken(): Promise<string | null> {
    return await Storage.getItem(AUTH_TOKEN_STORAGE_KEY);
  },

  /**
   * Retrieve saved user object from storage.
   */
  async getSavedUser(): Promise<User | null> {
    const raw = await Storage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },
};
