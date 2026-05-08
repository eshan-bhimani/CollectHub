"use client";

export type TradeSortOption = "best-match" | "highest-value" | "highest-grade" | "priority";
export type TradeFilterOption = "all" | "exact" | "high-priority";

const SORT_OPTIONS: { value: TradeSortOption; label: string }[] = [
  { value: "best-match", label: "Best Match" },
  { value: "highest-value", label: "Highest Value" },
  { value: "highest-grade", label: "Highest Grade" },
  { value: "priority", label: "Priority" },
];

const FILTER_TABS: { value: TradeFilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "exact", label: "Exact Match" },
  { value: "high-priority", label: "High Priority" },
];

interface MatchControlBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: TradeFilterOption;
  onFilterChange: (filter: TradeFilterOption) => void;
  sortBy: TradeSortOption;
  onSortChange: (sort: TradeSortOption) => void;
}

export default function MatchControlBar({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
}: MatchControlBarProps) {
  return (
    <div className="sticky top-14 z-20 rounded-2xl border border-white/[0.12] bg-[#080e24]/85 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] p-3 sm:p-4 space-y-3">
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
          placeholder="Search by player name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bid-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
        />
      </div>

      {/* Filters + Sort row */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                filter === tab.value
                  ? "bg-white/12 text-white shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/10"
                  : "text-white/35 hover:text-white/55 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative flex-shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as TradeSortOption)}
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
