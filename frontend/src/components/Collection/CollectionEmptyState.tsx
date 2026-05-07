interface CollectionEmptyStateProps {
  onAddCard: () => void;
}

export default function CollectionEmptyState({ onAddCard }: CollectionEmptyStateProps) {
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
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-white/45 mb-1">No cards yet</p>
      <p className="text-xs text-white/25 mb-5 max-w-xs mx-auto">
        Start building your portfolio by adding your first card
      </p>
      <button
        onClick={onAddCard}
        className="text-xs font-semibold btn-cta px-6 py-3 rounded-xl active:scale-[0.95] transition-all duration-300"
      >
        + Add Your First Card
      </button>
    </div>
  );
}
