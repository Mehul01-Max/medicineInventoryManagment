let API_BASE = import.meta.env.VITE_API_URL || '';

// Ensure API_BASE includes protocol in production to avoid relative path resolution
if (API_BASE && !API_BASE.startsWith('http://') && !API_BASE.startsWith('https://')) {
  API_BASE = `https://${API_BASE}`;
}

const TOKEN_KEY = 'stocksmart.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new ApiError(
      (body as { error?: string }).error || `Request failed (${res.status})`,
      res.status
    );

    if (res.status === 401) {
      setToken(null);
      window.dispatchEvent(new CustomEvent('stocksmart:auth', { detail: { user: null } }));
    }

    throw error;
  }

  return res.json();
}
