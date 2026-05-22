"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getSession, getToken, signIn, signOut, signUp, type User, type AuthError } from "@/lib/auth";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login:  (email: string, password: string) => Promise<AuthError | null>;
  register: (name: string, email: string, password: string) => Promise<AuthError | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        signOut();
        return null;
      })
      .then((data) => setUser(data))
      .catch(() => {
        signOut();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthError | null> => {
    const result = await signIn(email, password);
    if ("error" in result) return result.error;
    setUser(result.user);
    return null;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<AuthError | null> => {
      const result = await signUp(name, email, password);
      if ("error" in result) return result.error;
      setUser(result.user);
      return null;
    },
    []
  );

  const logout = useCallback(() => {
    signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
