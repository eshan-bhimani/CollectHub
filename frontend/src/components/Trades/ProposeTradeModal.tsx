"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TradeMatch, TradeProposal } from "@/lib/tradeTypes";
import type { CollectionItem } from "@/lib/collectionTypes";
import AuctionCardSlab from "@/components/Auctions/AuctionCardSlab";
import { getImageColor } from "@/lib/mockTradeUsers";

function formatCompact(price: number): string {
  return price >= 1000
    ? `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`
    : `$${price.toLocaleString()}`;
}

function gradeLabel(company: string, grade: number | null): string {
  if (company === "raw" || grade == null) return "Raw";
  return `${company} ${grade}`;
}

interface ProposeTradeModalProps {
  match: TradeMatch;
  collection: CollectionItem[];
  onSubmit: (proposal: TradeProposal) => void;
  onClose: () => void;
}

export default function ProposeTradeModal({
  match,
  collection,
  onSubmit,
  onClose,
}: ProposeTradeModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [cashOffer, setCashOffer] = useState("");
  const [message, setMessage] = useState("");

  const tradeableCards = collection.filter((c) => c.forTrade);
  const selectedCards = tradeableCards.filter((c) => selectedIds.has(c.id));

  const toggleCard = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    const proposal: TradeProposal = {
      id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      status: "proposed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchId: match.id,
      theirUser: match.user,
      theirCard: match.theirCard,
      myWant: match.myWant,
      myOfferedCards: selectedCards,
      cashOffer: parseFloat(cashOffer) || 0,
      message: message || undefined,
    };
    onSubmit(proposal);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto workspace-shell rounded-2xl p-5 sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white/90">
                {step === 1
                  ? "Review Match"
                  : step === 2
                    ? "Select Your Offer"
                    : "Confirm Trade"}
              </h2>
              <p className="text-[11px] text-white/35 mt-0.5">
                Step {step} of 3
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5 mb-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  s <= step ? "bg-[#C8102E]/60" : "bg-white/[0.06]"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Review */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="data-panel rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                  Their Card
                </p>
                <div className="flex gap-3">
                  <div className="w-16 flex-shrink-0">
                    <AuctionCardSlab
                      player={match.theirCard.playerName}
                      gradingCompany={match.theirCard.condition.gradingCompany}
                      grade={match.theirCard.condition.grade ?? 0}
                      imageColor={getImageColor(match.theirCard.playerName)}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/85">
                      {match.theirCard.playerName}
                    </p>
                    <p className="text-[11px] text-white/40 mt-0.5">
                      {match.theirCard.year} {match.theirCard.setName}
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {gradeLabel(match.theirCard.condition.gradingCompany, match.theirCard.condition.grade)}
                    </p>
                    <p className="text-xs font-semibold text-emerald-400 mt-1.5">
                      ~{formatCompact(match.estimatedValue)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="data-panel rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
                  Matches Your Want
                </p>
                <p className="text-xs text-white/60">
                  {match.myWant.playerName}
                  {match.myWant.year ? ` (${match.myWant.year})` : ""}
                  {match.myWant.setName ? ` · ${match.myWant.setName}` : ""}
                </p>
                <p className="text-[10px] text-white/30 mt-1">
                  Max price: {formatCompact(match.myWant.maxPrice)} · Priority: {match.myWant.priority}
                </p>
              </div>

              <div className="data-panel rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
                  Trader
                </p>
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white/90"
                    style={{ background: match.user.avatarColor }}
                  >
                    {match.user.name[0]}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white/70">{match.user.name}</p>
                    <p className="text-[10px] text-white/30">
                      {match.user.rating.toFixed(1)} rating · {match.user.totalTrades} trades
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold btn-cta active:scale-[0.97] transition-all duration-300"
              >
                Next: Select Your Offer
              </button>
            </div>
          )}

          {/* Step 2: Select cards */}
          {step === 2 && (
            <div className="space-y-4">
              {tradeableCards.length === 0 ? (
                <div className="data-panel rounded-xl p-6 text-center">
                  <p className="text-xs text-white/40 mb-1">No tradeable cards</p>
                  <p className="text-[10px] text-white/25">
                    Mark cards as &quot;For Trade&quot; in your collection first
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tradeableCards.map((card) => {
                    const selected = selectedIds.has(card.id);
                    return (
                      <button
                        key={card.id}
                        onClick={() => toggleCard(card.id)}
                        className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selected
                            ? "border-[#C8102E]/30 bg-[#C8102E]/[0.08]"
                            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                          selected
                            ? "border-[#C8102E] bg-[#C8102E]/20"
                            : "border-white/15"
                        }`}>
                          {selected && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8102E]">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/70 truncate">
                            {card.playerName}
                          </p>
                          <p className="text-[10px] text-white/30 truncate">
                            {card.year} {card.setName} · {gradeLabel(card.condition.gradingCompany, card.condition.grade)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-white/40 flex-shrink-0">
                          {formatCompact(card.purchasePrice)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cash offer */}
              <div className="form-group">
                <label className="form-label">Cash Supplement (optional)</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={cashOffer}
                  onChange={(e) => setCashOffer(e.target.value)}
                  className="bid-input w-full px-3 py-2.5 rounded-xl text-xs"
                  min={0}
                />
              </div>

              {/* Message */}
              <div className="form-group">
                <label className="form-label">Message (optional)</label>
                <textarea
                  placeholder="Add a note to the trader..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="bid-input w-full px-3 py-2.5 rounded-xl text-xs resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={selectedIds.size === 0 && !cashOffer}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    selectedIds.size === 0 && !cashOffer
                      ? "bg-white/[0.03] text-white/15 cursor-not-allowed border border-white/[0.05]"
                      : "btn-cta active:scale-[0.97]"
                  }`}
                >
                  Review Offer
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="data-panel rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                  You Want
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 flex-shrink-0">
                    <AuctionCardSlab
                      player={match.theirCard.playerName}
                      gradingCompany={match.theirCard.condition.gradingCompany}
                      grade={match.theirCard.condition.grade ?? 0}
                      imageColor={getImageColor(match.theirCard.playerName)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white/70">
                      {match.theirCard.playerName}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {match.theirCard.year} {match.theirCard.setName} · {gradeLabel(match.theirCard.condition.gradingCompany, match.theirCard.condition.grade)}
                    </p>
                  </div>
                  <span className="ml-auto text-xs font-semibold text-emerald-400">
                    ~{formatCompact(match.estimatedValue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                  <path d="M7 16V4m0 0L3 8m4-4l4 4" />
                  <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>

              <div className="data-panel rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">
                  You&apos;re Offering
                </p>
                <div className="space-y-2">
                  {selectedCards.map((card) => (
                    <div key={card.id} className="flex items-center gap-2">
                      <div className="w-8 flex-shrink-0">
                        <AuctionCardSlab
                          player={card.playerName}
                          gradingCompany={card.condition.gradingCompany}
                          grade={card.condition.grade ?? 0}
                          imageColor={getImageColor(card.playerName)}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/70">
                          {card.playerName}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {card.year} {card.setName}
                        </p>
                      </div>
                      <span className="ml-auto text-xs font-semibold text-white/40">
                        {formatCompact(card.purchasePrice)}
                      </span>
                    </div>
                  ))}
                  {parseFloat(cashOffer) > 0 && (
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                      <span className="text-xs text-white/40">+ Cash</span>
                      <span className="ml-auto text-xs font-semibold text-emerald-400">
                        {formatCompact(parseFloat(cashOffer))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {message && (
                <div className="data-panel rounded-xl p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
                    Message
                  </p>
                  <p className="text-xs text-white/50">{message}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold btn-cta active:scale-[0.97] transition-all duration-300"
                >
                  Send Proposal
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
