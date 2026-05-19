"use client"

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion"
import { useRef, useEffect } from "react"
import { fadeUp, staggerContainer } from "@/lib/motion"

interface StatItem {
  to: number
  suffix: string
  prefix?: string
  label: string
  sublabel: string
  color: "green" | "white" | "orange"
}

const stats: StatItem[] = [
  {
    to: 2500000,
    suffix: "+",
    label: "Miembros conectados",
    sublabel: "en la red GYMsos",
    color: "green",
  },
  {
    to: 89,
    suffix: "%",
    label: "Precisión de predicción",
    sublabel: "Churn AI en 30 días",
    color: "white",
  },
  {
    to: 500,
    suffix: "+",
    label: "Gimnasios activos",
    sublabel: "en Latinoamérica",
    color: "white",
  },
  {
    to: 13,
    suffix: "",
    label: "Innovaciones world-first",
    sublabel: "Disruptivas e integradas",
    color: "orange",
  },
]

function Counter({ to, suffix, prefix, color }: Pick<StatItem, "to" | "suffix" | "prefix" | "color">) {
  const ref = useRef<HTMLSpanElement>(null)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) =>
    to >= 1000000
      ? (v / 1000000).toFixed(1)
      : Math.round(v).toLocaleString("es-PE"),
  )
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1] })
    }
  }, [isInView, count, to])

  const colorClass =
    color === "green"
      ? "gradient-text-green"
      : color === "orange"
      ? "gradient-text-orange"
      : "text-white"

  return (
    <span
      ref={ref}
      className={`text-[clamp(2.8rem,6vw,5rem)] font-black leading-none tabular-nums ${colorClass}`}
    >
      {prefix}
      <motion.span>{rounded}</motion.span>
      {to >= 1000000 ? "M" : ""}
      {suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="relative py-24 bg-[#070D18] overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#00D084]/8 rounded-full filter blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold">
            Por los números
          </p>
          <p className="mt-2 text-neutral-500 text-sm max-w-md mx-auto">
            Datos reales del ecosistema GYMsos en crecimiento
          </p>
        </motion.div>

        {/* Stats grid — intentionally NOT 4 equal columns */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 rounded-3xl overflow-hidden">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#070D18] p-8 lg:p-10 flex flex-col gap-3 group hover:bg-[#0D1526] transition-colors duration-300"
            >
              <Counter
                to={stat.to}
                suffix={stat.suffix}
                prefix={stat.prefix}
                color={stat.color}
              />
              <div>
                <p className="text-white font-semibold text-base">{stat.label}</p>
                <p className="text-neutral-500 text-sm mt-0.5">{stat.sublabel}</p>
              </div>

              {/* Animated underline on hover */}
              <div className="h-px bg-gradient-to-r from-[#00D084] to-transparent w-0 group-hover:w-full transition-all duration-500 ease-out" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
