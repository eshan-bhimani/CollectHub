"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { href: "/crop",             label: "Crop Tool"  },
  { href: "/auctions",         label: "Auctions"   },
  { href: "/collection",       label: "Collection" },
  { href: "/wants",            label: "Wants"      },
  { href: "/settings/pricing", label: "Pricing"    },
];

export default function NavBar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user, logout, loading } = useAuth();

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 backdrop-blur-md bg-[#001437]/60 border-b border-white/[0.06]">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-14">

        {/* Brand */}
        <Link href="/" className="text-lg font-extrabold tracking-tight flex-shrink-0">
          <span className="text-white">Collect</span>
          <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
            Hub
          </span>
        </Link>

        {/* Nav links + auth */}
        <div className="flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link text-sm font-medium${isActive ? " active" : ""}`}
              >
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <span className="w-px h-4 bg-white/[0.12] flex-shrink-0" />

          {/* Auth section */}
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50 max-w-[120px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-white/45 hover:text-white/80 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="btn-cta px-4 py-1.5 rounded-lg text-sm font-semibold"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
