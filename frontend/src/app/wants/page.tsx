"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { WantListItem, CardCondition } from "@/lib/collectionTypes";
import type { AuctionListing } from "@/lib/mockAuctionApi";
import {
  loadWantList,
  addWantListItem,
  removeWantListItem,
  updateWantListItem,
  matchWantListItems,
} from "@/lib/collectionStore";
import { fetchAuctionListings } from "@/lib/mockAuctionApi";

function formatUSD(price: number): string {
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FormState {
  playerName: string;
  year: string;
  brand: string;
  setName: string;
  gradingCompany: CardCondition["gradingCompany"];
  grade: string;
  maxPrice: string;
  priority: WantListItem["priority"];
}

const BLANK_FORM: FormState = {
  playerName: "",
  year: "",
  brand: "",
  setName: "",
  gradingCompany: "PSA",
  grade: "",
  maxPrice: "",
  priority: "medium",
};

function formToItem(form: FormState, existingId?: string): WantListItem {
  return {
    id: existingId ?? crypto.randomUUID(),
    playerName: form.playerName.trim(),
    year: form.year ? parseInt(form.year, 10) : undefined,
    brand: form.brand || undefined,
    setName: form.setName || undefined,
    condition: {
      gradingCompany: form.gradingCompany,
      grade: form.grade ? parseFloat(form.grade) : null,
    },
    maxPrice: parseFloat(form.maxPrice) || 0,
    priority: form.priority,
    dateAdded: new Date().toISOString(),
  };
}

function itemToForm(item: WantListItem): FormState {
  return {
    playerName: item.playerName,
    year: item.year?.toString() ?? "",
    brand: item.brand ?? "",
    setName: item.setName ?? "",
    gradingCompany: item.condition.gradingCompany,
    grade: item.condition.grade?.toString() ?? "",
    maxPrice: item.maxPrice.toString(),
    priority: item.priority,
  };
}

const PRIORITY_ORDER: WantListItem["priority"][] = ["high", "medium", "low"];
const PRIORITY_LABELS: Record<WantListItem["priority"], string> = {
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};
const PRIORITY_COLORS: Record<
  WantListItem["priority"],
  { dot: string; text: string }
> = {
  high: { dot: "bg-red-400", text: "text-red-400" },
  medium: { dot: "bg-amber-400", text: "text-amber-400" },
  low: { dot: "bg-white/30", text: "text-white/40" },
};

export default function WantsPage() {
  const [items, setItems] = useState<WantListItem[]>([]);
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setItems(loadWantList());
    fetchAuctionListings().then(setListings);
  }, []);

  useEffect(() => {
    const reload = () => {
      setItems(loadWantList());
      fetchAuctionListings().then(setListings);
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

  const handleSubmit = useCallback(() => {
    if (!form.playerName.trim() || !form.maxPrice) return;
    if (editingId) {
      const updated = formToItem(form, editingId);
      setItems(updateWantListItem(editingId, updated));
      setEditingId(null);
    } else {
      const newItem = formToItem(form);
      setItems(addWantListItem(newItem));
    }
    setForm(BLANK_FORM);
    setShowForm(false);
  }, [form, editingId]);

  const handleEdit = useCallback((item: WantListItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems(removeWantListItem(id));
  }, []);

  const handleCancel = useCallback(() => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Check if a want item has active matches
  const hasMatch = (want: WantListItem): boolean => {
    // Build a synthetic check against all listings
    return listings.some((listing) => {
      const matches = matchWantListItems(listing, [want]);
      return matches.length > 0;
    });
  };

  // Group by priority
  const grouped = PRIORITY_ORDER.map((p) => ({
    priority: p,
    items: items.filter((i) => i.priority === p),
  })).filter((g) => g.items.length > 0);

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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform duration-200">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back
            </Link>
            <button
              onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(BLANK_FORM); }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300"
            >
              + Add Want
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Want</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              List
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Track cards you&apos;re looking for and match them to active auctions
          </p>
        </div>
      </motion.header>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 px-4 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto glass-card rounded-xl p-4 my-3 space-y-3">
              <h2 className="text-sm font-semibold text-white/80">
                {editingId ? "Edit Want" : "Add Want"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Player Name *"
                  value={form.playerName}
                  onChange={(e) => updateField("playerName", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs col-span-2"
                />
                <input
                  placeholder="Year (optional)"
                  type="number"
                  value={form.year}
                  onChange={(e) => updateField("year", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  placeholder="Brand (optional)"
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  placeholder="Set Name (optional)"
                  value={form.setName}
                  onChange={(e) => updateField("setName", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <select
                  value={form.gradingCompany}
                  onChange={(e) =>
                    updateField(
                      "gradingCompany",
                      e.target.value as CardCondition["gradingCompany"]
                    )
                  }
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                >
                  <option value="PSA">PSA</option>
                  <option value="BGS">BGS</option>
                  <option value="SGC">SGC</option>
                  <option value="raw">Raw (any)</option>
                </select>
                <input
                  placeholder="Min Grade (optional)"
                  type="number"
                  step="0.5"
                  min="1"
                  max="10"
                  value={form.grade}
                  onChange={(e) => updateField("grade", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                  disabled={form.gradingCompany === "raw"}
                />
                <input
                  placeholder="Max Price *"
                  type="number"
                  step="0.01"
                  value={form.maxPrice}
                  onChange={(e) => updateField("maxPrice", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <select
                  value={form.priority}
                  onChange={(e) =>
                    updateField(
                      "priority",
                      e.target.value as WantListItem["priority"]
                    )
                  }
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-xs font-medium glass text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.playerName.trim() || !form.maxPrice}
                  className="px-4 py-2 rounded-lg text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {editingId ? "Save Changes" : "Add to Want List"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Want List Items grouped by priority */}
      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-white/40 text-sm">
                Your want list is empty.
              </p>
              <p className="text-white/25 text-xs mt-1">
                Add cards you&apos;re looking for to get matched with active auctions.
              </p>
            </motion.div>
          ) : (
            grouped.map((group) => (
              <div key={group.priority}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[group.priority].dot}`}
                  />
                  <h2
                    className={`text-xs font-semibold uppercase tracking-wider ${PRIORITY_COLORS[group.priority].text}`}
                  >
                    {PRIORITY_LABELS[group.priority]}
                  </h2>
                  <span className="text-[10px] text-white/20">
                    ({group.items.length})
                  </span>
                </div>
                <div className="space-y-3">
                  <AnimatePresence>
                    {group.items.map((item, i) => {
                      const matched = hasMatch(item);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4, delay: i * 0.05 }}
                          className="auction-card rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-white/90 truncate">
                                  {item.playerName}
                                </h3>
                                {/* Match indicator */}
                                {matched ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Active match found
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/5 border border-white/10 text-white/30 flex-shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                    No active match
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/40 truncate mt-0.5">
                                {[item.year, item.brand, item.setName]
                                  .filter(Boolean)
                                  .join(" · ") || "Any year / set"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="grade-badge text-[9px]">
                                  {item.condition.gradingCompany === "raw"
                                    ? "Any grading"
                                    : `${item.condition.gradingCompany}${item.condition.grade !== null ? ` ${item.condition.grade}+` : ""}`}
                                </span>
                              </div>

                              <div className="mt-2 flex items-center gap-3">
                                <div className="price-tag px-2.5 py-1 rounded-lg">
                                  <p className="text-[10px] text-amber-400/70">
                                    Max Price
                                  </p>
                                  <p className="text-sm font-bold text-amber-400">
                                    {formatUSD(item.maxPrice)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-white/30">
                                    Added
                                  </p>
                                  <p className="text-xs text-white/40">
                                    {new Date(item.dateAdded).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1.5 rounded-md glass text-white/30 hover:text-white/60 transition-colors"
                                title="Edit"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1.5 rounded-md glass text-white/30 hover:text-red-400 transition-colors"
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
              </div>
            ))
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
          CollectHub &middot; Want List &middot; Matches based on active listings
        </p>
      </motion.footer>
    </div>
  );
}
