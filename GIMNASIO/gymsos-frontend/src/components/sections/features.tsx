"use client"

import { motion, useMotionValue, useTransform } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { fadeUp } from "@/lib/motion"

interface Feature {
  id: string
  icon: string
  title: string
  description: string
  tag: string
  accent: "green" | "orange" | "blue"
  size: "large" | "medium" | "small"
}

const features: Feature[] = [
  {
    id: "churn-ai",
    icon: "🧠",
    title: "Churn AI — Predicción de Abandono",
    description:
      "Detecta miembros en riesgo 30 días antes con 89% de precisión. Modelo ML entrenado con 10 billones de datapoints. Intervención automática: oferta personalizada, sesión gratis o reto de regreso.",
    tag: "IA Core",
    accent: "green",
    size: "large",
  },
  {
    id: "battle-pass",
    icon: "🏆",
    title: "Battle Pass Fitness",
    description:
      "Sistema de progresión por temporadas. XP por asistencias, retos y logros. Recompensas desbloqueables. Tier gratuito y premium ($9.99/mes).",
    tag: "Gamificación",
    accent: "orange",
    size: "medium",
  },
  {
    id: "digital-twin",
    icon: "🧬",
    title: "Avatar 3D — Digital Twin",
    description:
      "Representación 3D del cuerpo del miembro. Predicción visual de transformación a 12 semanas. Comparativa antes/después en tiempo real.",
    tag: "Innovación",
    accent: "green",
    size: "medium",
  },
  {
    id: "marketplace",
    icon: "🏪",
    title: "Marketplace Integrado",
    description:
      "Trainers, nutricionistas, suplementos, wearables y merchandise. Comisión 30% para GYMsos. Recomendaciones basadas en perfil del miembro.",
    tag: "Revenue",
    accent: "orange",
    size: "medium",
  },
  {
    id: "corporate",
    icon: "🏢",
    title: "Corporate Wellness B2B2C",
    description:
      "Dashboard departamental. Leaderboard por equipos. Retos corporativos. $15/empleado/mes. Target: 50 empresas × 500 empleados = 25k miembros.",
    tag: "Enterprise",
    accent: "blue",
    size: "medium",
  },
  {
    id: "smart-mirror",
    icon: "🪞",
    title: "Smart Mirror",
    description:
      "Pantalla inteligente en el gym. Computer vision para validación de postura en tiempo real. Feedback inmediato: posición correcta vs. ideal.",
    tag: "Hardware",
    accent: "green",
    size: "large",
  },
  {
    id: "qr-bio",
    icon: "📱",
    title: "Acceso QR Biométrico",
    description:
      "QR dinámico único por sesión. Integración con torniquetes y cámaras. Registro de acceso automático.",
    tag: "Core",
    accent: "blue",
    size: "small",
  },
  {
    id: "leaderboard",
    icon: "🌍",
    title: "Leaderboard Global + Clanes",
    description:
      "Rankings por gym, ciudad, país y clan. Clanes de 15-20 miembros. Chat integrado. Torneos semanales con premios reales.",
    tag: "Social",
    accent: "orange",
    size: "small",
  },
  {
    id: "wearables",
    icon: "⌚",
    title: "Wearable Sync",
    description:
      "Apple Watch, Garmin, Whoop, Fitbit. Normalización automática de datos. Alertas de salud preventivas basadas en biometría.",
    tag: "Integración",
    accent: "green",
    size: "small",
  },
]

function TiltCard({
  feature,
  className,
}: {
  feature: Feature
  className?: string
}) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)
  const [hovered, setHovered] = useState(false)

  const accentMap = {
    green: { border: "hover:border-[#00D084]/30", tag: "bg-[#00D084]/10 text-[#00D084]", glow: "hover:shadow-[0_0_30px_rgba(0,208,132,0.1)]" },
    orange: { border: "hover:border-[#FF6B35]/30", tag: "bg-[#FF6B35]/10 text-[#FF6B35]", glow: "hover:shadow-[0_0_30px_rgba(255,107,53,0.1)]" },
    blue: { border: "hover:border-blue-500/30", tag: "bg-blue-500/10 text-blue-400", glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]" },
  }

  const a = accentMap[feature.accent]

  return (
    <motion.div
      className={cn(
        "glass-card rounded-2xl p-6 cursor-default transition-all duration-300",
        a.border, a.glow,
        "border border-white/6",
        className,
      )}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setRotateX(((e.clientY - r.top - r.height / 2) / r.height) * -8)
        setRotateY(((e.clientX - r.left - r.width / 2) / r.width) * 8)
        setHovered(true)
      }}
      onMouseLeave={() => {
        setRotateX(0)
        setRotateY(0)
        setHovered(false)
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{feature.icon}</span>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", a.tag)}>
          {feature.tag}
        </span>
      </div>
      <h3 className="text-white font-bold text-base mb-2 leading-snug">{feature.title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{feature.description}</p>
    </motion.div>
  )
}

export function Features() {
  return (
    <section id="features" className="relative py-28 bg-[#070D18] overflow-hidden">
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-[#FF6B35]/8 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold mb-3">
            13 Innovaciones
          </p>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-tight max-w-xl">
              No es software.
              <br />
              <span className="gradient-text-green">Es una ventaja competitiva.</span>
            </h2>
            <p className="text-neutral-500 text-base max-w-sm leading-relaxed">
              Cada innovación genera datos que mejoran la IA. Más datos = mejor IA = más valor = más miembros.
              El flywheel que ningún competidor puede replicar en 5 años.
            </p>
          </div>
        </motion.div>

        {/* Broken grid — asymmetric, never equal columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Row 1: Large + Medium */}
          <TiltCard feature={features[0]} className="md:col-span-2 lg:col-span-2" />
          <TiltCard feature={features[1]} />

          {/* Row 2: Medium + Large */}
          <TiltCard feature={features[2]} />
          <TiltCard feature={features[5]} className="md:col-span-1 lg:col-span-2" />

          {/* Row 3: Medium + Medium */}
          <TiltCard feature={features[3]} />
          <TiltCard feature={features[4]} />

          {/* Row 4: Small x3 */}
          <TiltCard feature={features[6]} />
          <TiltCard feature={features[7]} />
          <TiltCard feature={features[8]} />
        </div>
      </div>
    </section>
  )
}
