"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import PillBadge from "@/components/Shared/PillBadge";
import CollectionStats from "@/components/Collection/CollectionStats";
import CollectionCard from "@/components/Collection/CollectionCard";
import CollectionForm, { type CollectionFormData } from "@/components/Collection/CollectionForm";
import CollectionEmptyState from "@/components/Collection/CollectionEmptyState";

function generateId(): string {
  return `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const EMPTY_FORM: CollectionFormData = {
  playerName: "",
  year: "",
  brand: "",
  setName: "",
  gradingCompany: "PSA",
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
  const [form, setForm] = useState<CollectionFormData>(EMPTY_FORM);
  const [resolvedValues, setResolvedValues] = useState<Record<string, number | null>>({});

  useEffect(() => {
    setCollection(loadCollection());
    fetchAuctionListings().then(setListings);
  }, []);

  useEffect(() => {
    if (listings.length === 0) return;
    const values: Record<string, number | null> = {};
    collection.forEach((item) => {
      values[item.id] = resolveCurrentValue(item, listings);
    });
    setResolvedValues(values);
  }, [collection, listings]);

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
          <PillBadge label="Portfolio Tracker" dotColor="#003DA5" className="mb-4" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">My</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] via-[#e8354a] to-[#ff6b6b] bg-clip-text text-transparent">
              Collection
            </span>
          </h1>
          <p className="text-white/35 text-sm mt-1.5 max-w-md">
            Track your cards, values, and profit/loss across your entire portfolio
          </p>
          <div className="section-divider mt-5" />
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 px-4 py-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Portfolio Stats */}
          {collection.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <CollectionStats collection={collection} resolvedValues={resolvedValues} />
            </motion.div>
          )}

          {/* Add Card Button */}
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
                + Add Card
              </button>
            )}
          </motion.div>

          {/* Add/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <CollectionForm
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                onCancel={resetForm}
                isEditing={!!editingId}
              />
            )}
          </AnimatePresence>

          {/* Collection Grid */}
          {collection.length === 0 && !showForm ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <CollectionEmptyState
                onAddCard={() => {
                  resetForm();
                  setShowForm(true);
                }}
              />
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {collection.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  >
                    <CollectionCard
                      item={item}
                      currentValue={resolvedValues[item.id] ?? null}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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
              CollectHub &middot; Collection Tracker
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
