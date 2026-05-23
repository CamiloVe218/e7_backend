'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setAuthToken } from '@/lib/api';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const setAuth = useCallback((userData: User, tokenValue: string) => {
    setUser(userData);
    setToken(tokenValue);
    setAuthToken(tokenValue);
    connectSocket(userData.id);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    disconnectSocket();
    // Fire-and-forget — clears the httpOnly cookie server-side
    authApi.logout().catch(() => undefined);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user: userData, token: tokenValue } = await authApi.me();
      setAuth(userData, tokenValue);
    } catch {
      clearAuth();
    }
  }, [setAuth, clearAuth]);

  // On mount: restore session from httpOnly cookie via BFF
  useEffect(() => {
    authApi
      .me()
      .then(({ user: userData, token: tokenValue }) => {
        setAuth(userData, tokenValue);
      })
      .catch(() => {
        // No valid session cookie — user is logged out
      })
      .finally(() => setLoading(false));
  }, [setAuth]);

  const getDashboardPath = (role: string) => {
    if (role === 'CLIENTE') return '/dashboard/client';
    if (role === 'PROVEEDOR') return '/dashboard/provider';
    return '/dashboard/admin';
  };

  const login = async (email: string, password: string) => {
    const { user: userData, token: tokenValue } = await authApi.login(email, password);
    setAuth(userData, tokenValue);
    router.push(getDashboardPath(userData.role));
  };

  const register = async (data: any) => {
    const { user: userData, token: tokenValue } = await authApi.register(data);
    setAuth(userData, tokenValue);
    router.push(getDashboardPath(userData.role));
  };

  const logout = () => {
    clearAuth();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
