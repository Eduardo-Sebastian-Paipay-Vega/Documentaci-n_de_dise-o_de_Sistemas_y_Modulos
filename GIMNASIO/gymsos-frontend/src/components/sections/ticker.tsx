"use client"

import { motion } from "framer-motion"

const items = [
  "⚡ Churn AI · 89% Precisión",
  "🏆 Battle Pass Fitness",
  "🧬 Digital Twin 3D",
  "🏪 Marketplace Integrado",
  "🏢 Corporate Wellness",
  "🪞 Smart Mirror",
  "📱 QR Biométrico",
  "🌍 2.5M+ Miembros",
  "🤖 Decisiones Autónomas",
  "💎 LTV/CAC 292:1",
  "🔗 Network Effects",
  "🎮 Gamificación Total",
  "📊 KPIs en Tiempo Real",
]

export function Ticker() {
  const repeated = [...items, ...items]

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-[#0D1526] py-4">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0D1526] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0D1526] to-transparent z-10 pointer-events-none" />

      <div className="ticker-track">
        {repeated.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-6 text-sm font-medium text-neutral-400 whitespace-nowrap"
          >
            {item}
            <span className="text-[#00D084]/40 mx-2">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
