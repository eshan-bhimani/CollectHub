"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/Shared/SectionLabel";

export interface CollectionFormData {
  playerName: string;
  year: string;
  brand: string;
  setName: string;
  gradingCompany: "PSA" | "BGS" | "SGC" | "raw";
  grade: string;
  purchasePrice: string;
  certNumber: string;
  forTrade: boolean;
  notes: string;
}

interface CollectionFormProps {
  form: CollectionFormData;
  onChange: (form: CollectionFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function CollectionForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}: CollectionFormProps) {
  const set = (patch: Partial<CollectionFormData>) => onChange({ ...form, ...patch });
  const canSubmit = form.playerName.trim() !== "" && form.purchasePrice !== "";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="premium-card rounded-2xl p-5 sm:p-6 space-y-4">
        <SectionLabel>{isEditing ? "Edit Card" : "Add Card"}</SectionLabel>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Player Name *"
            value={form.playerName}
            onChange={(e) => set({ playerName: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs col-span-2"
          />
          <input
            type="number"
            placeholder="Year"
            value={form.year}
            onChange={(e) => set({ year: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs"
          />
          <input
            type="text"
            placeholder="Brand"
            value={form.brand}
            onChange={(e) => set({ brand: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs"
          />
          <input
            type="text"
            placeholder="Set Name"
            value={form.setName}
            onChange={(e) => set({ setName: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs"
          />
          <select
            value={form.gradingCompany}
            onChange={(e) =>
              set({
                gradingCompany: e.target.value as "PSA" | "BGS" | "SGC" | "raw",
                grade: e.target.value === "raw" ? "" : form.grade,
              })
            }
            className="bid-input px-3.5 py-3 rounded-xl text-xs"
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
              onChange={(e) => set({ grade: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
              min="1"
              max="10"
              step="0.5"
            />
          )}
          <input
            type="number"
            placeholder="Purchase Price *"
            value={form.purchasePrice}
            onChange={(e) => set({ purchasePrice: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs"
            min="0"
            step="0.01"
          />
          <input
            type="text"
            placeholder="Cert Number"
            value={form.certNumber}
            onChange={(e) => set({ certNumber: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs"
          />
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
            className="bid-input px-3.5 py-3 rounded-xl text-xs col-span-2 resize-none"
            rows={2}
          />
        </div>

        <label className="flex items-center gap-2.5 text-xs text-white/40 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.forTrade}
            onChange={(e) => set({ forTrade: e.target.checked })}
            className="rounded border-white/20"
          />
          Available for trade
        </label>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-6 py-3 rounded-xl text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isEditing ? "Save Changes" : "Add to Collection"}
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-3 rounded-xl text-xs font-semibold bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:border-white/[0.12] transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
