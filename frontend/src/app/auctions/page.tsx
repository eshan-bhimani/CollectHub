"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchAuctionListings,
  type AuctionListing,
  type BidResponse,
} from "@/lib/mockAuctionApi";
import {
  type PricingStrategy,
  loadStrategy,
  evaluateBid,
} from "@/lib/pricingStrategy";
import type { WantListItem } from "@/lib/collectionTypes";
import { loadWantList, matchWantListItems } from "@/lib/collectionStore";
import PillBadge from "@/components/Shared/PillBadge";
import MarketOverview from "@/components/Auctions/MarketOverview";
import StrategySummary from "@/components/Auctions/StrategySummary";
import AuctionControlBar, { type SortOption } from "@/components/Auctions/AuctionControlBar";
import AuctionCard from "@/components/Auctions/AuctionCard";
import AuctionSkeleton from "@/components/Auctions/AuctionSkeleton";
import AuctionEmptyState from "@/components/Auctions/AuctionEmptyState";

function sortListings(
  listings: AuctionListing[],
  sortBy: SortOption,
  strategy: PricingStrategy
): AuctionListing[] {
  const sorted = [...listings];
  switch (sortBy) {
    case "ending-soon":
      return sorted.sort(
        (a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
      );
    case "price-low":
      return sorted.sort((a, b) => a.currentBid - b.currentBid);
    case "price-high":
      return sorted.sort((a, b) => b.currentBid - a.currentBid);
    case "most-bids":
      return sorted.sort((a, b) => b.bidCount - a.bidCount);
    case "best-deal":
      if (!strategy.enabled) return sorted;
      return sorted.sort((a, b) => {
        const evalA = evaluateBid(a.currentBid, a.marketAvgPrice, a.auctionHouse, strategy);
        const evalB = evaluateBid(b.currentBid, b.marketAvgPrice, b.auctionHouse, strategy);
        return evalA.percentageFromAvg - evalB.percentageFromAvg;
      });
    default:
      return sorted;
  }
}

export default function AuctionsPage() {
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("ending-soon");
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

  const handleBidPlaced = useCallback((id: string, response: BidResponse) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, currentBid: response.newBid, bidCount: response.bidCount }
          : l
      )
    );
  }, []);

  const filteredListings = sortListings(
    listings.filter((l) => {
      const matchesFilter =
        filter === "all" || l.auctionHouse.toLowerCase() === filter.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        l.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    }),
    sortBy,
    strategy
  );

  const hasFilters = filter !== "all" || searchQuery !== "";

  const clearFilters = () => {
    setFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="bg-landing min-h-dvh flex flex-col noise-overlay vignette relative overflow-hidden">
      <div className="haze-upper" />
      <div className="haze-mid" />
      <div className="haze-lower" />

      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />
      <div className="glow-blob glow-blob-ambient" />
      <div className="glow-blob glow-blob-upper-right" />
      <div className="glow-blob glow-blob-deep-bottom" />

      <div className="hero-spotlight-tertiary" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-4 pt-6 pb-2"
      >
        <div className="max-w-6xl mx-auto">
          <PillBadge label="Live Market" className="mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Live</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] via-[#e8354a] to-[#ff6b6b] bg-clip-text text-transparent">
              Auctions
            </span>
          </h1>
          <p className="text-white/35 text-sm mt-1.5 max-w-md">
            Browse and bid on graded baseball cards across Fanatics, Goldin &amp; PWCC
          </p>
          <div className="section-divider mt-5" />
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Market Overview */}
          {!loading && listings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <MarketOverview listings={listings} wantList={wantList} />
            </motion.div>
          )}

          {/* Strategy Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <StrategySummary strategy={strategy} />
          </motion.div>

          {/* Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <AuctionControlBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </motion.div>

          {/* Listings Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                >
                  <AuctionSkeleton />
                </motion.div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <AuctionEmptyState hasFilters={hasFilters} onClearFilters={clearFilters} />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredListings.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.06 }}
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
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 px-4 pb-8 pt-4"
      >
        <div className="max-w-6xl mx-auto">
          <div className="footer-line mb-4" />
          <div className="flex items-center justify-center">
            <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-white/15">
              CollectHub &middot; Auction Intelligence
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
