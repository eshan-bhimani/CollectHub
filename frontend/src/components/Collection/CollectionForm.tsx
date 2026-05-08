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
      <div className="premium-card rounded-2xl p-5 sm:p-6 space-y-5">
        <SectionLabel>{isEditing ? "Edit Card" : "Add Card"}</SectionLabel>

        <div className="grid grid-cols-2 gap-4">
          {/* Player Name */}
          <div className="form-group col-span-2">
            <label className="form-label">Player Name *</label>
            <input
              type="text"
              placeholder="e.g. Mike Trout"
              value={form.playerName}
              onChange={(e) => set({ playerName: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
            />
          </div>

          {/* Year */}
          <div className="form-group">
            <label className="form-label">Year</label>
            <input
              type="number"
              placeholder="e.g. 2011"
              value={form.year}
              onChange={(e) => set({ year: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
            />
          </div>

          {/* Brand */}
          <div className="form-group">
            <label className="form-label">Brand</label>
            <input
              type="text"
              placeholder="e.g. Topps"
              value={form.brand}
              onChange={(e) => set({ brand: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
            />
          </div>

          {/* Set Name */}
          <div className="form-group">
            <label className="form-label">Set Name</label>
            <input
              type="text"
              placeholder="e.g. Topps Chrome"
              value={form.setName}
              onChange={(e) => set({ setName: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
            />
          </div>

          {/* Grading Company */}
          <div className="form-group">
            <label className="form-label">Grading</label>
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
              <option value="raw">Raw / Ungraded</option>
            </select>
          </div>

          {/* Grade */}
          {form.gradingCompany !== "raw" && (
            <div className="form-group">
              <label className="form-label">Grade</label>
              <input
                type="number"
                placeholder="e.g. 9.5"
                value={form.grade}
                onChange={(e) => set({ grade: e.target.value })}
                className="bid-input px-3.5 py-3 rounded-xl text-xs"
                min="1"
                max="10"
                step="0.5"
              />
            </div>
          )}

          {/* Purchase Price */}
          <div className="form-group">
            <label className="form-label">Purchase Price *</label>
            <input
              type="number"
              placeholder="$0.00"
              value={form.purchasePrice}
              onChange={(e) => set({ purchasePrice: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
              min="0"
              step="0.01"
            />
          </div>

          {/* Cert Number */}
          <div className="form-group">
            <label className="form-label">Cert Number</label>
            <input
              type="text"
              placeholder="e.g. 12345678"
              value={form.certNumber}
              onChange={(e) => set({ certNumber: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
            />
          </div>

          {/* Notes */}
          <div className="form-group col-span-2">
            <label className="form-label">Notes</label>
            <textarea
              placeholder="Any additional details about this card..."
              value={form.notes}
              onChange={(e) => set({ notes: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* For Trade toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={form.forTrade}
            onChange={(e) => set({ forTrade: e.target.checked })}
            className="form-checkbox"
          />
          <span className="text-xs font-medium text-white/40 group-hover:text-white/55 transition-colors">
            Available for trade
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
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
