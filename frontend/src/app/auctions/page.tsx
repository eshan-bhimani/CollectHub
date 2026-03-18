"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  fetchAuctionListings,
  placeBid,
  type AuctionListing,
  type BidResponse,
} from "@/lib/mockAuctionApi";
import {
  type PricingStrategy,
  loadStrategy,
  evaluateBid,
  getBadgeLevel,
  BUYER_PREMIUMS,
} from "@/lib/pricingStrategy";
import type { WantListItem } from "@/lib/collectionTypes";
import { loadWantList, matchWantListItems } from "@/lib/collectionStore";

function formatTimeLeft(endsAt: string): { text: string; urgent: boolean } {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { text: "Ended", urgent: false };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return { text: `${hours}h ${minutes}m`, urgent: hours < 2 };
  return { text: `${minutes}m`, urgent: true };
}

function formatPrice(price: number): string {
  return price >= 1000
    ? `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`
    : `$${price}`;
}

function formatUSD(price: number): string {
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CardInitials({ name, color }: { name: string; color: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("");
  return (
    <div
      className="w-full aspect-[2.5/3.5] rounded-lg flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${color} 0%, ${color}dd 40%, #0a1628 100%)`,
      }}
    >
      <div className="absolute inset-[2px] rounded-md border border-white/10" />
      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
        <span className="text-xl font-black text-white/60">{initials}</span>
      </div>
    </div>
  );
}

function BidBadge({
  listing,
  strategy,
}: {
  listing: AuctionListing;
  strategy: PricingStrategy;
}) {
  if (!strategy.enabled) return null;

  const evaluation = evaluateBid(
    listing.currentBid,
    listing.marketAvgPrice,
    listing.auctionHouse,
    strategy
  );
  const level = getBadgeLevel(
    evaluation.percentageFromAvg,
    strategy.bidThresholdPercent
  );

  const config = {
    good: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      label: "Good deal",
    },
    "near-limit": {
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      text: "text-amber-400",
      label: "Near limit",
    },
    "over-budget": {
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      text: "text-red-400",
      label: "Over budget",
    },
  }[level];

  const pctLabel =
    evaluation.percentageFromAvg <= 0
      ? `${Math.abs(evaluation.percentageFromAvg)}% below`
      : `${evaluation.percentageFromAvg}% above`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${config.bg} ${config.border} ${config.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          level === "good"
            ? "bg-emerald-400"
            : level === "near-limit"
              ? "bg-amber-400"
              : "bg-red-400"
        }`}
      />
      <span>{config.label}</span>
      <span className="opacity-70">·</span>
      <span className="opacity-70">{pctLabel} market</span>
    </div>
  );
}

function WantMatchBadge({ item }: { item: WantListItem }) {
  const config = {
    high: {
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      text: "text-red-400",
    },
    medium: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/30",
      text: "text-amber-400",
    },
    low: {
      bg: "bg-white/8",
      border: "border-white/15",
      text: "text-white/50",
    },
  }[item.priority];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${config.bg} ${config.border} ${config.text}`}
    >
      <span>🎯</span>
      <span>{item.playerName}</span>
      <span className="opacity-70">—</span>
      <span>{item.priority} priority</span>
      <span className="opacity-70">—</span>
      <span>max ${item.maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  );
}

