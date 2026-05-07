interface WantsEmptyStateProps {
  onAddWant: () => void;
}

export default function WantsEmptyState({ onAddWant }: WantsEmptyStateProps) {
  return (
    <div className="premium-card rounded-2xl py-20 px-6 text-center">
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
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white/45 mb-1">No wants yet</p>
      <p className="text-xs text-white/25 mb-5 max-w-xs mx-auto">
        Add cards you&apos;re looking for and we&apos;ll match them against live auctions
      </p>
      <button
        onClick={onAddWant}
        className="text-xs font-semibold btn-cta px-6 py-3 rounded-xl active:scale-[0.95] transition-all duration-300"
      >
        + Add Your First Want
      </button>
    </div>
  );
}
