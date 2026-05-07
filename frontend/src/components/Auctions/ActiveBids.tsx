"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { TrackedBid } from "@/lib/bidTracker";
import type { AuctionListing } from "@/lib/mockAuctionApi";
import SectionLabel from "@/components/Shared/SectionLabel";
import AuctionCardSlab from "./AuctionCardSlab";

function formatTimeLeft(endsAt: string): { text: string; urgent: boolean; ended: boolean } {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Ended", urgent: false, ended: true };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: hours < 2, ended: false };
  return { text: `${minutes}m`, urgent: true, ended: false };
}

function formatCompact(price: number): string {
  return price >= 1000
    ? `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`
    : `$${price.toLocaleString()}`;
}

interface ActiveBidsProps {
  trackedBids: TrackedBid[];
  listings: AuctionListing[];
}

export default function ActiveBids({ trackedBids, listings }: ActiveBidsProps) {
  if (trackedBids.length === 0) return null;

  return (
    <div className="workspace-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Your Active Bids</SectionLabel>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] shadow-[0_0_8px_rgba(200,16,46,0.5)] pill-dot-pulse" style={{ color: "#C8102E" }} />
          <span className="text-[10px] font-medium text-[#C8102E]/60 uppercase tracking-wider">
            {trackedBids.length} active
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {trackedBids.map((bid) => {
            const listing = listings.find((l) => l.id === bid.listingId);
            const currentBid = listing?.currentBid ?? bid.bidAmount;
            const outbid = currentBid > bid.bidAmount;
            const timeLeft = formatTimeLeft(bid.endsAt);

            return (
              <motion.div
                key={bid.listingId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                  outbid
                    ? "border-red-500/20 bg-red-500/[0.06]"
                    : timeLeft.urgent
                      ? "border-amber-500/20 bg-amber-500/[0.04]"
                      : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                {/* Mini slab */}
                <div className="w-10 flex-shrink-0">
                  <AuctionCardSlab
                    player={bid.player}
                    gradingCompany={bid.gradingCompany}
                    grade={bid.grade}
                    imageColor={bid.imageColor}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white/80 truncate">{bid.player}</p>
                    {outbid && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/15 border border-red-500/25 text-red-400 uppercase tracking-wider flex-shrink-0">
                        Outbid
                      </span>
                    )}
                    {!outbid && timeLeft.ended && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 uppercase tracking-wider flex-shrink-0">
                        Won?
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-white/35">
                      Your bid: <span className="font-semibold text-white/50">{formatCompact(bid.bidAmount)}</span>
                    </span>
                    {outbid && (
                      <span className="text-[10px] text-red-400/70">
                        Now: <span className="font-semibold">{formatCompact(currentBid)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Time */}
                <span
                  className={`flex-shrink-0 px-2 py-1 rounded-lg text-[10px] font-bold border ${
                    timeLeft.ended
                      ? "border-white/[0.06] bg-white/[0.03] text-white/30"
                      : timeLeft.urgent
                        ? "border-red-500/25 bg-red-500/10 text-red-400 ending-soon"
                        : "border-white/[0.06] bg-white/[0.03] text-amber-400/70"
                  }`}
                >
                  {timeLeft.text}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