function AuctionCard({
  listing,
  strategy,
  onBidPlaced,
  wantMatches,
}: {
  listing: AuctionListing;
  strategy: PricingStrategy;
  onBidPlaced: (id: string, response: BidResponse) => void;
  wantMatches: WantListItem[];
}) {
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [bidMessage, setBidMessage] = useState<{
    text: string;
    success: boolean;
  } | null>(null);
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
    ? evaluateBid(
        listing.currentBid,
        listing.marketAvgPrice,
        listing.auctionHouse,
        strategy
      )
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="auction-card rounded-xl overflow-hidden"
    >
      <div className="p-4 flex gap-4">
        {/* Card image */}
        <div className="w-24 flex-shrink-0">
          <CardInitials name={listing.player} color={listing.imageColor} />
          <div className="mt-2 text-center">
            <span className="grade-badge text-[9px]">
              {listing.gradingCompany === "raw" ? "Raw" : `${listing.gradingCompany} ${listing.grade}`}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white/90 truncate">
                {listing.player}
              </h3>
              <p className="text-xs text-white/40 truncate">
                {listing.year} {listing.set} {listing.cardNumber}
              </p>
            </div>
            <span
              className={`timer-badge px-2 py-0.5 rounded-md text-[10px] font-semibold flex-shrink-0 ${
                timeLeft.urgent ? "ending-soon text-red-400" : "text-amber-400"
              }`}
            >
              {timeLeft.text}
            </span>
          </div>

          {/* Bid evaluation badge */}
          <div className="mt-2">
            <BidBadge listing={listing} strategy={strategy} />
          </div>

          {/* Want list match badges */}
          {wantMatches.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {wantMatches.map((match) => (
                <WantMatchBadge key={match.id} item={match} />
              ))}
            </div>
          )}

          {/* Price info */}
          <div className="mt-2 flex items-center gap-3">
            <div className="price-tag px-2.5 py-1 rounded-lg">
              <p className="text-[10px] text-emerald-400/70">Current Bid</p>
              <p className="text-sm font-bold text-emerald-400">
                ${listing.currentBid.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-white/30">Mkt Avg</p>
              <p className="text-xs font-medium text-white/50">
                {formatPrice(listing.marketAvgPrice)}
              </p>
            </div>
            {evaluation && (
              <div>
                <p className="text-[10px] text-white/30">True Cost</p>
                <p className="text-xs font-medium text-white/50">
                  {formatPrice(evaluation.trueCost)}
                </p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-white/30">Bids</p>
              <p className="text-xs font-medium text-white/50">
                {listing.bidCount}
              </p>
            </div>
          </div>

          {/* Auction house badge */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-white/25 px-2 py-0.5 rounded bg-white/5 border border-white/5">
              {listing.auctionHouse}
            </span>
            <span className="text-[10px] text-white/25">
              {listing.team}
            </span>
            {evaluation && (
              <span className="text-[10px] text-white/20">
                Max bid: {formatUSD(evaluation.maxBid)}
              </span>
            )}
          </div>

          {/* Bid input */}
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              placeholder={`Min $${minBid.toLocaleString()}`}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="bid-input flex-1 px-3 py-2 rounded-lg text-xs"
              min={minBid}
            />
            <button
              onClick={handleBid}
              disabled={isBidding || !bidAmount}
              className={`
                px-4 py-2 rounded-lg text-xs font-semibold
                transition-all duration-300
                ${
                  isBidding || !bidAmount
                    ? "glass text-white/20 cursor-not-allowed"
                    : "btn-cta active:scale-[0.95]"
                }
              `}
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
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`text-[11px] mt-2 ${
                  bidMessage.success ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {bidMessage.text}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function StrategySummary({ strategy }: { strategy: PricingStrategy }) {
  const [expanded, setExpanded] = useState(false);

  if (!strategy.enabled) return null;

  const thresholdLabel =
    strategy.bidThresholdPercent === 0
      ? "at market average"
      : strategy.bidThresholdPercent > 0
        ? `${strategy.bidThresholdPercent}% above market`
        : `${Math.abs(strategy.bidThresholdPercent)}% below market`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
          <span className="text-xs text-white/70 truncate">
            <span className="font-semibold text-white/90">Strategy:</span> Bid{" "}
            {thresholdLabel} &middot; Source: {strategy.priceSource}
          </span>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-white/30 flex-shrink-0 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
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
            <div className="px-4 pb-3 space-y-2 border-t border-white/[0.06] pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Threshold</span>
                <span className="text-white/70 font-medium">
                  {thresholdLabel}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Price Source</span>
                <span className="text-white/70 font-medium">
                  {strategy.priceSource}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Premiums included</span>
                <span className="text-white/70 font-medium">
                  {Object.keys(BUYER_PREMIUMS).length} platforms
                </span>
              </div>
              <Link
                href="/settings/pricing"
                className="mt-2 block text-center text-[11px] text-[#5b9bff] hover:text-[#7db4ff] transition-colors py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                Edit Strategy
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AuctionsPage() {
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [wantList, setWantList] = useState<WantListItem[]>([]);
  const [strategy, setStrategy] = useState<PricingStrategy>({
    enabled: true,
    bidThresholdPercent: 0,
    priceSource: "VCP",
  });

  useEffect(() => {
    setStrategy(loadStrategy());
    setWantList(loadWantList());
    loadListings();
  }, []);

  // Re-load strategy and want list when page becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setStrategy(loadStrategy());
        setWantList(loadWantList());
      }
    };
    const handleFocus = () => {
      setStrategy(loadStrategy());
      setWantList(loadWantList());
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const loadListings = async () => {
    setLoading(true);
    const data = await fetchAuctionListings();
    setListings(data);
    setLoading(false);
  };

  const handleBidPlaced = useCallback(
    (id: string, response: BidResponse) => {
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, currentBid: response.newBid, bidCount: response.bidCount }
            : l
        )
      );
    },
    []
  );

  const filteredListings = listings.filter((l) => {
    const matchesFilter =
      filter === "all" ||
      l.auctionHouse.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      l.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const auctionHouses = ["all", "Fanatics", "Goldin", "PWCC"];

  return (
    <div className="bg-landing min-h-dvh flex flex-col noise-overlay vignette relative overflow-hidden">
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-4 pt-6 pb-2"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm group"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:-translate-x-0.5 transition-transform duration-200"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </Link>
            <Link
              href="/settings/pricing"
              className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs group"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Strategy
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Live</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              Auctions
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Browse and bid on graded baseball cards
          </p>
        </div>
      </motion.header>

      {/* Strategy Summary Widget */}
      <div className="relative z-10 px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <StrategySummary strategy={strategy} />
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 px-4 py-3"
      >
        <div className="max-w-3xl mx-auto space-y-3">
          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search players, sets, teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bid-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* House filters */}
          <div className="flex gap-1.5 p-1 glass-hero rounded-xl w-fit">
            {auctionHouses.map((house) => (
              <button
                key={house}
                onClick={() => setFilter(house)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filter === house
                    ? "bg-white/12 text-white shadow-sm"
                    : "text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                {house === "all" ? "All" : house}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Listings */}
      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="auction-card rounded-xl p-4 h-44 skeleton"
              />
            ))
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">
                No listings found
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <AuctionCard
                    listing={listing}
                    strategy={strategy}
                    onBidPlaced={handleBidPlaced}
                    wantMatches={matchWantListItems(listing, wantList)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <p className="text-center text-white/20 text-xs">
          CollectHub &middot; Mock Auction Data &middot; For Development Only
        </p>
      </motion.footer>
    </div>
  );
}
