"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { PricingStrategy } from "@/lib/pricingStrategy";
import { BUYER_PREMIUMS } from "@/lib/pricingStrategy";

export default function StrategySummary({ strategy }: { strategy: PricingStrategy }) {
  const [expanded, setExpanded] = useState(false);

  if (!strategy.enabled) return null;

  const thresholdLabel =
    strategy.bidThresholdPercent === 0
      ? "at market average"
      : strategy.bidThresholdPercent > 0
        ? `${strategy.bidThresholdPercent}% above market`
        : `${Math.abs(strategy.bidThresholdPercent)}% below market`;

  return (
    <div className="premium-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/[0.015] transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] flex-shrink-0 animate-pulse" />
          <span className="text-xs text-white/50 truncate">
            <span className="font-bold text-white/70">Strategy:</span>{" "}
            Bid {thresholdLabel} &middot; {strategy.priceSource}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/settings/pricing"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] font-semibold text-[#5b9bff] hover:text-[#7db4ff] transition-colors px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-[#5b9bff]/20"
          >
            Edit
          </Link>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-white/25 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2 border-t border-white/[0.05] pt-3">
              <div className="data-panel rounded-lg p-3 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/30 font-medium">Threshold</span>
                  <span className="text-white/60 font-semibold">{thresholdLabel}</span>
                </div>
                <div className="section-divider" />
                <div className="flex justify-between text-xs">
                  <span className="text-white/30 font-medium">Price Source</span>
                  <span className="text-white/60 font-semibold">{strategy.priceSource}</span>
                </div>
                <div className="section-divider" />
                <div className="flex justify-between text-xs">
                  <span className="text-white/30 font-medium">Premiums included</span>
                  <span className="text-white/60 font-semibold">{Object.keys(BUYER_PREMIUMS).length} platforms</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
