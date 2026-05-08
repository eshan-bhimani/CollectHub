"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const NO_SIDEBAR_ROUTES = ["/login", "/signup"];
const SIDEBAR_KEY = "collecthub_sidebar_collapsed";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR_ROUTES.includes(pathname);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!showSidebar) return;
    const sync = () => {
      try {
        const saved = localStorage.getItem(SIDEBAR_KEY);
        setCollapsed(saved !== "false");
      } catch {}
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { subtree: true, attributes: true });

    window.addEventListener("storage", sync);
    window.addEventListener("click", () => setTimeout(sync, 50));

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, [showSidebar]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-[calc(100dvh-56px)]">
      <Sidebar />
      <div
        className="flex-1 transition-[margin] duration-250 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ marginLeft: collapsed ? 56 : 200 }}
      >
        {children}
      </div>
    </div>
  );
}
