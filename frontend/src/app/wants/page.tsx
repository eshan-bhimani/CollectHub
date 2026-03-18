"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { WantListItem } from "@/lib/collectionTypes";
import type { AuctionListing } from "@/lib/mockAuctionApi";
import { fetchAuctionListings } from "@/lib/mockAuctionApi";
import {
  loadWantList,
  addWantListItem,
  removeWantListItem,
  updateWantListItem,
  matchWantListItems,
} from "@/lib/collectionStore";

function formatUSD(price: number): string {
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateId(): string {
  return `want-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const EMPTY_FORM = {
  playerName: "",
  year: "",
  brand: "",
  setName: "",
  gradingCompany: "PSA" as "PSA" | "BGS" | "SGC" | "raw",
  grade: "",
  maxPrice: "",
  priority: "medium" as "low" | "medium" | "high",
};

const PRIORITY_ORDER: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

const PRIORITY_CONFIG = {
  high: {
    label: "High Priority",
    dotColor: "bg-red-400",
    headerBg: "bg-red-500/10",
    headerBorder: "border-red-500/20",
    headerText: "text-red-400",
  },
  medium: {
    label: "Medium Priority",
    dotColor: "bg-amber-400",
    headerBg: "bg-amber-500/10",
    headerBorder: "border-amber-500/20",
    headerText: "text-amber-400",
  },
  low: {
    label: "Low Priority",
    dotColor: "bg-white/30",
    headerBg: "bg-white/5",
    headerBorder: "border-white/10",
    headerText: "text-white/50",
  },
};

export default function WantsPage() {
  const [wantList, setWantList] = useState<WantListItem[]>([]);
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setWantList(loadWantList());
    fetchAuctionListings().then(setListings);
  }, []);

  // Re-load on visibility/focus
  useEffect(() => {
    const reload = () => {
      setWantList(loadWantList());
    };
    const handleVisibility = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", reload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", reload);
    };
  }, []);

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.playerName.trim() || !form.maxPrice) return;

    const baseItem = {
      playerName: form.playerName.trim(),
      year: form.year ? parseInt(form.year, 10) : undefined,
      brand: form.brand || undefined,
      setName: form.setName || undefined,
      condition: {
        gradingCompany: form.gradingCompany,
        grade: form.gradingCompany === "raw" ? null : (form.grade ? parseFloat(form.grade) : null),
      },
      maxPrice: parseFloat(form.maxPrice),
      priority: form.priority,
    };

    if (editingId) {
      setWantList(updateWantListItem(editingId, baseItem));
    } else {
      const newItem: WantListItem = {
        ...baseItem,
        id: generateId(),
        dateAdded: new Date().toISOString(),
      };
      setWantList(addWantListItem(newItem));
    }
    resetForm();
  }, [form, editingId, resetForm]);

  const handleEdit = useCallback((item: WantListItem) => {
    setForm({
      playerName: item.playerName,
      year: item.year?.toString() ?? "",
      brand: item.brand ?? "",
      setName: item.setName ?? "",
      gradingCompany: item.condition.gradingCompany,
      grade: item.condition.grade?.toString() ?? "",
      maxPrice: item.maxPrice.toString(),
      priority: item.priority,
    });
    setEditingId(item.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setWantList(removeWantListItem(id));
  }, []);

  // Check if a want item has any active listing matches
  const hasActiveMatch = useCallback(
    (wantItem: WantListItem): boolean => {
      // Reverse check: see if any listing matches this want item
      return listings.some((listing) => {
        const matches = matchWantListItems(listing, [wantItem]);
        return matches.length > 0;
      });
    },
    [listings]
  );

  const groupedByPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    items: wantList.filter((w) => w.priority === priority),
  }));

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
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Want</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              List
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Cards you&apos;re hunting — matched against live auctions
          </p>
        </div>
      </motion.header>

      {/* Add Want Button */}
      <div className="relative z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold btn-cta active:scale-[0.95] transition-all duration-300"
          >
            + Add Want
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-10 px-4 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto glass-card rounded-xl p-4 space-y-3 mb-4">
              <h3 className="text-sm font-semibold text-white/80">
                {editingId ? "Edit Want" : "Add Want"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Player Name *"
                  value={form.playerName}
                  onChange={(e) => setForm({ ...form, playerName: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs col-span-2"
                />
                <input
                  type="number"
                  placeholder="Year (optional)"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Brand (optional)"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Set Name (optional)"
                  value={form.setName}
                  onChange={(e) => setForm({ ...form, setName: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <select
                  value={form.gradingCompany}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gradingCompany: e.target.value as "PSA" | "BGS" | "SGC" | "raw",
                      grade: e.target.value === "raw" ? "" : form.grade,
                    })
                  }
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                >
                  <option value="PSA">PSA</option>
                  <option value="BGS">BGS</option>
                  <option value="SGC">SGC</option>
                  <option value="raw">Raw</option>
                </select>
                {form.gradingCompany !== "raw" && (
                  <input
                    type="number"
                    placeholder="Min Grade (optional)"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    className="bid-input px-3 py-2 rounded-lg text-xs"
                    min="1"
                    max="10"
                    step="0.5"
                  />
                )}
                <input
                  type="number"
                  placeholder="Max Price *"
                  value={form.maxPrice}
                  onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                  min="0"
                  step="0.01"
                />
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as "low" | "medium" | "high" })
                  }
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!form.playerName.trim() || !form.maxPrice}
                  className="px-4 py-2 rounded-lg text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {editingId ? "Save Changes" : "Add to Want List"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-lg text-xs font-semibold glass text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Want List grouped by priority */}
      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {wantList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">
                No items on your want list yet. Add your first want above.
              </p>
            </div>
          ) : (
            groupedByPriority
              .filter((g) => g.items.length > 0)
              .map((group) => {
                const config = PRIORITY_CONFIG[group.priority];
                return (
                  <motion.div
                    key={group.priority}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* Priority Header */}
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-3 ${config.headerBg} border ${config.headerBorder}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${config.dotColor}`}
                      />
                      <span
                        className={`text-xs font-semibold ${config.headerText}`}
                      >
                        {config.label}
                      </span>
                      <span className="text-[10px] text-white/25 ml-auto">
                        {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {group.items.map((item, i) => {
                          const matched = hasActiveMatch(item);
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -15 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              className="auction-card rounded-xl p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-semibold text-white/90 truncate">
                                      {item.playerName}
                                    </h3>
                                    {/* Active match indicator */}
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${
                                        matched
                                          ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                                          : "bg-white/5 border border-white/10 text-white/30"
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          matched ? "bg-emerald-400" : "bg-white/20"
                                        }`}
                                      />
                                      {matched ? "Active match found" : "No active match"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-white/40 truncate mt-0.5">
                                    {[item.year, item.brand, item.setName]
                                      .filter(Boolean)
                                      .join(" · ")}
                                    {item.condition.gradingCompany !== "raw"
                                      ? ` · ${item.condition.gradingCompany}${item.condition.grade != null ? ` ${item.condition.grade}+` : ""}`
                                      : " · Raw"}
                                  </p>
                                  <div className="mt-2 flex items-center gap-4">
                                    <div>
                                      <p className="text-[10px] text-white/30">Max Price</p>
                                      <p className="text-xs font-medium text-white/70">
                                        {formatUSD(item.maxPrice)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-white/30">Added</p>
                                      <p className="text-xs text-white/40">
                                        {new Date(item.dateAdded).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1.5 flex-shrink-0">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="p-1.5 rounded-lg glass text-white/30 hover:text-white/60 transition-colors"
                                    title="Edit"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1.5 rounded-lg glass text-white/30 hover:text-red-400 transition-colors"
                                    title="Delete"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })
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
          CollectHub &middot; Want List &middot; Matched Against Live Auctions
        </p>
      </motion.footer>
    </div>
  );
}
