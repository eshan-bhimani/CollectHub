import type { WantListItem } from "@/lib/collectionTypes";

function formatUSD(price: number): string {
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface WantsCardProps {
  item: WantListItem;
  hasMatch: boolean;
  onEdit: (item: WantListItem) => void;
  onDelete: (id: string) => void;
}

export default function WantsCard({ item, hasMatch, onEdit, onDelete }: WantsCardProps) {
  return (
    <div
      className="premium-card rounded-2xl overflow-hidden"
      data-accent={hasMatch ? "good" : undefined}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white/90 truncate">{item.playerName}</h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                  hasMatch
                    ? "bg-emerald-500/12 border-emerald-500/25 text-emerald-400"
                    : "bg-white/[0.03] border-white/[0.06] text-white/25"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    hasMatch
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"
                      : "bg-white/15"
                  }`}
                />
                {hasMatch ? "Match found" : "No match"}
              </span>
            </div>

            <p className="text-[11px] text-white/35 truncate mt-0.5">
              {[item.year, item.brand, item.setName].filter(Boolean).join(" · ")}
              {item.condition.gradingCompany !== "raw"
                ? ` · ${item.condition.gradingCompany}${item.condition.grade != null ? ` ${item.condition.grade}+` : ""}`
                : " · Raw"}
            </p>

            {/* Price & date panel */}
            <div className="mt-3 data-panel rounded-xl p-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Max Price</p>
                  <p className="text-xs sm:text-sm font-bold text-white/55">{formatUSD(item.maxPrice)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-white/25">Added</p>
                  <p className="text-xs sm:text-sm font-bold text-white/35">
                    {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
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
      </div>
    </div>
  );
}
