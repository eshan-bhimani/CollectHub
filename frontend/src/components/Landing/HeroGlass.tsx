"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const workflowSteps = ["Upload", "AI crop", "Grade", "Auction"];

export default function HeroGlass() {
  return (
    <section className="hero-command relative z-10 overflow-hidden px-4 pt-24 pb-14 sm:pt-32 sm:pb-20">
      <div className="hero-card-grid" aria-hidden="true" />
      <div className="hero-stadium-lights hero-stadium-lights-left" aria-hidden="true" />
      <div className="hero-stadium-lights hero-stadium-lights-right" aria-hidden="true" />
      <div className="hero-command-red-glow" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58 shadow-[0_12px_34px_rgba(0,0,0,0.18)] lg:mx-0">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E] shadow-[0_0_18px_rgba(200,16,46,0.9)]" />
            CollectHub AI
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            className="text-balance text-4xl font-extrabold leading-[1.03] text-white sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            The AI Command Center for Baseball Card Collectors
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: "easeOut" }}
            className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/62 sm:text-lg lg:mx-0 lg:max-w-xl"
          >
            Crop, grade, track, auction, and manage your entire card collection in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: "easeOut" }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link
              href="/crop"
              className="btn-cta inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold tracking-normal shadow-[0_18px_38px_rgba(200,16,46,0.26)]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                <path d="M18 22V8a2 2 0 0 0-2-2H2" />
              </svg>
              Start Cropping
            </Link>
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.07] px-7 py-3.5 text-sm font-bold text-white/84 shadow-[0_18px_38px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.11] hover:text-white active:scale-[0.98]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Explore Auctions
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="mt-6 text-sm font-medium text-white/42"
          >
            Built for collectors, vendors, breakers, and auction houses
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[540px]"
        >
          <div className="hero-mockup-orbit" aria-hidden="true" />
          <div className="hero-product-shell rounded-[28px] p-3 sm:p-4">
            <div className="rounded-[22px] border border-white/10 bg-[#06193c]/82 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/38">
                    Live Workspace
                  </p>
                  <p className="mt-1 text-sm font-bold text-white/88">1952 Topps Intake</p>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[11px] font-bold text-emerald-200">
                  AI Ready
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_0.86fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/52">Upload queue</span>
                    <span className="text-[11px] text-white/34">3 of 12</span>
                  </div>

                  <div className="relative mx-auto aspect-[2.5/3.5] max-h-[286px] rounded-[18px] border border-white/14 bg-gradient-to-b from-[#eef3fb] via-[#e4ebf7] to-[#c8d4e8] p-3 shadow-[0_24px_55px_rgba(0,0,0,0.32)]">
                    <div className="h-[22%] rounded-xl border border-[#C8102E]/18 bg-white shadow-inner">
                      <div className="mx-auto mt-3 h-2 w-16 rounded-full bg-[#C8102E]/78" />
                      <div className="mx-auto mt-2 h-1.5 w-24 rounded-full bg-[#0b2b66]/20" />
                    </div>
                    <div className="mt-3 h-[70%] rounded-xl bg-gradient-to-br from-[#174f93] via-[#f7f3e8] to-[#8b2c38] p-3">
                      <div className="h-full rounded-lg border border-white/50 bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(255,255,255,0.24))] shadow-inner" />
                    </div>

                    <span className="crop-corner crop-corner-tl" />
                    <span className="crop-corner crop-corner-tr" />
                    <span className="crop-corner crop-corner-bl" />
                    <span className="crop-corner crop-corner-br" />
                    <motion.div
                      animate={{ y: [0, 205, 0] }}
                      transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute left-5 right-5 top-6 h-px bg-cyan-200/70 shadow-[0_0_18px_rgba(103,232,249,0.78)]"
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-cyan-200/12 bg-cyan-200/[0.07] px-3 py-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-cyan-100/78">Cloud upload</span>
                      <span className="text-cyan-100/58">78%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        animate={{ width: ["34%", "78%", "92%", "78%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full rounded-full bg-cyan-200"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/52">Graded slab</span>
                      <span className="rounded-md bg-[#C8102E] px-2 py-1 text-[10px] font-black text-white">
                        GEM 10
                      </span>
                    </div>
                    <div className="rounded-[18px] border border-white/14 bg-white/[0.08] p-2 shadow-[0_18px_38px_rgba(0,0,0,0.22)]">
                      <div className="rounded-xl bg-white p-2">
                        <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="h-5 rounded bg-[#e9eef7]" />
                          <div className="rounded bg-[#C8102E] px-2 py-1 text-[10px] font-black text-white">PSA</div>
                        </div>
                        <div className="aspect-[2.5/3.5] rounded-lg bg-gradient-to-br from-[#173e7a] via-[#f6efe3] to-[#8f2234]" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#C8102E]/20 bg-[#C8102E]/10 p-4 shadow-[0_18px_42px_rgba(200,16,46,0.12)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-100/56">
                      Auction-ready
                    </p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-3xl font-black text-white">$1,240</p>
                        <p className="mt-1 text-xs text-white/46">Estimated market value</p>
                      </div>
                      <span className="rounded-full border border-emerald-300/18 bg-emerald-300/12 px-2.5 py-1 text-[11px] font-bold text-emerald-200">
                        +18%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {workflowSteps.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: [0.46, 1, 0.46] }}
                    transition={{ duration: 3.6, delay: index * 0.42, repeat: Infinity }}
                    className="rounded-xl border border-white/8 bg-white/[0.045] px-2 py-2 text-center text-[11px] font-semibold text-white/58"
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
