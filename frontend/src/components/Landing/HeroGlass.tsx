"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const workflowSteps = [
  { label: "Upload", icon: "↑" },
  { label: "AI Crop", icon: "◎" },
  { label: "Grade", icon: "★" },
  { label: "Auction", icon: "◆" },
];

export default function HeroGlass() {
  return (
    <section className="hero-command relative z-10 overflow-hidden px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="hero-card-grid" aria-hidden="true" />
      <div className="hero-stadium-lights hero-stadium-lights-left" aria-hidden="true" />
      <div className="hero-stadium-lights hero-stadium-lights-right" aria-hidden="true" />
      <div className="hero-command-red-glow" aria-hidden="true" />
      <div className="hero-warm-backlight" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,248,235,0.06)] backdrop-blur-xl lg:mx-0" style={{
            background: "linear-gradient(165deg, rgba(255, 248, 235, 0.06), rgba(255, 255, 255, 0.02) 60%, rgba(0, 18, 52, 0.06))"
          }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-[#C8102E] animate-ping opacity-40" />
              <span className="relative h-2 w-2 rounded-full bg-[#C8102E] shadow-[0_0_12px_rgba(200,16,46,0.7)]" />
            </span>
            CollectHub AI
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
            className="text-balance text-4xl font-extrabold leading-[1.02] sm:text-5xl lg:text-[3.5rem] xl:text-[4.25rem]"
          >
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, #7a8a9e 0%, #b8c4d4 12%, #d8e0ea 24%, #ecf0f6 36%, #ffffff 48%, #fff8eb 56%, #f0f3f8 64%, #dce2ec 76%, #c4ceda 88%, #8a96a8 100%)",
              }}
            >
              #1 AI Platform for Baseball Card Collectors
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease: "easeOut" }}
            className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start"
          >
            {["Crop", "Grade", "Auction", "Collect", "Manage"].map((item, i) => (
              <span key={item} className="flex items-center gap-3">
                {i > 0 && (
                  <span className="h-1 w-1 rounded-full" style={{
                    background: "radial-gradient(circle, rgba(198, 159, 82, 0.5), rgba(255, 255, 255, 0.15))"
                  }} />
                )}
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-white/42 sm:text-base">
                  {item}
                </span>
              </span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: "easeOut" }}
            className="mt-10 flex flex-col justify-center gap-3.5 sm:flex-row lg:justify-start"
          >
            <Link
              href="/crop"
              className="btn-cta inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-4 text-sm font-bold tracking-wide shadow-[0_20px_48px_rgba(200,16,46,0.28)]"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2v14a2 2 0 0 0 2 2h14" />
                <path d="M18 22V8a2 2 0 0 0-2-2H2" />
              </svg>
              Start Cropping
            </Link>
            <Link
              href="/auctions"
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/[0.08] px-8 py-4 text-sm font-bold text-white/78 backdrop-blur-xl transition-all duration-350 hover:border-white/[0.16] hover:text-white active:scale-[0.98]"
              style={{
                background: "linear-gradient(165deg, rgba(255, 248, 235, 0.06), rgba(255, 255, 255, 0.025) 50%, rgba(0, 18, 52, 0.06))",
                boxShadow: "0 16px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,248,235,0.06)"
              }}
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
            className="mt-8 text-sm font-medium text-white/35"
          >
            Built for collectors, vendors, breakers, and auction houses
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          {/* Warm ambient glow behind the card */}
          <div className="absolute -inset-12 rounded-[48px] pointer-events-none" style={{
            background: "radial-gradient(ellipse at 55% 40%, rgba(198, 139, 62, 0.12), rgba(200, 16, 46, 0.06) 45%, transparent 68%)"
          }} aria-hidden="true" />

          <div className="hero-mockup-orbit" aria-hidden="true" />

          <div className="hero-product-shell rounded-[28px] p-3.5 sm:p-4">
            <div className="rounded-[22px] border border-white/[0.07] p-4 sm:p-5" style={{
              background: "linear-gradient(165deg, rgba(12, 24, 52, 0.92), rgba(8, 18, 42, 0.88) 50%, rgba(6, 14, 36, 0.95))",
              boxShadow: "inset 0 1px 0 rgba(255, 248, 235, 0.08), inset 0 -1px 0 rgba(0, 0, 0, 0.2)"
            }}>
              {/* Header */}
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/28">
                    Live Workspace
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-white/88">1952 Topps Intake</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/15 px-3 py-1.5" style={{
                  background: "linear-gradient(135deg, rgba(52, 211, 153, 0.10), rgba(52, 211, 153, 0.04))"
                }}>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                  <span className="text-[10px] font-bold text-emerald-300/90">AI Ready</span>
                </div>
              </div>

              {/* Content grid */}
              <div className="grid gap-4 sm:grid-cols-[1fr_0.86fr]">
                {/* Upload queue panel */}
                <div className="rounded-2xl border border-white/[0.06] p-3" style={{
                  background: "linear-gradient(165deg, rgba(255, 255, 255, 0.03), rgba(0, 14, 40, 0.06))"
                }}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Upload queue</span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-medium text-white/30">3 / 12</span>
                  </div>

                  {/* Card mockup with crop visualization */}
                  <div className="relative mx-auto aspect-[2.5/3.5] max-h-[286px] rounded-[18px] border border-white/[0.10] p-3" style={{
                    background: "linear-gradient(165deg, #eef3fb 0%, #e4ebf7 40%, #c8d4e8 100%)",
                    boxShadow: "0 28px 60px rgba(0, 0, 0, 0.40), 0 0 0 1px rgba(255, 255, 255, 0.04)"
                  }}>
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
                      className="absolute left-5 right-5 top-6 h-px shadow-[0_0_20px_rgba(103,232,249,0.8)]"
                      style={{ background: "linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.7) 20%, rgba(167, 139, 250, 0.5) 80%, transparent)" }}
                    />
                  </div>

                  {/* Upload progress */}
                  <div className="mt-4 rounded-xl border border-white/[0.05] px-3 py-2.5" style={{
                    background: "linear-gradient(165deg, rgba(255, 255, 255, 0.025), rgba(0, 14, 40, 0.04))"
                  }}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-white/48">Cloud upload</span>
                      <span className="font-medium text-white/30">78%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        animate={{ width: ["34%", "78%", "92%", "78%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #67e8f9, #a78bfa, #c084fc)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right column: Slab + Value */}
                <div className="flex flex-col gap-4">
                  {/* Graded slab */}
                  <div className="rounded-2xl border border-white/[0.06] p-3" style={{
                    background: "linear-gradient(165deg, rgba(255, 255, 255, 0.03), rgba(0, 14, 40, 0.06))"
                  }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Graded slab</span>
                      <span className="rounded-md px-2 py-1 text-[9px] font-black text-white" style={{
                        background: "linear-gradient(135deg, #C8102E, #d91a38)",
                        boxShadow: "0 3px 10px rgba(200, 16, 46, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
                      }}>
                        GEM 10
                      </span>
                    </div>
                    <div className="slab-preview rounded-[18px] border border-white/[0.08] p-2" style={{
                      background: "linear-gradient(165deg, rgba(255, 255, 255, 0.05), rgba(0, 14, 40, 0.08))",
                      boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)"
                    }}>
                      <div className="rounded-xl bg-white p-2">
                        <div className="mb-2 grid grid-cols-[1fr_auto] items-center gap-2">
                          <div className="h-5 rounded bg-[#e9eef7]" />
                          <div className="rounded px-2 py-1 text-[9px] font-black text-white" style={{
                            background: "linear-gradient(135deg, #C8102E, #a80d24)"
                          }}>PSA</div>
                        </div>
                        <div className="aspect-[2.5/3.5] rounded-lg bg-gradient-to-br from-[#173e7a] via-[#f6efe3] to-[#8f2234]" />
                      </div>
                    </div>
                  </div>

                  {/* Auction-ready value card */}
                  <div className="rounded-2xl border border-[#C8102E]/12 p-4" style={{
                    background: "linear-gradient(160deg, rgba(200, 16, 46, 0.10), rgba(198, 139, 62, 0.05) 60%, rgba(200, 16, 46, 0.03))",
                    boxShadow: "0 18px 44px rgba(200, 16, 46, 0.06), inset 0 1px 0 rgba(255, 248, 235, 0.05)"
                  }}>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                      Auction-ready
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-3xl font-black text-white tracking-tight">$1,240</p>
                        <p className="mt-1 text-[11px] text-white/35">Estimated market value</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/12 px-2.5 py-1 text-[10px] font-bold text-emerald-300" style={{
                        background: "linear-gradient(135deg, rgba(52, 211, 153, 0.10), rgba(52, 211, 153, 0.04))"
                      }}>
                        +18%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflow steps */}
              <div className="mt-4 grid grid-cols-4 gap-2">
                {workflowSteps.map((step, index) => (
                  <motion.div
                    key={step.label}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: [0.44, 1, 0.44] }}
                    transition={{ duration: 3.6, delay: index * 0.42, repeat: Infinity }}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.05] px-2 py-2.5 text-center text-[10px] font-semibold text-white/48"
                    style={{ background: "linear-gradient(165deg, rgba(255, 255, 255, 0.025), rgba(0, 14, 40, 0.04))" }}
                  >
                    <span className="text-[8px] opacity-60">{step.icon}</span>
                    {step.label}
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
