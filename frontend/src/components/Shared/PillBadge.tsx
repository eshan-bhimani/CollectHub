interface PillBadgeProps {
  label: string;
  dotColor?: string;
  className?: string;
}

export default function PillBadge({ label, dotColor = "#C8102E", className = "" }: PillBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 shadow-[0_12px_34px_rgba(0,0,0,0.18)] backdrop-blur-sm ${className}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full pill-dot-pulse"
        style={{ background: dotColor, boxShadow: `0 0 18px ${dotColor}`, color: dotColor }}
      />
      {label}
    </div>
  );
}
