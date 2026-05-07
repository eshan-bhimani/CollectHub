"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AuctionListing, BidResponse } from "@/lib/mockAuctionApi";
import { placeBid } from "@/lib/mockAuctionApi";
import type { PricingStrategy } from "@/lib/pricingStrategy";
import { evaluateBid, getBadgeLevel } from "@/lib/pricingStrategy";
import type { WantListItem } from "@/lib/collectionTypes";
import AuctionCardSlab from "./AuctionCardSlab";
import BidBadge from "./BidBadge";
import WantMatchBadge from "./WantMatchBadge";

function formatTimeLeft(endsAt: string): { text: string; urgent: boolean } {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Ended", urgent: false };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: hours < 2 };
  return { text: `${minutes}m`, urgent: true };
}

function formatCompact(price: number): string {
  return price >= 1000
    ? `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`
    : `$${price.toLocaleString()}`;
}

interface AuctionCardProps {
  listing: AuctionListing;
  strategy: PricingStrategy;
  onBidPlaced: (id: string, response: BidResponse) => void;
  wantMatches: WantListItem[];
}

export default function AuctionCard({
  listing,
  strategy,
  onBidPlaced,
  wantMatches,
}: AuctionCardProps) {
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidMessage, setBidMessage] = useState<{ text: string; success: boolean } | null>(null);
  const timeLeft = formatTimeLeft(listing.endsAt);

  const handleBid = useCallback(async () => {
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) return;
    setIsBidding(true);
    setBidMessage(null);
    const response = await placeBid(listing.id, amount);
    setBidMessage({ text: response.message, success: response.success });
    if (response.success) {
      onBidPlaced(listing.id, response);
      setBidAmount("");
    }
    setIsBidding(false);
    setTimeout(() => setBidMessage(null), 4000);
  }, [bidAmount, listing.id, onBidPlaced]);

  const minBid = listing.currentBid + Math.ceil(listing.currentBid * 0.05);

  const evaluation = strategy.enabled
    ? evaluateBid(listing.currentBid, listing.marketAvgPrice, listing.auctionHouse, strategy)
    : null;

  const level = evaluation
    ? getBadgeLevel(evaluation.percentageFromAvg, strategy.bidThresholdPercent)
    : null;

  const accent = level === "good" ? "good" : level === "near-limit" ? "warn" : level === "over-budget" ? "danger" : undefined;

  return (
    <div
      className="premium-card rounded-2xl overflow-hidden"
      data-accent={accent}
    >
      <div className="p-4 sm:p-5 flex gap-4">
        {/* Slab preview */}
        <div className="w-[100px] sm:w-[120px] flex-shrink-0">
          <AuctionCardSlab
            player={listing.player}
            gradingCompany={listing.gradingCompany}
            grade={listing.grade}
            imageColor={listing.imageColor}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white/90 truncate">{listing.player}</h3>
              <p className="text-[11px] text-white/35 truncate mt-0.5">
                {listing.year} {listing.set} {listing.cardNumber}
              </p>
            </div>
            <span
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                timeLeft.urgent
                  ? "border-red-500/30 bg-red-500/15 text-red-400 ending-soon"
                  : "border-white/[0.08] bg-white/[0.04] text-amber-400/80"
              }`}
            >
              {timeLeft.text}
            </span>
          </div>

          {/* Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <BidBadge listing={listing} strategy={strategy} />
            {wantMatches.map((match) => (
              <WantMatchBadge key={match.id} item={match} />
            ))}
          </div>

          {/* Price grid panel */}
          <div className="mt-3 data-panel rounded-xl p-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Bid</p>
                <p className="text-xs sm:text-sm font-bold text-emerald-400 stat-value-glow-emerald">{formatCompact(listing.currentBid)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Market</p>
                <p className="text-xs sm:text-sm font-bold text-white/55">{formatCompact(listing.marketAvgPrice)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">
                  {evaluation ? "Cost" : "Est."}
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/55">
                  {evaluation ? formatCompact(evaluation.trueCost) : formatCompact(listing.estimatedValue)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Bids</p>
                <p className="text-xs sm:text-sm font-bold text-white/55">{listing.bidCount}</p>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] font-medium">
              {listing.auctionHouse}
            </span>
            <span className="text-[10px] text-white/20 font-medium">{listing.team}</span>
            {evaluation && (
              <span className="text-[10px] text-white/15 ml-auto font-medium">
                Max: {formatCompact(evaluation.maxBid)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bid input bar */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 flex gap-2">
        <input
          type="number"
          placeholder={`Min $${minBid.toLocaleString()}`}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="bid-input flex-1 px-3 py-2.5 rounded-xl text-xs"
          min={minBid}
        />
        <button
          onClick={handleBid}
          disabled={isBidding || !bidAmount}
          className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
            isBidding || !bidAmount
              ? "bg-white/[0.03] text-white/15 cursor-not-allowed border border-white/[0.05]"
              : "btn-cta active:scale-[0.95]"
          }`}
        >
          {isBidding ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full spinner" />
          ) : (
            "Bid"
          )}
        </button>
      </div>

      {/* Bid feedback */}
      <AnimatePresence>
        {bidMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p
              className={`text-[11px] px-5 pb-4 font-medium ${
                bidMessage.success ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {bidMessage.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
