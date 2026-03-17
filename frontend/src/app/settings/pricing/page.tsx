"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  type PricingStrategy,
  type PriceSource,
  loadStrategy,
  saveStrategy,
  PLATFORM_LIST,
} from "@/lib/pricingStrategy";

export default function PricingSettingsPage() {
  const [strategy, setStrategy] = useState<PricingStrategy>({
    enabled: true,
    bidThresholdPercent: 0,
    priceSource: "VCP",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStrategy(loadStrategy());
  }, []);

  const handleSave = () => {
    saveStrategy(strategy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const thresholdLabel =
    strategy.bidThresholdPercent === 0
      ? "At market average"
      : strategy.bidThresholdPercent > 0
        ? `${strategy.bidThresholdPercent}% above market`
        : `${Math.abs(strategy.bidThresholdPercent)}% below market`;

  return (
    <div className="bg-landing min-h-dvh flex flex-col noise-overlay vignette relative overflow-hidden">
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-4 pt-6 pb-2"
      >
        <div className="max-w-xl mx-auto">
          <Link
            href="/auctions"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm mb-3 group"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-200"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Auctions
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            <span className="text-white">Pricing</span>{" "}
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              Strategy
            </span>
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Configure how much you&apos;re willing to pay relative to market
            averages
          </p>
        </div>
      </motion.header>

      <main className="relative z-10 flex-1 px-4 py-6">
        <div className="max-w-xl mx-auto space-y-5">
          {/* Enable/Disable Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white/90">
                  Strategy Status
                </h2>
                <p className="text-xs text-white/40 mt-0.5">
                  Enable to evaluate bids against market prices
                </p>
              </div>
              <button
                onClick={() =>
                  setStrategy((s) => ({ ...s, enabled: !s.enabled }))
                }
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  strategy.enabled
                    ? "bg-emerald-500/60 border border-emerald-400/40"
                    : "bg-white/10 border border-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${
                    strategy.enabled
                      ? "left-[26px] bg-emerald-400"
                      : "left-0.5 bg-white/40"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Bid Threshold Slider */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="glass-card rounded-xl p-5"
          >
            <h2 className="text-sm font-semibold text-white/90 mb-1">
              Bid Threshold
            </h2>
            <p className="text-xs text-white/40 mb-4">
              How far from the average market price you&apos;re willing to pay
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">-30%</span>
                <span
                  className={`text-sm font-bold ${
                    strategy.bidThresholdPercent < 0
                      ? "text-emerald-400"
                      : strategy.bidThresholdPercent > 0
                        ? "text-amber-400"
                        : "text-white/70"
                  }`}
                >
                  {thresholdLabel}
                </span>
                <span className="text-xs text-white/30">+30%</span>
              </div>

              <input
                type="range"
                min={-30}
                max={30}
                step={1}
                value={strategy.bidThresholdPercent}
                onChange={(e) =>
                  setStrategy((s) => ({
                    ...s,
                    bidThresholdPercent: parseInt(e.target.value),
                  }))
                }
                className="pricing-slider w-full"
              />

              <div className="flex justify-between text-[10px] text-white/20">
                <span>Bargains only</span>
                <span>Market price</span>
                <span>Willing to pay more</span>
              </div>
            </div>
          </motion.div>

          {/* Price Source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass-card rounded-xl p-5"
          >
            <h2 className="text-sm font-semibold text-white/90 mb-1">
              Price Source
            </h2>
            <p className="text-xs text-white/40 mb-4">
              Which market data source to use for average prices
            </p>

            <div className="flex gap-2">
              {(["VCP", "CardLadder"] as PriceSource[]).map((source) => (
                <button
                  key={source}
                  onClick={() => setStrategy((s) => ({ ...s, priceSource: source }))}
                  className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    strategy.priceSource === source
                      ? "bg-white/12 text-white border border-white/20 shadow-sm"
                      : "glass text-white/40 hover:text-white/60 hover:bg-white/[0.08]"
                  }`}
                >
                  <span className="block font-semibold">{source}</span>
                  <span className="block text-[10px] mt-0.5 opacity-60">
                    {source === "VCP"
                      ? "Best for pre-1980 graded"
                      : "All eras, graded & raw"}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Buyer's Premiums (read-only) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="glass-card rounded-xl p-5"
          >
            <h2 className="text-sm font-semibold text-white/90 mb-1">
              Buyer&apos;s Premiums
            </h2>
            <p className="text-xs text-white/40 mb-4">
              Platform fees automatically factored into true cost calculations
            </p>

            <div className="space-y-2">
              {PLATFORM_LIST.map(({ name, rate, displayRate }) => (
                <div
                  key={name}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                >
                  <span className="text-xs text-white/60">{name}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#003DA5]/50 to-[#C8102E]/50"
                      style={{ width: `${rate * 300}px` }}
                    />
                    <span className="text-xs font-semibold text-white/70 w-8 text-right">
                      {displayRate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <button
              onClick={handleSave}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.97] ${
                saved
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/30"
                  : "btn-cta"
              }`}
            >
              {saved ? "Saved!" : "Save Strategy"}
            </button>
          </motion.div>
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <p className="text-center text-white/20 text-xs">
          CollectHub &middot; Pricing Strategy Settings
        </p>
      </motion.footer>
    </div>
  );
}
