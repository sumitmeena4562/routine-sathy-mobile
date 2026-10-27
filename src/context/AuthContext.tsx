import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authService } from '@/services/auth';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '@/types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session on app startup
  useEffect(() => {
    async function initAuth() {
      try {
        const savedToken = await authService.getSavedToken();
        const savedUser = await authService.getSavedUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);

          // Verify token validity in background
          try {
            const freshUser = await authService.getCurrentUser();
            setUser(freshUser);
          } catch {
            // Token expired or invalid
            await authService.clearSession();
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const data = await authService.login(credentials);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    return data;
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const data = await authService.register(credentials);
    setToken(data.token);
    setUser({
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    });
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authService.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const freshUser = await authService.getCurrentUser();
      setUser(freshUser);
      return freshUser;
    } catch {
      await logout();
      return null;
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
