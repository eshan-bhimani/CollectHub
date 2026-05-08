"use client";

import type { TradeMatch } from "@/lib/tradeTypes";
import type { CollectionItem } from "@/lib/collectionTypes";
import SectionLabel from "@/components/Shared/SectionLabel";
import StatBlock from "@/components/Shared/StatBlock";

interface TradeOverviewProps {
  matches: TradeMatch[];
  collection: CollectionItem[];
}

export default function TradeOverview({ matches, collection }: TradeOverviewProps) {
  const exactMatches = matches.filter((m) => m.matchScore >= 85).length;
  const highPriority = matches.filter((m) => m.myWant.priority === "high").length;
  const tradeable = collection.filter((c) => c.forTrade).length;

  return (
    <div className="workspace-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Match Overview</SectionLabel>
        <div className="flex items-center gap-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#5b9bff] shadow-[0_0_8px_rgba(91,155,255,0.5)] pill-dot-pulse"
            style={{ color: "#5b9bff" }}
          />
          <span className="text-[10px] font-medium text-[#5b9bff]/60 uppercase tracking-wider">
            Scanning
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <StatBlock label="Total Matches" value={matches.length} />
        <StatBlock label="Exact Matches" value={exactMatches} accent="emerald" />
        <StatBlock label="High Priority" value={highPriority} accent="red" />
        <StatBlock label="Tradeable Cards" value={tradeable} />
      </div>
    </div>
  );
}
