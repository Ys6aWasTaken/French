import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type UserRole = 'teacher' | 'student';

export interface SessionUser {
  username: string;
  role: UserRole;
}

interface AccountRecord {
  password: string;
  role: UserRole;
}

const ACCOUNTS_KEY = 'fm_accounts_registry';
const SESSION_KEY = 'fm_session_user';

function loadAccounts(): Record<string, AccountRecord> {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AccountRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts: Record<string, AccountRecord>) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function loadSessionUsername(): string | null {
  try {
    const u = localStorage.getItem(SESSION_KEY);
    return u && u.length > 0 ? u : null;
  } catch {
    return null;
  }
}

function persistSession(username: string | null) {
  if (username) localStorage.setItem(SESSION_KEY, username);
  else localStorage.removeItem(SESSION_KEY);
}

function seedTeacherAccount() {
  const accounts = loadAccounts();
  if (!accounts.Admin) {
    accounts.Admin = { password: 'admin', role: 'teacher' };
    saveAccounts(accounts);
  }
}

interface AuthContextValue {
  user: SessionUser | null;
  login: (username: string, password: string) => { ok: true } | { ok: false; message: string };
  logout: () => void;
  register: (username: string, password: string) => { ok: true } | { ok: false; message: string };
  isTeacher: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => {
    seedTeacherAccount();
    const u = loadSessionUsername();
    if (!u) return null;
    const accounts = loadAccounts();
    const rec = accounts[u];
    if (!rec) {
      persistSession(null);
      return null;
    }
    return { username: u, role: rec.role };
  });

  useEffect(() => {
    seedTeacherAccount();
  }, []);

  const login = useCallback((username: string, password: string) => {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { ok: false as const, message: 'Enter username and password.' };
    }
    seedTeacherAccount();
    const accounts = loadAccounts();
    const rec = accounts[trimmed];
    if (!rec || rec.password !== password) {
      return { ok: false as const, message: 'Invalid username or password.' };
    }
    persistSession(trimmed);
    setUser({ username: trimmed, role: rec.role });
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    persistSession(null);
    setUser(null);
  }, []);

  const register = useCallback((username: string, password: string) => {
    const trimmed = username.trim();
    if (!trimmed || !password) {
      return { ok: false as const, message: 'Choose a username and password.' };
    }
    if (trimmed.length < 2) {
      return { ok: false as const, message: 'Username must be at least 2 characters.' };
    }
    seedTeacherAccount();
    const accounts = loadAccounts();
    if (accounts[trimmed]) {
      return { ok: false as const, message: 'That username is already taken.' };
    }
    accounts[trimmed] = { password, role: 'student' };
    saveAccounts(accounts);
    persistSession(trimmed);
    setUser({ username: trimmed, role: 'student' });
    return { ok: true as const };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login,
      logout,
      register,
      isTeacher: user?.role === 'teacher',
    }),
    [user, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Stable filesystem-safe id for localStorage keys */
export function userStorageId(username: string): string {
  return encodeURIComponent(username);
}
