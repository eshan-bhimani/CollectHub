"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroGlass from "@/components/Landing/HeroGlass";
import BaseballFieldBg from "@/components/Landing/BaseballFieldBg";
import CardShowcaseSlider from "@/components/Landing/CardShowcaseSlider";
import FeatureTiles from "@/components/Landing/FeatureTiles";
import CTASection from "@/components/Landing/CTASection";

export default function Home() {
  return (
    <div className="bg-landing min-h-dvh noise-overlay vignette">
      <BaseballFieldBg />

      {/* Haze depth layers */}
      <div className="haze-upper" />
      <div className="haze-mid" />
      <div className="haze-lower" />

      {/* Cool ambient glows */}
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-blue-bottom" />
      <div className="glow-blob glow-blob-ambient" />
      <div className="glow-blob glow-blob-upper-right" />
      <div className="glow-blob glow-blob-deep-bottom" />

      {/* Warm ambient glows — cinematic atmosphere */}
      <div className="glow-blob glow-blob-amber" />
      <div className="glow-blob glow-blob-warm-lower" />
      <div className="glow-blob glow-blob-golden-mist" />
      <div className="glow-blob glow-blob-red" />

      {/* Layered spotlights */}
      <div className="hero-spotlight-tertiary" />
      <div className="hero-spotlight" />
      <div className="hero-spotlight-secondary" />

      {/* Hero */}
      <HeroGlass />

      {/* Card showcase slider */}
      <CardShowcaseSlider />

      {/* Feature tiles */}
      <FeatureTiles />

      {/* Auctions Preview Section */}
      <section className="relative z-10 px-4 py-12 sm:py-18">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <span className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, rgba(198, 159, 82, 0.4))" }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "radial-gradient(circle, rgba(198, 159, 82, 0.6), rgba(198, 139, 62, 0.2))" }} />
              <span className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, rgba(198, 159, 82, 0.4))" }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white/90">
              Auction Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-white/38 mt-2 max-w-md mx-auto">
              Track prices and bid on cards across Fanatics, Goldin &amp; PWCC
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Live Price Tracking",
                description: "Monitor real-time auction prices across multiple platforms with instant alerts.",
                accent: "rgba(198, 139, 62, 0.15)",
                accentBorder: "rgba(198, 139, 62, 0.18)",
                iconColor: "#c6a050",
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
                title: "Smart Bidding",
                description: "Set maximum bids and let our system automatically compete for you at the best price.",
                accent: "rgba(200, 16, 46, 0.12)",
                accentBorder: "rgba(200, 16, 46, 0.16)",
                iconColor: "#e8354a",
              },
              {
                icon: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                ),
                title: "Market Analytics",
                description: "Historical price data and trend analysis to inform your collecting strategy.",
                accent: "rgba(93, 164, 255, 0.12)",
                accentBorder: "rgba(93, 164, 255, 0.16)",
                iconColor: "#5da4ff",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
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
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-2.5 rounded-2xl px-7 py-3 text-sm font-bold glass-card text-white/75 hover:text-white transition-all duration-300 active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Browse Live Auctions
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <CTASection />

      {/* Footer */}
      <footer className="relative z-10 px-4 pb-10 pt-4">
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-14" style={{ background: "linear-gradient(to right, transparent, rgba(198, 159, 82, 0.25))" }} />
          <p className="text-[11px] tracking-[0.2em] uppercase font-medium text-white/25">
            CollectHub &middot; Baseball Card Tools
          </p>
          <span className="h-px w-14" style={{ background: "linear-gradient(to left, transparent, rgba(198, 159, 82, 0.25))" }} />
        </div>
      </footer>
    </div>
  );
}
