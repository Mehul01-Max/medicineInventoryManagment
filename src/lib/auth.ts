import { apiFetch, getToken, setToken } from './api';

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  createdAt: number;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const { user } = await apiFetch<{ user: SessionUser }>('/api/auth/me');
    return user;
  } catch {
    return null;
  }
}

export async function signup(
  email: string,
  name: string,
  password: string
): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
  try {
    const { token, user } = await apiFetch<{ token: string; user: SessionUser }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password }),
    });
    setToken(token);
    return { ok: true, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Signup failed';
    return { ok: false, error: message };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
  try {
    const { token, user } = await apiFetch<{ token: string; user: SessionUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(token);
    return { ok: true, user };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return { ok: false, error: message };
  }
}

export function logout() {
  setToken(null);
  window.dispatchEvent(new CustomEvent('stocksmart:auth', { detail: { user: null } }));
}
