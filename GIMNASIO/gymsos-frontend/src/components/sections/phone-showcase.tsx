"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/* ─────────────────────── Phone frames (UI mockups) ─── */

function MemberDashboardScreen() {
  const classes = [
    { name: "Spinning Extremo", time: "07:30", trainer: "Coach Ana", spots: 3 },
    { name: "Yoga Flow",        time: "10:00", trainer: "María V.",  spots: 8 },
    { name: "HIIT Total",       time: "18:30", trainer: "Coach J.",  spots: 1 },
  ]

  return (
    <div className="h-full bg-[#0a0f1c] text-white overflow-hidden flex flex-col">
      {/* Status bar */}
      <div className="flex justify-between items-center px-5 pt-8 pb-2 text-[10px] text-neutral-500">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Header */}
      <div className="px-5 py-3 bg-gradient-to-b from-[#00D084]/15 to-transparent">
        <p className="text-neutral-400 text-xs">Bienvenido de vuelta,</p>
        <p className="text-white font-bold text-lg">Juan Quispe 👋</p>
        <div className="mt-2 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
          <span className="text-[11px] text-[#00D084] font-medium">Membresía activa · vence 30 jun</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2 px-5 py-3">
        {[
          { icon: "📱", label: "Mi QR" },
          { icon: "📅", label: "Clases" },
          { icon: "📊", label: "Progreso" },
        ].map((a) => (
          <div key={a.label} className="bg-white/5 rounded-xl p-2.5 flex flex-col items-center gap-1">
            <span className="text-lg">{a.icon}</span>
            <span className="text-[10px] text-neutral-400">{a.label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming classes */}
      <div className="px-5 pb-3">
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Próximas Clases</p>
        <div className="space-y-2">
          {classes.map((c) => (
            <div key={c.name} className="bg-white/4 rounded-xl px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-white text-xs font-semibold">{c.name}</p>
                <p className="text-neutral-500 text-[10px]">{c.time} · {c.trainer}</p>
              </div>
              <span
                className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium",
                  c.spots <= 2
                    ? "bg-[#FF6B35]/20 text-[#FF6B35]"
                    : "bg-[#00D084]/15 text-[#00D084]",
                )}
              >
                {c.spots} {c.spots === 1 ? "lugar" : "lugares"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="mt-auto border-t border-white/5 flex justify-around px-4 py-3">
        {["🏠", "📅", "📊", "👤"].map((icon, i) => (
          <div key={i} className={cn("flex flex-col items-center gap-1", i === 0 && "relative")}>
            <span className="text-base">{icon}</span>
            {i === 0 && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00D084]" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function BattlePassScreen() {
  const tiers = [
    { tier: 10, reward: "🎽 Camiseta GYM",      xp: 1000, unlocked: true },
    { tier: 20, reward: "💪 Sesión PT Gratis",  xp: 2000, unlocked: true },
    { tier: 35, reward: "⚡ XP Boost 2x",       xp: 3500, unlocked: false, current: true },
    { tier: 50, reward: "🏆 Membresía VIP",     xp: 5000, unlocked: false },
  ]

  return (
    <div className="h-full bg-[#0a0f1c] text-white overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-5 pt-8 pb-2 text-[10px] text-neutral-500">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Header */}
      <div className="px-5 py-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white font-black text-base">⚔️ Battle Pass S1</p>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] font-semibold">PREMIUM</span>
        </div>
        <p className="text-neutral-500 text-xs">Temporada termina en 18 días</p>
      </div>

      {/* Progress ring area */}
      <div className="mx-5 bg-gradient-to-br from-[#FF6B35]/10 to-[#00D084]/10 rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold text-2xl">Tier 35</p>
            <p className="text-neutral-400 text-xs">de 50 · 70% completado</p>
          </div>
          <div className="text-right">
            <p className="text-[#00D084] font-bold">3,500 XP</p>
            <p className="text-neutral-500 text-[10px]">próximo: Tier 36</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00D084] to-[#00FFB3] rounded-full" style={{ width: "70%" }} />
        </div>
      </div>

      {/* Tiers list */}
      <div className="px-5 py-3 flex-1">
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Recompensas</p>
        <div className="space-y-2">
          {tiers.map((t) => (
            <div
              key={t.tier}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 border",
                t.current
                  ? "bg-[#00D084]/10 border-[#00D084]/30"
                  : t.unlocked
                  ? "bg-white/4 border-white/5"
                  : "bg-white/2 border-white/3 opacity-60",
              )}
            >
              <span className={cn(
                "text-xs font-bold w-10 shrink-0",
                t.current ? "text-[#00D084]" : t.unlocked ? "text-white" : "text-neutral-600",
              )}>
                T{t.tier}
              </span>
              <span className="text-sm flex-1">{t.reward}</span>
              {t.unlocked ? (
                <span className="text-[#00D084] text-xs">✓</span>
              ) : t.current ? (
                <span className="text-[#00D084] text-[10px] font-semibold">ACTUAL</span>
              ) : (
                <span className="text-neutral-600 text-xs">🔒</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <button className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF9A5C] text-white font-bold rounded-xl py-3 text-sm">
          Boost +1000 XP · $9.99
        </button>
      </div>
    </div>
  )
}

function ChurnAlertScreen() {
  return (
    <div className="h-full bg-[#0a0f1c] text-white overflow-hidden flex flex-col">
      <div className="flex justify-between items-center px-5 pt-8 pb-2 text-[10px] text-neutral-500">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      {/* Alert header */}
      <div className="mx-5 mt-2 bg-[#FF6B35]/15 border border-[#FF6B35]/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚠️</span>
          <p className="text-[#FF6B35] font-bold text-sm">Notamos que estás ausente</p>
        </div>
        <p className="text-neutral-400 text-xs leading-relaxed">
          Tu actividad bajó un 60% en las últimas 2 semanas. Queremos que alcances tus metas.
        </p>
      </div>

      {/* Risk meter */}
      <div className="mx-5 mt-3 bg-white/4 rounded-2xl p-4 border border-white/5">
        <p className="text-xs text-neutral-500 mb-2">Probabilidad de abandono</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-[#FF6B35] to-[#EF4444] rounded-full" />
          </div>
          <span className="text-[#EF4444] font-black text-lg">72%</span>
        </div>
      </div>

      {/* Interventions */}
      <div className="px-5 py-3 flex-1">
        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Te ofrecemos:</p>
        <div className="space-y-2.5">
          {[
            {
              icon: "🎁",
              title: "1 mes GRATIS",
              desc: "Oferta válida solo hoy",
              action: "ACTIVAR",
              color: "green",
            },
            {
              icon: "💪",
              title: "Sesión con trainer",
              desc: "Gratis · agenda ahora",
              action: "AGENDAR",
              color: "orange",
            },
            {
              icon: "🏆",
              title: 'Reto "Vuelta al Gym"',
              desc: "7 días con tu clan",
              action: "UNIRSE",
              color: "blue",
            },
          ].map((opt) => (
            <div
              key={opt.title}
              className="flex items-center gap-3 bg-white/4 rounded-xl px-3 py-2.5 border border-white/5"
            >
              <span className="text-xl">{opt.icon}</span>
              <div className="flex-1">
                <p className="text-white text-xs font-semibold">{opt.title}</p>
                <p className="text-neutral-500 text-[10px]">{opt.desc}</p>
              </div>
              <button
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-lg",
                  opt.color === "green"
                    ? "bg-[#00D084]/20 text-[#00D084]"
                    : opt.color === "orange"
                    ? "bg-[#FF6B35]/20 text-[#FF6B35]"
                    : "bg-blue-500/20 text-blue-400",
                )}
              >
                {opt.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-5">
        <button className="w-full text-neutral-600 text-xs py-2">Rechazar ayuda</button>
      </div>
    </div>
  )
}

/* ─────────────────────── Wrapper & Section ─── */

interface PhoneProps {
  title: string
  subtitle: string
  screen: React.ReactNode
  delay?: number
  offset?: string
}

function Phone({ title, subtitle, screen, delay = 0, offset = "" }: PhoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex flex-col items-center gap-5", offset)}
    >
      {/* Phone */}
      <div className="phone-frame relative">
        <div className="phone-notch" />
        {screen}
      </div>

      {/* Label */}
      <div className="text-center">
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-neutral-500 text-xs mt-1">{subtitle}</p>
      </div>
    </motion.div>
  )
}

export function PhoneShowcase() {
  return (
    <section id="innovations" className="relative py-28 bg-[#070D18] overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-[#00D084]/8 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#FF6B35]/8 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold mb-3">
            La App
          </p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-tight">
            Pantallas que enamoran,
            <br />
            <span className="gradient-text-orange">retención que convierte.</span>
          </h2>
          <p className="mt-4 text-neutral-500 max-w-lg mx-auto text-base">
            Cada pantalla está diseñada para que los miembros abran la app 8+ veces por semana
            sin recordar por qué empezaron.
          </p>
        </motion.div>

        {/* Phones — staggered, middle phone elevated */}
        <div className="flex flex-col md:flex-row items-end justify-center gap-8 lg:gap-12">
          <Phone
            title="Dashboard Miembro"
            subtitle="Acceso rápido · clases · progreso"
            screen={<MemberDashboardScreen />}
            delay={0}
            offset="md:mb-8"
          />
          <Phone
            title="Battle Pass Fitness"
            subtitle="Gamificación · XP · recompensas reales"
            screen={<BattlePassScreen />}
            delay={0.15}
            offset="md:-mt-8"
          />
          <Phone
            title="Churn Alert & Retención"
            subtitle="AI interviene antes de que pierdas al miembro"
            screen={<ChurnAlertScreen />}
            delay={0.3}
            offset="md:mb-8"
          />
        </div>
      </div>
    </section>
  )
}
