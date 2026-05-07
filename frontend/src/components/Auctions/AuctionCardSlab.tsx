interface AuctionCardSlabProps {
  player: string;
  gradingCompany: "PSA" | "BGS" | "SGC" | "raw";
  grade: number;
  imageColor: string;
}

const companyConfig = {
  PSA: {
    label: "PSA",
    bg: "linear-gradient(135deg, #003DA5 0%, #0052cc 100%)",
    border: "rgba(0, 80, 200, 0.4)",
  },
  BGS: {
    label: "BECKETT",
    bg: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    border: "rgba(255, 255, 255, 0.15)",
  },
  SGC: {
    label: "SGC",
    bg: "linear-gradient(135deg, #8B6914 0%, #b8891f 100%)",
    border: "rgba(184, 137, 31, 0.4)",
  },
  raw: {
    label: "UNGRADED",
    bg: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 100%)",
    border: "rgba(255, 255, 255, 0.1)",
  },
};

export default function AuctionCardSlab({
  player,
  gradingCompany,
  grade,
  imageColor,
}: AuctionCardSlabProps) {
  const initials = player
    .split(" ")
    .map((w) => w[0])
    .join("");
  const company = companyConfig[gradingCompany];
  const isRaw = gradingCompany === "raw";

  return (
    <div className="slab-preview w-full aspect-[2.5/3.5] rounded-lg border border-white/[0.10] bg-[#070e1e] flex flex-col overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]">
      {/* Grading company header */}
      <div
        className="px-2 py-1.5 text-[7px] font-bold tracking-[0.15em] text-center uppercase text-white/90 flex-shrink-0"
        style={{ background: company.bg, borderBottom: `1px solid ${company.border}` }}
      >
        {company.label}
      </div>

      {/* Card face with holographic effect */}
      <div className="flex-1 relative mx-1.5 my-1 rounded-sm overflow-hidden">
        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${imageColor} 0%, ${imageColor}bb 40%, ${imageColor}66 70%, #0a1628 100%)`,
          }}
        />
        {/* Holographic overlay */}
        <div className="absolute inset-0 slab-holo opacity-60" />
        {/* Inner border */}
        <div className="absolute inset-0 border border-white/[0.08] rounded-sm" />
        {/* Initials */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black/20 border border-white/15 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-black text-white/60">{initials}</span>
          </div>
        </div>
      </div>

      {/* Grade badge */}
      <div className="flex-shrink-0 flex justify-center py-1.5">
        {!isRaw ? (
          <span
            className="px-3 py-0.5 rounded-full text-[9px] font-black text-white/90 border"
            style={{
              background: company.bg,
              borderColor: company.border,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
            }}
          >
            {grade}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-[9px] font-medium text-white/25">
            Raw
          </span>
        )}
      </div>
    </div>
  );
}
