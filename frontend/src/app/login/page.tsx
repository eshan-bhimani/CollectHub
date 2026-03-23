"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import type { AuthError } from "@/lib/auth";

const ERROR_MESSAGES: Record<AuthError, string> = {
  USER_NOT_FOUND: "No account found with that email.",
  WRONG_PASSWORD:  "Incorrect password. Please try again.",
  EMAIL_IN_USE:    "That email is already registered.",
  INVALID_INPUT:   "Please fill in all fields.",
};

export default function LoginPage() {
  const router      = useRouter();
  const { login }   = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<AuthError | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    router.push("/");
  }

  return (
    <div className="min-h-[calc(100dvh-56px)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="glass-hero rounded-2xl px-8 py-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-xl font-extrabold tracking-tight mb-6">
              <span className="text-white">Collect</span>
              <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
                Hub
              </span>
            </Link>
            <h1 className="text-lg font-semibold text-white/90">Welcome back</h1>
            <p className="text-sm text-white/45 mt-1">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bid-input rounded-lg px-3.5 py-2.5 text-sm placeholder:text-white/20 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bid-input rounded-lg px-3.5 py-2.5 text-sm placeholder:text-white/20 focus:outline-none"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#e8354a] bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-lg px-3 py-2"
              >
                {ERROR_MESSAGES[error]}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-cta w-full py-2.5 rounded-xl text-sm font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-white/35 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-white/70 hover:text-white transition-colors font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
