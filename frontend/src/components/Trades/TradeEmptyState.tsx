import Link from "next/link";

interface TradeEmptyStateProps {
  hasFilters: boolean;
  hasWants: boolean;
  onClearFilters: () => void;
}

export default function TradeEmptyState({
  hasFilters,
  hasWants,
  onClearFilters,
}: TradeEmptyStateProps) {
  return (
    <div className="premium-card rounded-2xl py-20 px-6 text-center md:col-span-2">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] flex items-center justify-center mb-5">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/15"
        >
          <path d="M16 3h5v5" />
          <path d="M8 3H3v5" />
          <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
          <path d="m15 9 6-6" />
          <path d="M16 21h5v-5" />
          <path d="M8 21H3v-5" />
          <path d="M12 2v8.3a4 4 0 0 1-1.172 2.872L3 21" />
          <path d="m15 15 6 6" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white/45 mb-1">
        {hasFilters ? "No matches found" : "No trade matches yet"}
      </p>
      <p className="text-xs text-white/25 mb-5 max-w-xs mx-auto">
        {hasFilters
          ? "Try adjusting your search or filters"
          : hasWants
            ? "No other collectors have cards matching your want list right now"
            : "Add cards to your want list and mark collection cards as tradeable to find matches"}
      </p>
      {hasFilters ? (
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-[#5b9bff] hover:text-[#7db4ff] transition-colors px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
        >
          Clear all filters
        </button>
      ) : !hasWants ? (
        <Link
          href="/wants"
          className="inline-block text-xs font-semibold text-[#5b9bff] hover:text-[#7db4ff] transition-colors px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
        >
          Go to Want List
        </Link>
      ) : null}
    </div>
  );
}
