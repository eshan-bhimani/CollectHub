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
  | "INVALID_INPUT"
  | "SERVER_ERROR";

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = "";

const TOKEN_KEY   = "ch_token";
const SESSION_KEY = "ch_session";

// ─── Storage helpers ──────────────────────────────────────────────────────────

function saveSession(user: User, token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw { status: res.status, detail: data.detail ?? "Unknown error" };
  }
  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function signUp(
  name: string,
  email: string,
  password: string
): Promise<{ user: User } | { error: AuthError }> {
  if (!name.trim() || !email.trim() || !password) return { error: "INVALID_INPUT" };
  try {
    const data = await post<{ access_token: string; user: User }>(
      "/api/auth/register",
      { name, email, password }
    );
    saveSession(data.user, data.access_token);
    return { user: data.user };
  } catch (err: unknown) {
    const e = err as { status?: number };
    if (e.status === 409) return { error: "EMAIL_IN_USE" };
    if (e.status === 422) return { error: "INVALID_INPUT" };
    return { error: "SERVER_ERROR" };
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ user: User } | { error: AuthError }> {
  try {
    const data = await post<{ access_token: string; user: User }>(
      "/api/auth/login",
      { email, password }
    );
    saveSession(data.user, data.access_token);
    return { user: data.user };
  } catch (err: unknown) {
    const e = err as { status?: number };
    if (e.status === 401) return { error: "WRONG_PASSWORD" };
    if (e.status === 404) return { error: "USER_NOT_FOUND" };
    return { error: "SERVER_ERROR" };
  }
}

export function signOut(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}
