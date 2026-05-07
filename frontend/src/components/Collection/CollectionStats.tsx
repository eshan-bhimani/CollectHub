import type { CollectionItem } from "@/lib/collectionTypes";
import StatBlock from "@/components/Shared/StatBlock";
import SectionLabel from "@/components/Shared/SectionLabel";

function formatCompact(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return `$${n.toLocaleString()}`;
}

interface CollectionStatsProps {
  collection: CollectionItem[];
  resolvedValues: Record<string, number | null>;
}

export default function CollectionStats({ collection, resolvedValues }: CollectionStatsProps) {
  const totalCards = collection.length;
  const totalCost = collection.reduce((sum, item) => sum + item.purchasePrice, 0);

  let totalCurrentValue = 0;
  let valuedCount = 0;
  collection.forEach((item) => {
    const val = resolvedValues[item.id];
    if (val != null) {
      totalCurrentValue += val;
      valuedCount++;
    }
  });

  const totalPL = valuedCount > 0 ? totalCurrentValue - collection
    .filter((item) => resolvedValues[item.id] != null)
    .reduce((sum, item) => sum + item.purchasePrice, 0) : null;

  const forTradeCount = collection.filter((item) => item.forTrade).length;

  return (
    <div className="workspace-shell rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <SectionLabel>Portfolio Overview</SectionLabel>
        <span className="text-[10px] font-medium text-white/20 uppercase tracking-wider">
          {valuedCount}/{totalCards} valued
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <StatBlock label="Total Cards" value={totalCards} />
        <StatBlock label="Total Cost" value={formatCompact(totalCost)} />
        <StatBlock
          label="P / L"
          value={totalPL != null ? `${totalPL >= 0 ? "+" : ""}${formatCompact(totalPL)}` : "—"}
          accent={totalPL != null ? (totalPL >= 0 ? "emerald" : "red") : "default"}
        />
        <StatBlock
          label="For Trade"
          value={forTradeCount}
          accent={forTradeCount > 0 ? "emerald" : "default"}
        />
      </div>
    </div>
  );
}
