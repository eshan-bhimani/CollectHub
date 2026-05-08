"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { TradeProposal, TradeStatus } from "@/lib/tradeTypes";
import SectionLabel from "@/components/Shared/SectionLabel";
import TradeStatusCard from "./TradeStatusCard";

const TABS: { value: TradeStatus; label: string }[] = [
  { value: "proposed", label: "Proposed" },
  { value: "incoming", label: "Incoming" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

interface TradeStatusBoardProps {
  trades: TradeProposal[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
}

export default function TradeStatusBoard({
  trades,
  onAccept,
  onDecline,
  onCancel,
}: TradeStatusBoardProps) {
  const [activeTab, setActiveTab] = useState<TradeStatus>("proposed");
  const filteredTrades = trades.filter((t) => t.status === activeTab);

  return (
    <div className="workspace-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Trade Status</SectionLabel>
        <span className="text-[10px] font-medium text-white/25 uppercase tracking-wider">
          {trades.length} total
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
        {TABS.map((tab) => {
          const count = trades.filter((t) => t.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.value
                  ? "bg-white/12 text-white shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10"
                  : "text-white/35 hover:text-white/55 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 text-[9px] opacity-60">({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-2 min-h-[60px]">
        <AnimatePresence mode="wait">
          {filteredTrades.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center"
            >
              <p className="text-xs text-white/25">
                No {activeTab} trades
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              {filteredTrades.map((trade) => (
                <TradeStatusCard
                  key={trade.id}
                  trade={trade}
                  onAccept={onAccept}
                  onDecline={onDecline}
                  onCancel={onCancel}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
