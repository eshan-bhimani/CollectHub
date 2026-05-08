"use client";

export type SortOption = "ending-soon" | "price-low" | "price-high" | "most-bids" | "best-deal";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "ending-soon", label: "Ending Soon" },
  { value: "price-low", label: "Price: Low" },
  { value: "price-high", label: "Price: High" },
  { value: "most-bids", label: "Most Bids" },
  { value: "best-deal", label: "Best Deal" },
];

const AUCTION_HOUSES = ["all", "Fanatics", "Goldin", "PWCC"];

interface AuctionControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: string;
  onFilterChange: (filter: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function AuctionControlBar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
}: AuctionControlBarProps) {
  return (
    <div className="sticky top-14 z-20 rounded-2xl border border-white/[0.12] bg-[#04122f]/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] p-3 sm:p-4 space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search players, sets, teams..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bid-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
        />
      </div>

      {/* Filters + Sort row */}
      <div className="flex items-center justify-between gap-3">
        {/* Auction house tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
          {AUCTION_HOUSES.map((house) => (
            <button
              key={house}
              onClick={() => onFilterChange(house)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                filter === house
                  ? "bg-white/12 text-white shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10"
                  : "text-white/35 hover:text-white/55 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {house === "all" ? "All" : house}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bid-input text-xs font-medium rounded-lg px-3 py-1.5"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
