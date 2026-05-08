"use client";

import { motion } from "framer-motion";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  accentBorder: string;
  iconColor: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
      </svg>
    ),
    title: "PSA-Ready Framing",
    description: "Cards are automatically cropped to exact PSA Set Registry dimensions with precise border alignment.",
    accent: "rgba(200, 16, 46, 0.12)",
    accentBorder: "rgba(200, 16, 46, 0.16)",
    iconColor: "#e8354a",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        <path d="M21 3v5h-5" />
        <path d="M21 8l-4.35 3.26" />
      </svg>
    ),
    title: "Auto Orientation",
    description: "Smart rotation detection ensures every card is properly oriented — no manual adjustments needed.",
    accent: "rgba(198, 139, 62, 0.14)",
    accentBorder: "rgba(198, 139, 62, 0.18)",
    iconColor: "#c6a050",
  },
  {
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    title: "Vault Format Export",
    description: "One-click export to Fanatics Vault format with optimized resolution and metadata intact.",
    accent: "rgba(93, 164, 255, 0.12)",
    accentBorder: "rgba(93, 164, 255, 0.16)",
    iconColor: "#5da4ff",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const tileVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FeatureTiles() {
  return (
    <section className="relative z-10 px-4 py-12 sm:py-18">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <span className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, rgba(198, 159, 82, 0.4))" }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, rgba(198, 159, 82, 0.6), rgba(198, 139, 62, 0.2))" }} />
            <span className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, rgba(198, 159, 82, 0.4))" }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white/90">
            Everything You Need
          </h2>
          <p className="text-xs sm:text-sm text-white/38 mt-2">
            Professional tools for serious collectors
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={tileVariants}
              className="glass-card rounded-2xl p-5 sm:p-6 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-105"
                style={{
                  background: feature.accent,
                  border: `1px solid ${feature.accentBorder}`,
                  color: feature.iconColor,
                  boxShadow: `0 4px 16px ${feature.accent}`,
                }}
              >
                {feature.icon}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-white/88 mb-2">
                {feature.title}
              </h3>

              <p className="text-xs sm:text-sm text-white/40 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
