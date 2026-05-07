interface StatBlockProps {
  label: string;
  value: string | number;
  accent?: "default" | "red" | "emerald";
  trend?: string;
  className?: string;
}

const accentMap = {
  default: {
    container: "rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 sm:p-4",
    glow: "stat-value-glow",
    valueColor: "text-white/88",
  },
  red: {
    container: "rounded-xl border border-[#C8102E]/25 bg-gradient-to-br from-[#C8102E]/12 to-[#C8102E]/4 p-3 sm:p-4",
    glow: "stat-value-glow-red",
    valueColor: "text-white/88",
  },
  emerald: {
    container: "rounded-xl border border-emerald-400/25 bg-gradient-to-br from-emerald-400/12 to-emerald-400/4 p-3 sm:p-4",
    glow: "stat-value-glow-emerald",
    valueColor: "text-white/88",
  },
};

export default function StatBlock({ label, value, accent = "default", trend, className = "" }: StatBlockProps) {
  const config = accentMap[accent];
  return (
    <div className={`${config.container} ${className}`}>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-white/38">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <p className={`text-lg sm:text-xl font-black ${config.valueColor} ${config.glow}`}>{value}</p>
        {trend && (
          <span className="rounded-full border border-emerald-300/20 bg-emerald-300/12 px-2 py-0.5 text-[10px] font-bold text-emerald-200 mb-0.5">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
