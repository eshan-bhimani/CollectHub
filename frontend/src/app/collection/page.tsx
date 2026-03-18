"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { CollectionItem, CardCondition } from "@/lib/collectionTypes";
import {
  loadCollection,
  addCollectionItem,
  removeCollectionItem,
  updateCollectionItem,
  resolveCurrentValue,
} from "@/lib/collectionStore";
import {
  fetchAuctionListings,
  type AuctionListing,
} from "@/lib/mockAuctionApi";

function formatUSD(price: number): string {
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const EMPTY_CONDITION: CardCondition = { gradingCompany: "PSA", grade: null };

interface FormState {
  playerName: string;
  year: string;
  brand: string;
  setName: string;
  gradingCompany: CardCondition["gradingCompany"];
  grade: string;
  certNumber: string;
  purchasePrice: string;
  forTrade: boolean;
  notes: string;
}

const BLANK_FORM: FormState = {
  playerName: "",
  year: "",
  brand: "",
  setName: "",
  gradingCompany: "PSA",
  grade: "",
  certNumber: "",
  purchasePrice: "",
  forTrade: false,
  notes: "",
};

function formToItem(form: FormState, existingId?: string): CollectionItem {
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
    certNumber: form.certNumber || undefined,
    purchasePrice: parseFloat(form.purchasePrice) || 0,
    forTrade: form.forTrade,
    notes: form.notes || undefined,
    dateAdded: new Date().toISOString(),
  };
}

function itemToForm(item: CollectionItem): FormState {
  return {
    playerName: item.playerName,
    year: item.year?.toString() ?? "",
    brand: item.brand ?? "",
    setName: item.setName ?? "",
    gradingCompany: item.condition.gradingCompany,
    grade: item.condition.grade?.toString() ?? "",
    certNumber: item.certNumber ?? "",
    purchasePrice: item.purchasePrice.toString(),
    forTrade: item.forTrade,
    notes: item.notes ?? "",
  };
}

export default function CollectionPage() {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setItems(loadCollection());
    fetchAuctionListings().then(setListings);
  }, []);

  // Reload on visibility / focus (same pattern as auctions page)
  useEffect(() => {
    const reload = () => {
      setItems(loadCollection());
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
    if (!form.playerName.trim() || !form.purchasePrice) return;
    if (editingId) {
      const updated = formToItem(form, editingId);
      setItems(updateCollectionItem(editingId, updated));
      setEditingId(null);
    } else {
      const newItem = formToItem(form);
      setItems(addCollectionItem(newItem));
    }
    setForm(BLANK_FORM);
    setShowForm(false);
  }, [form, editingId]);

  const handleEdit = useCallback((item: CollectionItem) => {
    setForm(itemToForm(item));
    setEditingId(item.id);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems(removeCollectionItem(id));
  }, []);

  const handleCancel = useCallback(() => {
    setForm(BLANK_FORM);
    setEditingId(null);
    setShowForm(false);
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
              + Add Card
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">My</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Track your cards and see estimated values from active listings
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
                {editingId ? "Edit Card" : "Add Card"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Player Name *"
                  value={form.playerName}
                  onChange={(e) => updateField("playerName", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs col-span-2"
                />
                <input
                  placeholder="Year"
                  type="number"
                  value={form.year}
                  onChange={(e) => updateField("year", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  placeholder="Set Name"
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
                  <option value="raw">Raw</option>
                </select>
                <input
                  placeholder="Grade"
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
                  placeholder="Cert Number"
                  value={form.certNumber}
                  onChange={(e) => updateField("certNumber", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
                <input
                  placeholder="Purchase Price *"
                  type="number"
                  step="0.01"
                  value={form.purchasePrice}
                  onChange={(e) => updateField("purchasePrice", e.target.value)}
                  className="bid-input px-3 py-2 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.forTrade}
                    onChange={(e) => updateField("forTrade", e.target.checked)}
                    className="accent-emerald-500"
                  />
                  For Trade
                </label>
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="bid-input px-3 py-2 rounded-lg text-xs w-full resize-none h-16"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-lg text-xs font-medium glass text-white/50 hover:text-white/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.playerName.trim() || !form.purchasePrice}
                  className="px-4 py-2 rounded-lg text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {editingId ? "Save Changes" : "Add to Collection"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collection Items */}
      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-white/40 text-sm">
                No cards in your collection yet.
              </p>
              <p className="text-white/25 text-xs mt-1">
                Click &quot;Add Card&quot; to start tracking.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {items.map((item, i) => {
                const currentValue = resolveCurrentValue(item, listings);
                const profitLoss =
                  currentValue !== null
                    ? currentValue - item.purchasePrice
                    : null;

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
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="grade-badge text-[9px]">
                            {item.condition.gradingCompany === "raw"
                              ? "Raw"
                              : `${item.condition.gradingCompany} ${item.condition.grade ?? "?"}`}
                          </span>
                          {item.certNumber && (
                            <span className="text-[10px] text-white/25">
                              Cert #{item.certNumber}
                            </span>
                          )}
                        </div>

                        {/* Pricing */}
                        <div className="mt-2 flex items-center gap-3 flex-wrap">
                          <div className="price-tag px-2.5 py-1 rounded-lg">
                            <p className="text-[10px] text-white/50">
                              Purchased
                            </p>
                            <p className="text-sm font-bold text-white/80">
                              {formatUSD(item.purchasePrice)}
                            </p>
                          </div>
                          {currentValue !== null ? (
                            <>
                              <div>
                                <p className="text-[10px] text-white/30">
                                  Est. from active listings
                                </p>
                                <p className="text-xs font-medium text-white/70">
                                  {formatUSD(currentValue)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-white/30">
                                  P/L
                                </p>
                                <p
                                  className={`text-xs font-bold ${
                                    profitLoss! >= 0
                                      ? "text-emerald-400"
                                      : "text-red-400"
                                  }`}
                                >
                                  {profitLoss! >= 0 ? "+" : ""}
                                  {formatUSD(profitLoss!)}
                                </p>
                              </div>
                            </>
                          ) : (
                            <p className="text-[10px] text-white/25 italic">
                              No recent sales data
                            </p>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-[10px] text-white/30 mt-2 italic">
                            {item.notes}
                          </p>
                        )}
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
          CollectHub &middot; Collection Tracker &middot; Values are estimates only
        </p>
      </motion.footer>
    </div>
  );
}
