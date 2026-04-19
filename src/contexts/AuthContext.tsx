import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  getCurrentUser,
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  type SessionUser,
} from '@/lib/auth';

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (email: string, name: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  // Listen for auth changes (e.g. logout in another tab)
  useEffect(() => {
    const onAuth = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setUser(detail?.user ?? null);
    };
    const onStorage = () => setUser(getCurrentUser());
    window.addEventListener('stocksmart:auth', onAuth);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('stocksmart:auth', onAuth);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authLogin(email, password);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    setUser(result.user);
    return { ok: true };
  }, []);

  const signup = useCallback(async (email: string, name: string, password: string) => {
    const result = await authSignup(email, name, password);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    setUser(result.user);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
