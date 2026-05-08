/**
 * BaseballFieldBg
 *
 * Absolute-positioned SVG background: overhead baseball field
 * (diamond, grass, foul lines) with crowd silhouettes along the
 * outfield wall. Purely decorative — aria-hidden.
 */

// Outfield wall arc: parabola peaking at center top
// x=720 → y=100, x=75 or x=1365 → y=255
function wallY(x: number): number {
  const t = (x - 720) / 645;
  return 255 - 155 * (1 - t * t);
}

// Build a bumpy crowd-silhouette path that follows the wall arc
function crowdRowPath(
  rowOffset: number,  // px above the wall arc baseline
  headH: number,      // head bump height
  spacing: number,    // horizontal spacing between people
): string {
  const xStart = 72;
  const xEnd = 1368;
  const bodyH = 30;   // how far below arc the row extends
  const pts: string[] = [];

  pts.push(`M ${xStart} ${wallY(xStart) + bodyH}`);
  pts.push(`L ${xStart} ${wallY(xStart) - rowOffset}`);

  for (let x = xStart; x < xEnd - spacing / 2; x += spacing) {
    const cx = x + spacing / 2;
    const nextX = Math.min(x + spacing, xEnd);
    const baseY = wallY(cx) - rowOffset;

    pts.push(`L ${x} ${wallY(x) - rowOffset + 3}`);
    // Left shoulder → head
    pts.push(`Q ${cx - spacing * 0.3} ${baseY + 3} ${cx - spacing * 0.15} ${baseY - headH * 0.4}`);
    // Head top arc
    pts.push(`Q ${cx} ${baseY - headH} ${cx + spacing * 0.15} ${baseY - headH * 0.4}`);
    // Head → right shoulder
    pts.push(`Q ${cx + spacing * 0.3} ${baseY + 3} ${nextX} ${wallY(nextX) - rowOffset + 3}`);
  }

  pts.push(`L ${xEnd} ${wallY(xEnd) - rowOffset}`);
  pts.push(`L ${xEnd} ${wallY(xEnd) + bodyH}`);
  pts.push("Z");

  return pts.join(" ");
}

const CROWD_ROWS = [
  { offset: 0,   headH: 20, fill: "#2e4878", opacity: 0.85 },
  { offset: 27,  headH: 19, fill: "#28406e", opacity: 0.75 },
  { offset: 52,  headH: 18, fill: "#223864", opacity: 0.62 },
  { offset: 76,  headH: 17, fill: "#1c305a", opacity: 0.46 },
  { offset: 99,  headH: 16, fill: "#162850", opacity: 0.30 },
];

export default function BaseballFieldBg() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      style={{ zIndex: 2, opacity: 0.32 }}
      aria-hidden="true"
    >
      {/* ── Outfield grass ── */}
      <path
        d="M 72 255 Q 720 100 1368 255 L 1440 900 L 0 900 Z"
        fill="#0e3420"
      />

      {/* ── Warning track (dark brown ring just inside the wall) ── */}
      <path
        d="M 100 248 Q 720 110 1340 248"
        stroke="#2a1506"
        strokeWidth="30"
        fill="none"
      />

      {/* ── Foul territory grass corners ── */}
      <path d="M 72 255 L 0 255 L 0 900 L 200 900 L 720 820 Z" fill="#0c2e1a" opacity="0.6" />
      <path d="M 1368 255 L 1440 255 L 1440 900 L 1240 900 L 720 820 Z" fill="#0c2e1a" opacity="0.6" />

      {/* ── Infield dirt circle ── */}
      <ellipse cx="720" cy="650" rx="272" ry="210" fill="#2e1a08" />

      {/* ── Infield grass ── */}
      <ellipse cx="720" cy="635" rx="210" ry="163" fill="#0e3420" />

      {/* ── Foul lines ── */}
      <line x1="720" y1="820" x2="72"   y2="255" stroke="#d8c87e" strokeWidth="3" opacity="0.60" />
      <line x1="720" y1="820" x2="1368" y2="255" stroke="#d8c87e" strokeWidth="3" opacity="0.60" />

      {/* ── Base diamond (perspective: home bottom, 2nd top) ── */}
      <polygon
        points="720,820  908,618  720,416  532,618"
        fill="#1e1006"
        stroke="#d8c87e"
        strokeWidth="3.5"
        strokeOpacity="0.65"
      />

      {/* ── Pitcher's mound ── */}
      <ellipse cx="720" cy="618" rx="24" ry="16" fill="#321e08" />
      <rect x="712" y="614" width="16" height="7" rx="1.5" fill="#d8c87e" opacity="0.55" />

      {/* ── Bases ── */}
      {/* 2nd base */}
      <rect x="712" y="408" width="16" height="16" rx="2" fill="#f0e4c4" />
      {/* 1st base */}
      <rect x="900" y="610" width="16" height="16" rx="2" fill="#f0e4c4" />
      {/* 3rd base */}
      <rect x="524" y="610" width="16" height="16" rx="2" fill="#f0e4c4" />
      {/* Home plate */}
      <polygon points="720,836 738,820 720,804 702,820" fill="#f0e4c4" />

      {/* ── Outfield wall ── */}
      <path
        d="M 72 255 Q 720 100 1368 255"
        stroke="#3a70d0"
        strokeWidth="10"
        fill="none"
        opacity="0.70"
      />

      {/* ── Crowd silhouette rows (above the outfield wall) ── */}
      {CROWD_ROWS.map(({ offset, headH, fill, opacity }, i) => (
        <path
          key={i}
          d={crowdRowPath(offset, headH, 24)}
          fill={fill}
          opacity={opacity}
        />
      ))}
    </svg>
  );
}
