"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ShipmentTracker from "@/components/ShipmentTracker";

export default function ShipmentsPage() {
  return (
    <div className="bg-landing min-h-dvh flex flex-col noise-overlay vignette relative overflow-hidden">
      <div className="haze-upper" />
      <div className="haze-mid" />
      <div className="haze-lower" />

      <div className="glow-blob glow-blob-blue" />
      <div className="glow-blob glow-blob-red" />
      <div className="glow-blob glow-blob-blue-bottom" />
      <div className="glow-blob glow-blob-ambient" />
      <div className="glow-blob glow-blob-upper-right" />
      <div className="glow-blob glow-blob-deep-bottom" />

      <div className="hero-spotlight-tertiary" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 px-4 pt-6 pb-2"
      >
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
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
            Back
          </Link>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 shadow-[0_12px_34px_rgba(0,0,0,0.18)] mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E] shadow-[0_0_18px_rgba(200,16,46,0.9)]" />
              Live Tracking
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              <span className="text-white">Shipment</span>{" "}
              <span className="bg-gradient-to-r from-[#C8102E] to-[#e8354a] bg-clip-text text-transparent">
                Tracking
              </span>
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Track your cards from auction house to vault
            </p>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 py-6 flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4 flex-1">
          <ShipmentTracker />
          <div className="flex-1" />
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 px-4 pb-6 pt-2"
      >
        <div className="flex items-center justify-center gap-3">
          <span
            className="h-px w-12"
            style={{
              background: "linear-gradient(to right, transparent, #7a8494)",
            }}
          />
          <p
            className="text-xs tracking-widest uppercase font-medium"
            style={{ color: "#6a7484" }}
          >
            CollectHub &middot; Baseball Card Tools
          </p>
          <span
            className="h-px w-12"
            style={{
              background: "linear-gradient(to left, transparent, #7a8494)",
            }}
          />
        </div>
      </motion.footer>
    </div>
  );
}
