"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CTASection() {
  return (
    <section className="relative z-10 px-4 py-12 sm:py-18">
      {/* Warm atmospheric glow behind CTA */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none" style={{
        background: "radial-gradient(ellipse at center, rgba(198, 139, 62, 0.06), rgba(200, 16, 46, 0.03) 50%, transparent 70%)",
        filter: "blur(60px)"
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative max-w-xl mx-auto glass-card rounded-3xl px-6 py-10 sm:px-10 sm:py-12 text-center"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-white/90">
          Ready to crop your collection?
        </h2>
        <p className="text-sm text-white/38 mt-3 max-w-sm mx-auto leading-relaxed">
          Upload a scan. Get a perfectly cropped, oriented card image in seconds.
        </p>
        <div className="mt-8">
          <Link
            href="/crop"
            className="btn-cta inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-sm sm:text-base font-bold tracking-wide"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-80"
            >
              <path d="M6 2v14a2 2 0 0 0 2 2h14" />
              <path d="M18 22V8a2 2 0 0 0-2-2H2" />
            </svg>
            Start Cropping
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
