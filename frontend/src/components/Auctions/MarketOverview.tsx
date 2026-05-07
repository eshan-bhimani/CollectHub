import type { AuctionListing } from "@/lib/mockAuctionApi";
import type { WantListItem } from "@/lib/collectionTypes";
import { matchWantListItems } from "@/lib/collectionStore";
import StatBlock from "@/components/Shared/StatBlock";
import SectionLabel from "@/components/Shared/SectionLabel";

function formatCompact(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n.toLocaleString()}`;
}

interface MarketOverviewProps {
  listings: AuctionListing[];
  wantList: WantListItem[];
}

export default function MarketOverview({ listings, wantList }: MarketOverviewProps) {
  const totalValue = listings.reduce((sum, l) => sum + l.currentBid, 0);
  const avgBid = listings.length > 0 ? Math.round(totalValue / listings.length) : 0;

  const wantMatchCount = listings.filter(
    (l) => matchWantListItems(l, wantList).length > 0
  ).length;

  const endingSoon = listings.filter((l) => {
    const diff = new Date(l.endsAt).getTime() - Date.now();
    return diff > 0 && diff < 2 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="workspace-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Market Overview</SectionLabel>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-400/60 uppercase tracking-wider">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        <StatBlock label="Active" value={listings.length} />
        <StatBlock label="Total Value" value={formatCompact(totalValue)} />
        <StatBlock label="Avg Bid" value={formatCompact(avgBid)} />
        <StatBlock
          label="Want Matches"
          value={wantMatchCount}
          accent={wantMatchCount > 0 ? "red" : "default"}
        />
        <StatBlock
          label="Ending Soon"
          value={endingSoon}
          accent={endingSoon > 0 ? "emerald" : "default"}
          className="col-span-2 sm:col-span-1"
        />
      </div>
    </div>
  );
}
