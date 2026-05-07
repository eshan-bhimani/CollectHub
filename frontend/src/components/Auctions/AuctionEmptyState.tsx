interface AuctionEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function AuctionEmptyState({ hasFilters, onClearFilters }: AuctionEmptyStateProps) {
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
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white/45 mb-1">No listings found</p>
      <p className="text-xs text-white/25 mb-5 max-w-xs mx-auto">
        {hasFilters
          ? "Try adjusting your search or filters to find what you're looking for"
          : "Check back soon for new auctions across all platforms"}
      </p>
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="text-xs font-semibold text-[#5b9bff] hover:text-[#7db4ff] transition-colors px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
