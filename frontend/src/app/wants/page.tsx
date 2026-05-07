"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import PillBadge from "@/components/Shared/PillBadge";
import SectionLabel from "@/components/Shared/SectionLabel";
import WantsStats from "@/components/Wants/WantsStats";
import WantsCard from "@/components/Wants/WantsCard";
import WantsForm, { type WantsFormData } from "@/components/Wants/WantsForm";
import WantsEmptyState from "@/components/Wants/WantsEmptyState";

function generateId(): string {
  return `want-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const EMPTY_FORM: WantsFormData = {
  playerName: "",
  year: "",
  brand: "",
  setName: "",
  gradingCompany: "PSA",
  grade: "",
  maxPrice: "",
  priority: "medium",
};

const PRIORITY_ORDER: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

const PRIORITY_CONFIG = {
  high: {
    label: "High Priority",
    dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
  },
  medium: {
    label: "Medium Priority",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
  },
  low: {
    label: "Low Priority",
    dot: "bg-white/30",
    bg: "bg-white/[0.04]",
    border: "border-white/[0.08]",
    text: "text-white/50",
  },
};

export default function WantsPage() {
  const [wantList, setWantList] = useState<WantListItem[]>([]);
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WantsFormData>(EMPTY_FORM);

  useEffect(() => {
    setWantList(loadWantList());
    fetchAuctionListings().then(setListings);
  }, []);

  useEffect(() => {
    const reload = () => setWantList(loadWantList());
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

  const hasActiveMatch = useCallback(
    (wantItem: WantListItem): boolean => {
      return listings.some((listing) => matchWantListItems(listing, [wantItem]).length > 0);
    },
    [listings]
  );

  const groupedByPriority = PRIORITY_ORDER.map((priority) => ({
    priority,
    items: wantList.filter((w) => w.priority === priority),
  })).filter((g) => g.items.length > 0);

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
          <PillBadge label="Watchlist" dotColor="#e8354a" className="mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Want</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] via-[#e8354a] to-[#ff6b6b] bg-clip-text text-transparent">
              List
            </span>
          </h1>
          <p className="text-white/35 text-sm mt-1.5 max-w-md">
            Cards you&apos;re hunting &mdash; automatically matched against live auctions
          </p>
          <div className="section-divider mt-5" />
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Stats */}
          {wantList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <WantsStats wantList={wantList} listings={listings} />
            </motion.div>
          )}

          {/* Add Want Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {!showForm && (
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300"
              >
                + Add Want
              </button>
            )}
          </motion.div>

          {/* Add/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <WantsForm
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                isEditing={!!editingId}
              />
            )}
          </AnimatePresence>

          {/* Want List */}
          {wantList.length === 0 && !showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <WantsEmptyState
                onAddWant={() => {
                  resetForm();
                  setShowForm(true);
                }}
              />
            </motion.div>
          ) : (
            <div className="space-y-6">
              {groupedByPriority.map((group) => {
                const config = PRIORITY_CONFIG[group.priority];
                return (
                  <motion.div
                    key={group.priority}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                  >
                    {/* Priority group header */}
                    <div
                      className={`priority-header flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-3 ${config.bg} border ${config.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${config.text}`}>
                        {config.label}
                      </span>
                      <span className="text-[10px] text-white/20 ml-auto font-medium">
                        {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Cards in 2-column grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <AnimatePresence>
                        {group.items.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3, delay: i * 0.04 }}
                          >
                            <WantsCard
                              item={item}
                              hasMatch={hasActiveMatch(item)}
                              onEdit={handleEdit}
                              onDelete={handleDelete}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
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
              CollectHub &middot; Want List
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
