import type { WantListItem } from "@/lib/collectionTypes";

const priorityConfig = {
  high: {
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    text: "text-red-400",
  },
  medium: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    text: "text-amber-400",
  },
  low: {
    bg: "bg-white/8",
    border: "border-white/15",
    text: "text-white/50",
  },
};

export default function WantMatchBadge({ item }: { item: WantListItem }) {
  const config = priorityConfig[item.priority];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold border ${config.bg} ${config.border} ${config.text}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] shadow-[0_0_8px_rgba(200,16,46,0.6)]" />
      <span>Want match</span>
      <span className="opacity-70">&middot;</span>
      <span className="opacity-70">{item.priority}</span>
    </div>
  );
}
