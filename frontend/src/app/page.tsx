"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import HeroGlass from "@/components/Landing/HeroGlass";
import CardShowcaseSlider from "@/components/Landing/CardShowcaseSlider";
import FeatureTiles from "@/components/Landing/FeatureTiles";
import CTASection from "@/components/Landing/CTASection";

export default function Home() {
  return (
    <div className="bg-landing min-h-dvh noise-overlay vignette">
      {/* Ambient glow blobs — soft floating light sources */}
      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />
      <div className="glow-blob glow-blob-ambient" />

      {/* Focused spotlight behind the hero card */}
      <div className="hero-spotlight" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-4 pt-5"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-lg font-extrabold tracking-tight">
            <span className="text-white">Collect</span>
            <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
              Hub
            </span>
          </span>
          <div className="flex items-center gap-6">
            <Link href="/crop" className="nav-link text-sm font-medium">
              Crop Tool
            </Link>
            <Link href="/auctions" className="nav-link text-sm font-medium">
              Auctions
            </Link>
            <Link href="/collection" className="nav-link text-sm font-medium">
              Collection
            </Link>
            <Link href="/wants" className="nav-link text-sm font-medium">
              Wants
            </Link>
            <Link href="/settings/pricing" className="nav-link text-sm font-medium">
              Pricing
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <HeroGlass />

      {/* Card showcase slider */}
      <CardShowcaseSlider />

      {/* Feature tiles */}
      <FeatureTiles />

      {/* Auctions Preview Section */}
      <section className="relative z-10 px-4 py-10 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl font-bold text-white/90">
              Auction Intelligence
            </h2>
            <p className="text-xs sm:text-sm text-white/40 mt-1">
              Track prices and bid on cards across Fanatics, Goldin &amp; PWCC
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: "Live Price Tracking",
                description:
                  "Monitor real-time auction prices across multiple platforms with instant alerts.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ),
                title: "Smart Bidding",
                description:
                  "Set maximum bids and let our system automatically compete for you at the best price.",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20V10" />
                    <path d="M18 20V4" />
                    <path d="M6 20v-4" />
                  </svg>
                ),
                title: "Market Analytics",
                description:
                  "Historical price data and trend analysis to inform your collecting strategy.",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="glass-card rounded-xl p-5 sm:p-6 group hover:bg-white/[0.08] transition-colors duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-[#003DA5]/15 border border-[#003DA5]/20 flex items-center justify-center text-[#5b9bff] mb-4 group-hover:bg-[#003DA5]/25 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-white/90 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/45 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/auctions"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold glass-hero hover:bg-white/10 text-white/80 hover:text-white transition-all duration-300 active:scale-[0.97]"
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
      <footer className="relative z-10 px-4 pb-8 pt-4">
        <p className="text-center text-white/20 text-xs">
          CollectHub &middot; Baseball Card Tools
        </p>
      </footer>
    </div>
  );
}
