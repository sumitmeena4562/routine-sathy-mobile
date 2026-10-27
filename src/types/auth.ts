export interface UserSettings {
  morningReminder?: boolean;
  eveningReminder?: boolean;
  soundEffects?: boolean;
  vibration?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  settings?: UserSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role?: string;
  token: string;
  message?: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  stack?: string;
}
