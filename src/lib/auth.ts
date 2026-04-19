// StockSmart Auth — localStorage-based authentication
// Passwords hashed with SHA-256 via Web Crypto API

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: number;
};

export type SessionUser = Omit<User, 'passwordHash'>;

const KEYS = {
  users: 'stocksmart.users.v1',
  session: 'stocksmart.session.v1',
} as const;

// ---- Crypto helpers ----

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---- Storage helpers ----

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(KEYS.users);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

function setSession(user: SessionUser | null) {
  if (user) {
    localStorage.setItem(KEYS.session, JSON.stringify(user));
  } else {
    localStorage.removeItem(KEYS.session);
  }
  window.dispatchEvent(new CustomEvent('stocksmart:auth', { detail: { user } }));
}

// ---- Public API ----

export function getCurrentUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function signup(
  email: string,
  name: string,
  password: string
): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  if (!trimmedEmail || !trimmedName || !password) {
    return { ok: false, error: 'All fields are required.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const users = getUsers();
  if (users.some(u => u.email === trimmedEmail)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: crypto.randomUUID(),
    email: trimmedEmail,
    name: trimmedName,
    passwordHash,
    createdAt: Date.now(),
  };

  saveUsers([...users, newUser]);

  const sessionUser: SessionUser = {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    createdAt: newUser.createdAt,
  };
  setSession(sessionUser);
  return { ok: true, user: sessionUser };
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; user?: SessionUser; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedEmail || !password) {
    return { ok: false, error: 'Email and password are required.' };
  }

  const users = getUsers();
  const user = users.find(u => u.email === trimmedEmail);
  if (!user) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { ok: false, error: 'Invalid email or password.' };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
  setSession(sessionUser);
  return { ok: true, user: sessionUser };
}

export function logout() {
  setSession(null);
}
