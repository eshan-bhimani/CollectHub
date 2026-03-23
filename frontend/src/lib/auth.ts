// ─── Auth Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
}

export type AuthError =
  | "EMAIL_IN_USE"
  | "USER_NOT_FOUND"
  | "WRONG_PASSWORD"
  | "INVALID_INPUT";

// ─── Storage keys ────────────────────────────────────────────────────────────

const USERS_KEY    = "ch_users";
const SESSION_KEY  = "ch_session";

interface StoredUser extends User {
  passwordHash: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Simple deterministic hash — not cryptographic, only for local dev scaffold.
// Replace with a real auth backend before production.
function hashPassword(password: string): string {
  let h = 0;
  for (let i = 0; i < password.length; i++) {
    h = (Math.imul(31, h) + password.charCodeAt(i)) | 0;
  }
  return h.toString(16);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function signUp(
  name: string,
  email: string,
  password: string
): { user: User } | { error: AuthError } {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();

  if (!name.trim() || !normalized || !password) {
    return { error: "INVALID_INPUT" };
  }
  if (users.some((u) => u.email === normalized)) {
    return { error: "EMAIL_IN_USE" };
  }

  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
    passwordHash: hashPassword(password),
  };

  saveUsers([...users, user]);
  const session: User = { id: user.id, name: user.name, email: user.email };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function signIn(
  email: string,
  password: string
): { user: User } | { error: AuthError } {
  const users = getUsers();
  const normalized = email.trim().toLowerCase();
  const found = users.find((u) => u.email === normalized);

  if (!found) return { error: "USER_NOT_FOUND" };
  if (found.passwordHash !== hashPassword(password)) return { error: "WRONG_PASSWORD" };

  const session: User = { id: found.id, name: found.name, email: found.email };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user: session };
}

export function signOut(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
