"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BidNotification } from "@/lib/bidTracker";

const typeConfig: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  outbid: { icon: "!", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  "time-warning": { icon: "⏱", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  "ending-now": { icon: "🔥", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  won: { icon: "✓", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface BidNotificationsProps {
  notifications: BidNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClear: () => void;
}

export default function BidNotifications({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClear,
}: BidNotificationsProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/[0.14] transition-all duration-200"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C8102E] text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(200,16,46,0.5)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-white/[0.12] bg-[#04122f]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-50"
          >
            {/* Header */}
            <div className="sticky top-0 px-4 py-3 border-b border-white/[0.06] bg-[#04122f]/95 backdrop-blur-xl flex items-center justify-between">
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Notifications</span>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[10px] text-[#5b9bff] hover:text-[#7db4ff] font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={onClear}
                    className="text-[10px] text-white/25 hover:text-white/50 font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Items */}
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-white/25">No notifications yet</p>
                <p className="text-[10px] text-white/15 mt-1">Place a bid to start tracking</p>
              </div>
            ) : (
              <div className="py-1">
                {notifications.slice(0, 20).map((notif) => {
                  const config = typeConfig[notif.type] ?? typeConfig.outbid;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => onMarkRead(notif.id)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors ${
                        notif.read ? "opacity-50" : ""
                      }`}
                    >
                      <span className={`flex-shrink-0 w-7 h-7 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center text-xs mt-0.5`}>
                        {config.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-white/70 leading-snug">{notif.message}</p>
                        <p className="text-[10px] text-white/20 mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#C8102E] flex-shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
