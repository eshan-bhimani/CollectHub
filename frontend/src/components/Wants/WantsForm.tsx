"use client";

import { motion } from "framer-motion";
import SectionLabel from "@/components/Shared/SectionLabel";

export interface WantsFormData {
  playerName: string;
  year: string;
  brand: string;
  setName: string;
  gradingCompany: "PSA" | "BGS" | "SGC" | "raw";
  grade: string;
  maxPrice: string;
  priority: "low" | "medium" | "high";
}

interface WantsFormProps {
  form: WantsFormData;
  onChange: (form: WantsFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

export default function WantsForm({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}: WantsFormProps) {
  const set = (patch: Partial<WantsFormData>) => onChange({ ...form, ...patch });
  const canSubmit = form.playerName.trim() !== "" && form.maxPrice !== "";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="premium-card rounded-2xl p-5 sm:p-6 space-y-5">
        <SectionLabel>{isEditing ? "Edit Want" : "Add Want"}</SectionLabel>

        <div className="grid grid-cols-2 gap-4">
          {/* Player Name */}
          <div className="form-group col-span-2">
            <label className="form-label">Player Name *</label>
            <input
              type="text"
              placeholder="e.g. Shohei Ohtani"
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
              placeholder="e.g. 2018"
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
              <option value="raw">Any / Raw</option>
            </select>
          </div>

          {/* Min Grade */}
          {form.gradingCompany !== "raw" && (
            <div className="form-group">
              <label className="form-label">Min Grade</label>
              <input
                type="number"
                placeholder="e.g. 8"
                value={form.grade}
                onChange={(e) => set({ grade: e.target.value })}
                className="bid-input px-3.5 py-3 rounded-xl text-xs"
                min="1"
                max="10"
                step="0.5"
              />
            </div>
          )}

          {/* Max Price */}
          <div className="form-group">
            <label className="form-label">Max Price *</label>
            <input
              type="number"
              placeholder="$0.00"
              value={form.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
              min="0"
              step="0.01"
            />
          </div>

          {/* Priority */}
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => set({ priority: e.target.value as "low" | "medium" | "high" })}
              className="bid-input px-3.5 py-3 rounded-xl text-xs"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-6 py-3 rounded-xl text-xs font-semibold btn-cta active:scale-[0.95] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isEditing ? "Save Changes" : "Add to Want List"}
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
