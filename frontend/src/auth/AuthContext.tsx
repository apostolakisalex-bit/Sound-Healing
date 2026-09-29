import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { api, setAuthToken, getAuthToken } from '@/src/api/client';

export type User = {
  id: string;
  email: string;
  name: string;
  bio?: string;
  location?: string;
  profile_image?: string;
  title: string;
  level: string;
  xp: number;
  stamps: string[];
  unlocked_realms: string[];
  role: string;
  created_at?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, location?: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        setUser(null);
        return;
      }
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      await setAuthToken(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    await setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, location?: string) => {
    const { data } = await api.post('/auth/register', { email, password, name, location });
    await setAuthToken(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* Clear local credentials even when offline. */ }
    await setAuthToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    const { data } = await api.put('/auth/me', patch);
    setUser(data);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

