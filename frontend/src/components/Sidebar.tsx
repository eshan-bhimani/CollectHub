"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const SIDEBAR_KEY = "collecthub_sidebar_collapsed";

const NAV_ITEMS = [
  {
    href: "/crop",
    label: "Crop",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2v14a2 2 0 0 0 2 2h14" />
        <path d="M18 22V8a2 2 0 0 0-2-2H2" />
      </svg>
    ),
  },
  {
    href: "/auctions",
    label: "Auctions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: "/collection",
    label: "Collection",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    href: "/wants",
    label: "Wants",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/trades",
    label: "Trades",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    href: "/settings/pricing",
    label: "Pricing",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved === "false") setCollapsed(false);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isExpanded = !collapsed || hovered;

  return (
    <aside
      className="fixed left-0 top-14 bottom-0 z-40 flex flex-col border-r border-white/[0.06] bg-[#080e24]/92 backdrop-blur-xl overflow-hidden transition-[width] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
      style={{ width: isExpanded ? 200 : 56 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Nav items */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={!isExpanded ? label : undefined}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
                isActive
                  ? "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r bg-[#C8102E] shadow-[0_0_8px_rgba(200,16,46,0.5)]" />
              )}
              <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {icon}
              </span>
              <span
                className="text-xs font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200"
                style={{
                  maxWidth: collapsed ? 0 : 140,
                  opacity: collapsed ? 0 : 1,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Auth section */}
      {!loading && (
        <div className="px-2 pb-1">
          {user ? (
            <>
              <div
                title={!isExpanded ? user.name : undefined}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/50"
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <span
                  className="text-xs font-medium whitespace-nowrap overflow-hidden truncate transition-[opacity,max-width] duration-200"
                  style={{ maxWidth: isExpanded ? 140 : 0, opacity: isExpanded ? 1 : 0 }}
                >
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={() => { logout(); router.push("/"); }}
                title={!isExpanded ? "Sign out" : undefined}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-all duration-200"
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                <span
                  className="text-xs font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200"
                  style={{ maxWidth: isExpanded ? 140 : 0, opacity: isExpanded ? 1 : 0 }}
                >
                  Sign out
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                title={!isExpanded ? "Log in" : undefined}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-200"
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                </span>
                <span
                  className="text-xs font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200"
                  style={{ maxWidth: isExpanded ? 140 : 0, opacity: isExpanded ? 1 : 0 }}
                >
                  Log in
                </span>
              </Link>
              <Link
                href="/signup"
                title={!isExpanded ? "Sign up" : undefined}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[#C8102E]/80 hover:text-[#C8102E] hover:bg-[#C8102E]/[0.06] transition-all duration-200"
              >
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </span>
                <span
                  className="text-xs font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200"
                  style={{ maxWidth: isExpanded ? 140 : 0, opacity: isExpanded ? 1 : 0 }}
                >
                  Sign up
                </span>
              </Link>
            </>
          )}
        </div>
      )}

      {/* Toggle button */}
      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/30 hover:text-white/55 hover:bg-white/[0.04] transition-all duration-200"
        >
          <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-250"
              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
          </span>
          <span
            className="text-[10px] font-medium uppercase tracking-wider whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200"
            style={{
              maxWidth: isExpanded ? 80 : 0,
              opacity: isExpanded ? 1 : 0,
            }}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
