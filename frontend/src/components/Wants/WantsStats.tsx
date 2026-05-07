import type { WantListItem } from "@/lib/collectionTypes";
import type { AuctionListing } from "@/lib/mockAuctionApi";
import { matchWantListItems } from "@/lib/collectionStore";
import StatBlock from "@/components/Shared/StatBlock";
import SectionLabel from "@/components/Shared/SectionLabel";

interface WantsStatsProps {
  wantList: WantListItem[];
  listings: AuctionListing[];
}

export default function WantsStats({ wantList, listings }: WantsStatsProps) {
  const totalWants = wantList.length;
  const highPriority = wantList.filter((w) => w.priority === "high").length;

  const activeMatches = wantList.filter((want) =>
    listings.some((listing) => matchWantListItems(listing, [want]).length > 0)
  ).length;

  const totalBudget = wantList.reduce((sum, w) => sum + w.maxPrice, 0);

  return (
    <div className="workspace-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Acquisition Overview</SectionLabel>
        {activeMatches > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">
              {activeMatches} match{activeMatches !== 1 ? "es" : ""}
            </span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <StatBlock label="Total Wants" value={totalWants} />
        <StatBlock
          label="Active Matches"
          value={activeMatches}
          accent={activeMatches > 0 ? "emerald" : "default"}
        />
        <StatBlock
          label="High Priority"
          value={highPriority}
          accent={highPriority > 0 ? "red" : "default"}
        />
        <StatBlock
          label="Total Budget"
          value={totalBudget >= 1000 ? `$${(totalBudget / 1000).toFixed(totalBudget >= 10000 ? 0 : 1)}k` : `$${totalBudget}`}
        />
      </div>
    </div>
  );
}
