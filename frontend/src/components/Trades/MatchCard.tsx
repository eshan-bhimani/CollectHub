"use client";

import type { TradeMatch } from "@/lib/tradeTypes";
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

interface MatchCardProps {
  match: TradeMatch;
  onPropose: (match: TradeMatch) => void;
}

export default function MatchCard({ match, onPropose }: MatchCardProps) {
  const { user, theirCard, myWant, matchScore, estimatedValue } = match;
  const accent =
    matchScore >= 85 ? "good" : matchScore < 60 ? "warn" : undefined;

  return (
    <div className="premium-card rounded-2xl overflow-hidden" data-accent={accent}>
      <div className="p-4 sm:p-5 flex gap-4">
        {/* Slab preview */}
        <div className="w-[100px] sm:w-[120px] flex-shrink-0">
          <AuctionCardSlab
            player={theirCard.playerName}
            gradingCompany={theirCard.condition.gradingCompany}
            grade={theirCard.condition.grade ?? 0}
            imageColor={getImageColor(theirCard.playerName)}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white/90 truncate">
                {theirCard.playerName}
              </h3>
              <p className="text-[11px] text-white/35 truncate mt-0.5">
                {theirCard.year} {theirCard.setName}
              </p>
            </div>
            <span
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                matchScore >= 85
                  ? "border-emerald-400/30 bg-emerald-400/15 text-emerald-400"
                  : matchScore >= 60
                    ? "border-[#5b9bff]/30 bg-[#5b9bff]/15 text-[#5b9bff]"
                    : "border-amber-400/30 bg-amber-400/15 text-amber-400"
              }`}
            >
              {matchScore}% match
            </span>
          </div>

          {/* Badges */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {/* User badge */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-medium text-white/50">
              <span
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white/90 flex-shrink-0"
                style={{ background: user.avatarColor }}
              >
                {user.name[0]}
              </span>
              {user.name}
            </span>
            {/* Priority */}
            {myWant.priority === "high" && (
              <span className="px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                High Priority
              </span>
            )}
            {myWant.priority === "medium" && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Medium
              </span>
            )}
          </div>

          {/* Price grid panel */}
          <div className="mt-3 data-panel rounded-xl p-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">
                  Value
                </p>
                <p className="text-xs sm:text-sm font-bold text-emerald-400 stat-value-glow-emerald">
                  {formatCompact(estimatedValue)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">
                  Grade
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/55">
                  {gradeLabel(theirCard.condition.gradingCompany, theirCard.condition.grade)}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">
                  Score
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/55">{matchScore}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">
                  Rating
                </p>
                <p className="text-xs sm:text-sm font-bold text-white/55">
                  {user.rating.toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] text-white/30 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] font-medium">
              {gradeLabel(theirCard.condition.gradingCompany, theirCard.condition.grade)}
            </span>
            <span className="text-[10px] text-white/20 font-medium truncate">
              Matches: {myWant.playerName}
              {myWant.year ? ` ${myWant.year}` : ""}
            </span>
            <span className="text-[10px] text-white/15 ml-auto font-medium">
              {user.totalTrades} trades
            </span>
          </div>
        </div>
      </div>

      {/* Propose button bar */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5">
        <button
          onClick={() => onPropose(match)}
          className="w-full py-2.5 rounded-xl text-xs font-semibold btn-cta active:scale-[0.97] transition-all duration-300"
        >
          Propose Trade
        </button>
      </div>
    </div>
  );
}
