"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { CollectionItem } from "@/lib/collectionTypes";
import type { AuctionListing } from "@/lib/mockAuctionApi";
import { fetchAuctionListings } from "@/lib/mockAuctionApi";
import {
  loadCollection,
  addCollectionItem,
  removeCollectionItem,
  updateCollectionItem,
  resolveCurrentValue,
} from "@/lib/collectionStore";

function formatUSD(price: number): string {
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function generateId(): string {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const EMPTY_FORM = {
  playerName: "",
  year: "",
  brand: "",
  setName: "",
  gradingCompany: "PSA" as "PSA" | "BGS" | "SGC" | "raw",
  grade: "",
  purchasePrice: "",
  certNumber: "",
  forTrade: false,
  notes: "",
};

export default function CollectionPage() {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [resolvedValues, setResolvedValues] = useState<Record<string, number | null>>({});

  useEffect(() => {
    setCollection(loadCollection());
    fetchAuctionListings().then(setListings);
  }, []);

  // Resolve current values whenever collection or listings change
  useEffect(() => {
    if (listings.length === 0) return;
    const values: Record<string, number | null> = {};
    collection.forEach((item) => {
      values[item.id] = resolveCurrentValue(item, listings);
    });
    setResolvedValues(values);
  }, [collection, listings]);

  // Re-load on visibility/focus
  useEffect(() => {
    const reload = () => setCollection(loadCollection());
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
    if (!form.playerName.trim() || !form.purchasePrice) return;

    const baseItem = {
      playerName: form.playerName.trim(),
      year: form.year ? parseInt(form.year, 10) : undefined,
      brand: form.brand || undefined,
      setName: form.setName || undefined,
      condition: {
        gradingCompany: form.gradingCompany,
        grade: form.gradingCompany === "raw" ? null : (form.grade ? parseFloat(form.grade) : null),
      },
      purchasePrice: parseFloat(form.purchasePrice),
      certNumber: form.certNumber || undefined,
      forTrade: form.forTrade,
      notes: form.notes || undefined,
    };

    if (editingId) {
      setCollection(updateCollectionItem(editingId, baseItem));
    } else {
      const newItem: CollectionItem = {
        ...baseItem,
        id: generateId(),
        dateAdded: new Date().toISOString(),
      };
      setCollection(addCollectionItem(newItem));
    }
    resetForm();
  }, [form, editingId, resetForm]);

  const handleEdit = useCallback((item: CollectionItem) => {
    setForm({
      playerName: item.playerName,
      year: item.year?.toString() ?? "",
      brand: item.brand ?? "",
      setName: item.setName ?? "",
      gradingCompany: item.condition.gradingCompany,
      grade: item.condition.grade?.toString() ?? "",
      purchasePrice: item.purchasePrice.toString(),
      certNumber: item.certNumber ?? "",
      forTrade: item.forTrade,
      notes: item.notes ?? "",
    });
    setEditingId(item.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setCollection(removeCollectionItem(id));
  }, []);

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
            <span className="text-white">My</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Track your cards, values, and profit/loss
          </p>
        </div>
      </motion.header>

      {/* Add Card Button */}
      <div className="relative z-10 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold btn-cta active:scale-[0.95] transition-all duration-300"
          >
            + Add Card
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
                {editingId ? "Edit Card" : "Add Card"}
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
                  placeholder="Year"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="Set Name"
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
                    placeholder="Grade"
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
                  placeholder="Purchase Price *"
                  value={form.purchasePrice}
                  onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                  min="0"
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="Cert Number"
                  value={form.certNumber}
                  onChange={(e) => setForm({ ...form, certNumber: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <textarea
                  placeholder="Notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="bid-input px-3 py-2 rounded-lg text-xs col-span-2"
                  rows={2}
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.forTrade}
                  onChange={(e) => setForm({ ...form, forTrade: e.target.checked })}
                  className="rounded"
                />
                Available for trade
              </label>

              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={!form.playerName.trim() || !form.purchasePrice}
                  className="px-4 py-2 rounded-lg text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {editingId ? "Save Changes" : "Add to Collection"}
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

      {/* Collection Grid */}
      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {collection.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">
                No cards in your collection yet. Add your first card above.
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {collection.map((item, i) => {
                const currentValue = resolvedValues[item.id] ?? null;
                const profitLoss = currentValue != null ? currentValue - item.purchasePrice : null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="auction-card rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white/90 truncate">
                            {item.playerName}
                          </h3>
                          {item.forTrade && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex-shrink-0">
                              For Trade
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/40 truncate mt-0.5">
                          {[item.year, item.brand, item.setName]
                            .filter(Boolean)
                            .join(" · ")}
                          {item.condition.gradingCompany !== "raw"
                            ? ` · ${item.condition.gradingCompany} ${item.condition.grade ?? ""}`
                            : " · Raw"}
                        </p>
                        {item.certNumber && (
                          <p className="text-[10px] text-white/25 mt-0.5">
                            Cert #{item.certNumber}
                          </p>
                        )}

                        {/* Value & Profit/Loss */}
                        <div className="mt-2 flex items-center gap-4">
                          <div>
                            <p className="text-[10px] text-white/30">Purchased</p>
                            <p className="text-xs font-medium text-white/70">
                              {formatUSD(item.purchasePrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-white/30">Current Value</p>
                            {currentValue != null ? (
                              <p className="text-xs font-medium text-white/70">
                                {formatUSD(currentValue)}
                                <span className="text-[9px] text-white/25 ml-1">
                                  Est. from active listings
                                </span>
                              </p>
                            ) : (
                              <p className="text-xs text-white/25 italic">
                                No recent sales data
                              </p>
                            )}
                          </div>
                          {profitLoss != null && (
                            <div>
                              <p className="text-[10px] text-white/30">P/L</p>
                              <p
                                className={`text-xs font-semibold ${
                                  profitLoss >= 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                {profitLoss >= 0 ? "+" : ""}
                                {formatUSD(profitLoss)}
                              </p>
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-white/25 mt-2 truncate">
                            {item.notes}
                          </p>
                        )}
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
          CollectHub &middot; Collection Tracker &middot; Values from Active Listings
        </p>
      </motion.footer>
    </div>
  );
}
