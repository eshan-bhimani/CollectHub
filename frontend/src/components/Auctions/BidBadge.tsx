import type { AuctionListing } from "@/lib/mockAuctionApi";
import type { PricingStrategy } from "@/lib/pricingStrategy";
import { evaluateBid, getBadgeLevel } from "@/lib/pricingStrategy";

interface BidBadgeProps {
  listing: AuctionListing;
  strategy: PricingStrategy;
}

const levelConfig = {
  good: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "Good deal",
  },
  "near-limit": {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
    dot: "bg-amber-400",
    label: "Near limit",
  },
  "over-budget": {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "Over budget",
  },
};

export default function BidBadge({ listing, strategy }: BidBadgeProps) {
  if (!strategy.enabled) return null;

  const evaluation = evaluateBid(
    listing.currentBid,
    listing.marketAvgPrice,
    listing.auctionHouse,
    strategy
  );
  const level = getBadgeLevel(
    evaluation.percentageFromAvg,
    strategy.bidThresholdPercent
  );
  const config = levelConfig[level];

  const pctLabel =
    evaluation.percentageFromAvg <= 0
      ? `${Math.abs(evaluation.percentageFromAvg)}% below`
      : `${evaluation.percentageFromAvg}% above`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${config.bg} ${config.border} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      <span className="opacity-70">&middot;</span>
      <span className="opacity-70">{pctLabel} market</span>
    </div>
  );
}
