"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer, springs } from "@/lib/motion"

const floatingMetrics = [
  {
    value: "2.5M+",
    label: "Miembros activos",
    sub: "↑ 18% este mes",
    color: "green",
    pos: "top-6 right-4",
    anim: "animate-float",
  },
  {
    value: "89%",
    label: "Precisión de predicción",
    sub: "AI-powered churn",
    color: "green",
    pos: "top-1/2 -translate-y-1/2 right-0",
    anim: "animate-float-slow",
  },
  {
    value: "13",
    label: "Innovaciones world-first",
    sub: "Disruptivas",
    color: "orange",
    pos: "bottom-12 right-12",
    anim: "animate-float-slower",
  },
]

function MagneticButton({
  children,
  className,
  variant = "primary",
}: {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "ghost"
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <motion.button
      className={cn(
        "relative px-8 py-4 rounded-2xl font-bold text-base transition-colors",
        variant === "primary"
          ? "bg-[#00D084] text-[#070D18] hover:bg-[#00E891] shadow-[0_0_30px_rgba(0,208,132,0.3)]"
          : "border border-white/10 text-white hover:border-white/25 hover:bg-white/5",
        className,
      )}
      animate={{ x: pos.x, y: pos.y }}
      transition={springs.snappy}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setPos({
          x: (e.clientX - r.left - r.width / 2) * 0.28,
          y: (e.clientY - r.top - r.height / 2) * 0.28,
        })
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}

const avatarInitials = ["JM", "AP", "KR", "DS", "MV"]

export function Hero() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[#070D18] dot-grid" />

      {/* Green orb */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#00D084]/12 rounded-full filter blur-[140px] animate-glow-pulse pointer-events-none" />
      {/* Orange orb */}
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-[#FF6B35]/10 rounded-full filter blur-[120px] pointer-events-none" />
      {/* Accent orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1F2937]/30 rounded-full filter blur-[160px] pointer-events-none" />

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-36 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left — main content (7 cols) */}
          <div className="lg:col-span-7">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div variants={fadeUp} className="mb-8">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00D084]/30 bg-[#00D084]/10 text-[#00D084] text-xs font-semibold tracking-[0.18em] uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
                  Fitness Operating System · 2026
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUp}
                className="text-[clamp(3.2rem,7.5vw,6.8rem)] font-black leading-[0.88] tracking-tight text-white"
              >
                El Sistema
                <br />
                <span className="gradient-text-green">Operativo</span>
                <br />
                del Fitness
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={fadeUp}
                className="mt-8 text-lg text-neutral-400 max-w-[500px] leading-relaxed"
              >
                Aprende de cada rep, cada sesión, cada decisión. Predice el abandono{" "}
                <span className="text-white font-medium">30 días antes</span> con 89% de precisión.
                La plataforma que transforma gimnasios en máquinas de retención automática.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
                <MagneticButton variant="primary">Comenzar Gratis →</MagneticButton>
                <MagneticButton variant="ghost">Ver Demo ↗</MagneticButton>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={fadeUp} className="mt-10 flex items-center gap-5">
                <div className="flex -space-x-2.5">
                  {avatarInitials.map((init, i) => (
                    <div
                      key={i}
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00D084]/25 to-[#1F2937] border-2 border-[#070D18] flex items-center justify-center text-xs font-bold text-[#00D084]"
                    >
                      {init[0]}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-neutral-300 font-medium">
                    +500 gimnasios ya usan GYMsos
                  </p>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-[#00D084] text-xs">★</span>
                    ))}
                    <span className="text-xs text-neutral-500 ml-1">4.9 / 5</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right — floating metric cards (5 cols) */}
          <div className="lg:col-span-5 relative h-[440px] hidden lg:block">
            {/* Dashed connector line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-15"
              viewBox="0 0 380 440"
              fill="none"
            >
              <path
                d="M 300 60 C 260 180, 340 240, 310 300 C 290 340, 250 390, 280 420"
                stroke="#00D084"
                strokeWidth="1"
                strokeDasharray="5 9"
              />
            </svg>

            {floatingMetrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, scale: 0.88 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.5 + i * 0.18,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={cn("absolute glass-card rounded-2xl p-5 min-w-[185px]", m.pos, m.anim)}
              >
                <p
                  className={cn(
                    "text-[2.6rem] font-black leading-none",
                    m.color === "green" ? "gradient-text-green" : "gradient-text-orange",
                  )}
                >
                  {m.value}
                </p>
                <p className="text-sm text-neutral-400 mt-1.5 font-medium">{m.label}</p>
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-white/5 text-neutral-500">
                  {m.sub}
                </span>
              </motion.div>
            ))}

            {/* Central glowing dot */}
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 rounded-full bg-[#00D084] animate-pulse" />
              <div className="absolute inset-0 rounded-full bg-[#00D084]/30 blur-md animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#070D18] to-transparent pointer-events-none" />
    </section>
  )
}
