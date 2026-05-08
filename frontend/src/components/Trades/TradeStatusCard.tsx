"use client";

import type { TradeProposal, TradeStatus } from "@/lib/tradeTypes";
import AuctionCardSlab from "@/components/Auctions/AuctionCardSlab";
import { getImageColor } from "@/lib/mockTradeUsers";

function formatCompact(price: number): string {
  return price >= 1000
    ? `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`
    : `$${price.toLocaleString()}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const statusStyles: Record<TradeStatus, { border: string; bg: string; text: string; label: string }> = {
  proposed: { border: "border-amber-500/20", bg: "bg-amber-500/[0.04]", text: "text-amber-400", label: "Proposed" },
  incoming: { border: "border-[#5b9bff]/20", bg: "bg-[#5b9bff]/[0.04]", text: "text-[#5b9bff]", label: "Incoming" },
  accepted: { border: "border-emerald-500/20", bg: "bg-emerald-500/[0.06]", text: "text-emerald-400", label: "Accepted" },
  declined: { border: "border-red-500/20", bg: "bg-red-500/[0.06]", text: "text-red-400", label: "Declined" },
};

interface TradeStatusCardProps {
  trade: TradeProposal;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export default function TradeStatusCard({
  trade,
  onAccept,
  onDecline,
  onCancel,
}: TradeStatusCardProps) {
  const style = statusStyles[trade.status];
  const isIncoming = trade.status === "incoming";
  const isProposed = trade.status === "proposed";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${style.border} ${style.bg}`}
    >
      {/* Mini slab */}
      <div className="w-10 flex-shrink-0">
        <AuctionCardSlab
          player={trade.theirCard.playerName}
          gradingCompany={trade.theirCard.condition.gradingCompany}
          grade={trade.theirCard.condition.grade ?? 0}
          imageColor={getImageColor(trade.theirCard.playerName)}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-white/80 truncate">
            {trade.theirCard.playerName}
          </p>
          <span
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider flex-shrink-0 ${style.text} ${
              trade.status === "accepted"
                ? "bg-emerald-500/15 border border-emerald-500/25"
                : trade.status === "declined"
                  ? "bg-red-500/15 border border-red-500/25"
                  : trade.status === "incoming"
                    ? "bg-[#5b9bff]/15 border border-[#5b9bff]/25"
                    : "bg-amber-500/15 border border-amber-500/25"
            }`}
          >
            {style.label}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-[10px] text-white/35">
            {isIncoming ? "From" : "To"}:{" "}
            <span className="font-semibold text-white/50">
              {trade.theirUser.name}
            </span>
          </span>
          <span className="text-[10px] text-white/20">
            {timeAgo(trade.createdAt)}
          </span>
        </div>
        {trade.myOfferedCards.length > 0 && (
          <p className="text-[10px] text-white/25 mt-0.5 truncate">
            Offering: {trade.myOfferedCards.map((c) => c.playerName).join(", ")}
            {trade.cashOffer > 0 ? ` + ${formatCompact(trade.cashOffer)}` : ""}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1.5">
        {isIncoming && (
          <>
            <button
              onClick={() => onAccept?.(trade.id)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => onDecline?.(trade.id)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
            >
              Decline
            </button>
          </>
        )}
        {isProposed && (
          <button
            onClick={() => onCancel?.(trade.id)}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
