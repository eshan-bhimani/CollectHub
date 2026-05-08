"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CollectionItem, WantListItem } from "@/lib/collectionTypes";
import { loadCollection, loadWantList } from "@/lib/collectionStore";
import { fetchAllTradeableCards } from "@/lib/mockTradeUsers";
import type { TradeMatch, TradeProposal } from "@/lib/tradeTypes";
import {
  findTradeMatches,
  loadTrades,
  addTrade,
  updateTradeStatus,
  removeTrade,
} from "@/lib/tradeStore";
import type {
  TradeSortOption,
  TradeFilterOption,
} from "@/components/Trades/MatchControlBar";
import PillBadge from "@/components/Shared/PillBadge";
import TradeOverview from "@/components/Trades/TradeOverview";
import TradeStatusBoard from "@/components/Trades/TradeStatusBoard";
import MatchControlBar from "@/components/Trades/MatchControlBar";
import MatchCard from "@/components/Trades/MatchCard";
import TradeEmptyState from "@/components/Trades/TradeEmptyState";
import ProposeTradeModal from "@/components/Trades/ProposeTradeModal";

function sortMatches(matches: TradeMatch[], sortBy: TradeSortOption): TradeMatch[] {
  const sorted = [...matches];
  switch (sortBy) {
    case "best-match":
      return sorted.sort((a, b) => b.matchScore - a.matchScore);
    case "highest-value":
      return sorted.sort((a, b) => b.estimatedValue - a.estimatedValue);
    case "highest-grade":
      return sorted.sort((a, b) => {
        const gA = a.theirCard.condition.grade ?? -1;
        const gB = b.theirCard.condition.grade ?? -1;
        return gB - gA;
      });
    case "priority": {
      const order = { high: 0, medium: 1, low: 2 };
      return sorted.sort(
        (a, b) => order[a.myWant.priority] - order[b.myWant.priority]
      );
    }
    default:
      return sorted;
  }
}

function filterMatches(
  matches: TradeMatch[],
  filter: TradeFilterOption,
  searchQuery: string
): TradeMatch[] {
  return matches.filter((m) => {
    if (filter === "exact" && m.matchScore < 85) return false;
    if (filter === "high-priority" && m.myWant.priority !== "high") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !m.theirCard.playerName.toLowerCase().includes(q) &&
        !m.user.name.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });
}

export default function TradesPage() {
  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [trades, setTrades] = useState<TradeProposal[]>([]);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [wantList, setWantList] = useState<WantListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<TradeSortOption>("best-match");
  const [filter, setFilter] = useState<TradeFilterOption>("all");
  const [proposingMatch, setProposingMatch] = useState<TradeMatch | null>(null);

  useEffect(() => {
    const col = loadCollection();
    const wants = loadWantList();
    setCollection(col);
    setWantList(wants);
    setTrades(loadTrades());

    (async () => {
      setLoading(true);
      const otherUsers = await fetchAllTradeableCards();
      const found = findTradeMatches(wants, otherUsers);
      setMatches(found);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setCollection(loadCollection());
        setWantList(loadWantList());
        setTrades(loadTrades());
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const handlePropose = useCallback((proposal: TradeProposal) => {
    setTrades(addTrade(proposal));
    setProposingMatch(null);
  }, []);

  const handleAccept = useCallback((id: string) => {
    setTrades(updateTradeStatus(id, "accepted"));
  }, []);

  const handleDecline = useCallback((id: string) => {
    setTrades(updateTradeStatus(id, "declined"));
  }, []);

  const handleCancel = useCallback((id: string) => {
    setTrades(removeTrade(id));
  }, []);

  const filteredMatches = sortMatches(
    filterMatches(matches, filter, searchQuery),
    sortBy
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
          <PillBadge label="Trade Center" dotColor="#5b9bff" className="mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Trade</span>{" "}
            <span className="bg-gradient-to-r from-[#5b9bff] via-[#7db4ff] to-[#a8cdff] bg-clip-text text-transparent">
              Match Center
            </span>
          </h1>
          <p className="text-white/35 text-sm mt-1.5 max-w-md">
            Find collectors who have cards you want &mdash; and see what they might want from you
          </p>
          <div className="section-divider mt-5" />
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Match Overview */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <TradeOverview matches={matches} collection={collection} />
            </motion.div>
          )}

          {/* Trade Status Board */}
          {trades.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <TradeStatusBoard
                trades={trades}
                onAccept={handleAccept}
                onDecline={handleDecline}
                onCancel={handleCancel}
              />
            </motion.div>
          )}

          {/* Control Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
          >
            <MatchControlBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </motion.div>

          {/* Match Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 + i * 0.06 }}
                >
                  <div className="premium-card rounded-2xl overflow-hidden animate-pulse">
                    <div className="p-5 flex gap-4">
                      <div className="w-[120px] aspect-[2.5/3.5] rounded-lg bg-white/[0.04]" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 w-3/4 rounded bg-white/[0.06]" />
                        <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                        <div className="h-16 rounded-xl bg-white/[0.03]" />
                        <div className="h-3 w-2/3 rounded bg-white/[0.03]" />
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <div className="h-10 rounded-xl bg-white/[0.04]" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <TradeEmptyState
                hasFilters={hasFilters}
                hasWants={wantList.length > 0}
                onClearFilters={clearFilters}
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredMatches.map((match, i) => (
                  <motion.div
                    key={match.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.06 }}
                  >
                    <MatchCard match={match} onPropose={setProposingMatch} />
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
              CollectHub &middot; Trade Match Center
            </p>
          </div>
        </div>
      </motion.footer>

      {/* Propose Trade Modal */}
      {proposingMatch && (
        <ProposeTradeModal
          match={proposingMatch}
          collection={collection}
          onSubmit={handlePropose}
          onClose={() => setProposingMatch(null)}
        />
      )}
    </div>
  );
}
