import type { CollectionItem } from "@/lib/collectionTypes";
import AuctionCardSlab from "@/components/Auctions/AuctionCardSlab";

function formatCompact(price: number): string {
  return price >= 1000
    ? `$${(price / 1000).toFixed(price >= 10000 ? 0 : 1)}k`
    : `$${price.toLocaleString()}`;
}

const COMPANY_COLORS: Record<string, string> = {
  PSA: "#003DA5",
  BGS: "#1a1a1a",
  SGC: "#8B6914",
  raw: "#1a3a5c",
};

interface CollectionCardProps {
  item: CollectionItem;
  currentValue: number | null;
  onEdit: (item: CollectionItem) => void;
  onDelete: (id: string) => void;
}

export default function CollectionCard({ item, currentValue, onEdit, onDelete }: CollectionCardProps) {
  const profitLoss = currentValue != null ? currentValue - item.purchasePrice : null;
  const imageColor = COMPANY_COLORS[item.condition.gradingCompany] ?? "#1a3a5c";
  const accent = profitLoss != null ? (profitLoss >= 0 ? "good" : "danger") : undefined;

  return (
    <div
      className="premium-card rounded-2xl overflow-hidden"
      data-accent={accent}
    >
      <div className="p-4 sm:p-5 flex gap-4">
        {/* Slab preview */}
        <div className="w-[80px] sm:w-[100px] flex-shrink-0">
          <AuctionCardSlab
            player={item.playerName}
            gradingCompany={item.condition.gradingCompany}
            grade={item.condition.grade ?? 0}
            imageColor={imageColor}
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white/90 truncate">{item.playerName}</h3>
                {item.forTrade && (
                  <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex-shrink-0 uppercase tracking-wider">
                    Trade
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/35 truncate mt-0.5">
                {[item.year, item.brand, item.setName].filter(Boolean).join(" · ")}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white/25 hover:text-white/55 hover:border-white/[0.12] transition-all duration-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white/25 hover:text-red-400 hover:border-red-500/20 transition-all duration-200"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>

          {item.certNumber && (
            <p className="text-[10px] text-white/15 mt-0.5 font-medium">Cert #{item.certNumber}</p>
          )}

          {/* Price grid */}
          <div className="mt-3 data-panel rounded-xl p-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Purchased</p>
                <p className="text-xs sm:text-sm font-bold text-white/55">{formatCompact(item.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Value</p>
                {currentValue != null ? (
                  <p className="text-xs sm:text-sm font-bold text-white/55">{formatCompact(currentValue)}</p>
                ) : (
                  <p className="text-xs text-white/15 italic">—</p>
                )}
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">P/L</p>
                {profitLoss != null ? (
                  <p className={`text-xs sm:text-sm font-bold ${profitLoss >= 0 ? "text-emerald-400 stat-value-glow-emerald" : "text-red-400 stat-value-glow-red"}`}>
                    {profitLoss >= 0 ? "+" : ""}{formatCompact(profitLoss)}
                  </p>
                ) : (
                  <p className="text-xs text-white/15 italic">—</p>
                )}
              </div>
            </div>
          </div>

          {item.notes && (
            <p className="text-[10px] text-white/15 mt-2.5 truncate italic">{item.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
