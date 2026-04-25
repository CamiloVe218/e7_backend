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
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
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
    localStorage.setItem('token', tokenValue);
    Cookies.set('auth_token', tokenValue, { expires: 7 });
    connectSocket(userData.id);
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    Cookies.remove('auth_token');
    disconnectSocket();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      authApi
        .me()
        .then((userData) => {
          setUser(userData);
          connectSocket(userData.id);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [clearAuth]);

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
