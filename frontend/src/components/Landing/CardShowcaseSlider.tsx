"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface CardEntry {
  name: string;
  team: string;
  year: string;
  set: string;
  grade: number;
  gradeLabel: string;
  color: string;
}

const STAR_CARDS: CardEntry[] = [
  {
    name: "Shohei Ohtani",
    team: "LAD",
    year: "2018",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#005A9C",
  },
  {
    name: "Mike Trout",
    team: "LAA",
    year: "2011",
    set: "Topps Update",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#BA0021",
  },
  {
    name: "Ronald Acuña Jr.",
    team: "ATL",
    year: "2018",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#CE1141",
  },
  {
    name: "Mookie Betts",
    team: "LAD",
    year: "2014",
    set: "Bowman Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#005A9C",
  },
  {
    name: "Aaron Judge",
    team: "NYY",
    year: "2017",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#003087",
  },
  {
    name: "Juan Soto",
    team: "NYM",
    year: "2018",
    set: "Topps Update",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#002D72",
  },
  {
    name: "Bryce Harper",
    team: "PHI",
    year: "2012",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#E81828",
  },
  {
    name: "Fernando Tatis Jr.",
    team: "SD",
    year: "2019",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#2F241D",
  },
  {
    name: "Julio Rodríguez",
    team: "SEA",
    year: "2022",
    set: "Topps Series 1",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#005C5C",
  },
  {
    name: "Freddie Freeman",
    team: "LAD",
    year: "2011",
    set: "Topps Update",
    grade: 9,
    gradeLabel: "Mint",
    color: "#005A9C",
  },
  {
    name: "Corbin Carroll",
    team: "ARI",
    year: "2023",
    set: "Topps Chrome",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#A71930",
  },
  {
    name: "Bobby Witt Jr.",
    team: "KC",
    year: "2022",
    set: "Topps Series 1",
    grade: 10,
    gradeLabel: "Gem Mint",
    color: "#004687",
  },
];

function CardPlaceholder({ card, index }: { card: CardEntry; index: number }) {
  const initials = card.name
    .split(" ")
    .map((w) => w[0])
    .join("");

  return (
    <div className="relative w-[200px] h-[280px] sm:w-[220px] sm:h-[308px] rounded-xl overflow-hidden flex-shrink-0">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(160deg, ${card.color} 0%, ${card.color}dd 40%, #0a1628 100%)`,
        }}
      />
      <div className="absolute inset-[3px] rounded-lg border border-white/[0.06]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
          animation: `shimmerCard${index} 3s ease-in-out infinite`,
        }}
      />
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/70 tracking-wider uppercase">
          {card.set}
        </span>
        <span className="text-[10px] font-bold text-white/50">{card.year}</span>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-black text-white/60">
            {initials}
          </span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-6 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white font-bold text-sm sm:text-base leading-tight truncate">
          {card.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-white/50 text-[11px] font-medium">
            {card.team}
          </span>
          <span className="grade-badge">
            {card.grade} {card.gradeLabel}
          </span>
        </div>
        <span className="mt-1 inline-block text-[9px] text-white/30 tracking-wide uppercase">
          Cropped + Oriented
        </span>
      </div>
    </div>
  );
}

export default function CardShowcaseSlider() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="relative z-10 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto"
      >
        {/* Section header */}
        <div className="text-center mb-6 px-4">
          <h2 className="text-lg sm:text-xl font-bold text-white/90">
            Premium Card Showcase
          </h2>
          <p className="text-xs sm:text-sm text-white/40 mt-1">
            Star player cards, auto-cropped and graded
          </p>
        </div>

        {/* Dashboard frame */}
        <div
          className="glass-card rounded-2xl py-6 sm:py-8 mx-4 overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 z-10 bg-gradient-to-r from-black/40 to-transparent rounded-l-2xl" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 z-10 bg-gradient-to-l from-black/40 to-transparent rounded-r-2xl" />

          {/* Marquee track — two identical sets side by side, CSS-animated */}
          <div
            className="marquee-track"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {/* First set */}
            {STAR_CARDS.map((card, i) => (
              <div key={`a-${card.name}`} className="flex-shrink-0">
                <CardPlaceholder card={card} index={i} />
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {STAR_CARDS.map((card, i) => (
              <div key={`b-${card.name}`} className="flex-shrink-0">
                <CardPlaceholder card={card} index={i} />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
