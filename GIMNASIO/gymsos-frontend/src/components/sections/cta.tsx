"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"
import { springs, staggerContainer, fadeUp } from "@/lib/motion"

const words = ["Predice", "Retiene", "Crece", "Automatiza", "Domina"]

function MagneticCTA({ children }: { children: React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <motion.button
      className="relative px-10 py-5 bg-[#00D084] text-[#070D18] font-black text-lg rounded-2xl shadow-[0_0_50px_rgba(0,208,132,0.35)] hover:bg-[#00E891] transition-colors"
      animate={{ x: pos.x, y: pos.y }}
      transition={springs.snappy}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        setPos({
          x: (e.clientX - r.left - r.width / 2) * 0.3,
          y: (e.clientY - r.top - r.height / 2) * 0.3,
        })
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      whileTap={{ scale: 0.97 }}
    >
      {children}
    </motion.button>
  )
}

const plans = [
  { name: "Pequeño",   price: "$99",  members: "50–200 miembros" },
  { name: "Mediano",   price: "$199", members: "200–500 miembros" },
  { name: "Grande",    price: "$399", members: "500–2k miembros", popular: true },
  { name: "Enterprise",price: "$799", members: "2k–5k miembros" },
]

export function CTA() {
  const reducedMotion = useReducedMotion()

  return (
    <section className="relative overflow-hidden bg-[#070D18]">
      {/* Gradient transition from previous section */}
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#070D18] to-transparent pointer-events-none" />

      {/* Big green circle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00D084]/10 rounded-full filter blur-[160px] pointer-events-none animate-glow-pulse" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-32">

        {/* Pricing cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          id="pricing"
          className="mb-28"
        >
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold mb-3">Precios</p>
            <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-tight">
              Simple. Escalable. Sin sorpresas.
            </h2>
            <p className="mt-4 text-neutral-500 max-w-md mx-auto">
              Comienza gratis 30 días. Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                  plan.popular
                    ? "bg-[#00D084]/10 border-[#00D084]/40 shadow-[0_0_40px_rgba(0,208,132,0.15)]"
                    : "glass-card hover:border-white/15"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#00D084] text-[#070D18] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide">
                      Popular
                    </span>
                  </div>
                )}
                <p className="text-neutral-400 text-sm font-medium mb-1">{plan.name}</p>
                <p className="text-white font-black text-4xl">
                  {plan.price}
                  <span className="text-neutral-500 font-normal text-sm">/mes</span>
                </p>
                <p className="text-neutral-500 text-xs mt-2 mb-5">{plan.members}</p>
                <button
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-colors ${
                    plan.popular
                      ? "bg-[#00D084] text-[#070D18] hover:bg-[#00E891]"
                      : "border border-white/10 text-white hover:border-white/25 hover:bg-white/5"
                  }`}
                >
                  {plan.popular ? "Comenzar Gratis →" : "Seleccionar"}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold mb-6">
            El momento es ahora
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="text-[clamp(2.8rem,7vw,7rem)] font-black text-white leading-[0.92] tracking-tight"
          >
            GYMsos
            <br />
            <span className="shimmer-text">lo transforma todo.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-8 text-xl text-neutral-500 max-w-lg mx-auto leading-relaxed"
          >
            La ventana es <span className="text-white font-semibold">2026</span>. No 2025. No 2027.{" "}
            <span className="text-[#00D084] font-semibold">Es ahora.</span>
          </motion.p>

          <motion.div variants={fadeUp} className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticCTA>Transformar mi gimnasio →</MagneticCTA>
            <button className="text-neutral-500 hover:text-white transition-colors text-base font-medium">
              Hablar con ventas ↗
            </button>
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={fadeUp} className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {[
              "✓ 30 días gratis",
              "✓ Sin tarjeta de crédito",
              "✓ Setup en 15 minutos",
              "✓ Soporte 24/7",
            ].map((t) => (
              <span key={t} className="text-sm text-neutral-500">{t}</span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
