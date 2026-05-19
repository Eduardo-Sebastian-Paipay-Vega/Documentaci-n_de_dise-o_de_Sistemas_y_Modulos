"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

const kpis = [
  { label: "Miembros activos",  value: "1,247",  change: "+12%",  dir: "up" },
  { label: "Ingresos del mes",  value: "$37,140", change: "+8%",   dir: "up" },
  { label: "Tasa de churn",     value: "2.1%",    change: "-0.5%", dir: "down" },
  { label: "NPS score",         value: "72",      change: "+3pts", dir: "up" },
]

const barData = [
  { month: "Jun", value: 52 },
  { month: "Jul", value: 61 },
  { month: "Ago", value: 58 },
  { month: "Sep", value: 74 },
  { month: "Oct", value: 69 },
  { month: "Nov", value: 83 },
  { month: "Dic", value: 78 },
  { month: "Ene", value: 88 },
  { month: "Feb", value: 92 },
  { month: "Mar", value: 87 },
  { month: "Abr", value: 96 },
  { month: "May", value: 100 },
]

const atRisk = [
  { name: "Carlos M.",  risk: 85, plan: "Gold",   days: 18 },
  { name: "Ana Torres", risk: 71, plan: "Silver",  days: 22 },
  { name: "Luis P.",    risk: 64, plan: "Premium", days: 31 },
]

function BarChart({ inView }: { inView: boolean }) {
  const max = Math.max(...barData.map((d) => d.value))

  return (
    <div className="flex items-end gap-1.5 h-28 mt-2">
      {barData.map((d, i) => (
        <div key={d.month} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            className={cn(
              "w-full rounded-t-sm",
              d.month === "May" ? "bg-[#00D084]" : "bg-white/15",
            )}
            initial={{ height: 0 }}
            animate={inView ? { height: `${(d.value / max) * 100}%` } : { height: 0 }}
            transition={{ delay: 0.1 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ alignSelf: "flex-end" }}
          />
          <span className="text-[8px] text-neutral-600">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-28 bg-[#070D18] overflow-hidden">
      {/* BG accents */}
      <div className="absolute -top-32 left-1/2 w-[600px] h-[300px] bg-[#00D084]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header — left-aligned */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold mb-3">
            Dashboard Gerente
          </p>
          <h2 className="text-[clamp(2rem,5vw,4rem)] font-black text-white leading-tight">
            Todo el gimnasio.
            <br />
            <span className="text-neutral-500">En una pantalla.</span>
          </h2>
          <p className="mt-5 text-neutral-500 text-base leading-relaxed">
            KPIs en tiempo real, alertas de miembros en riesgo, ingresos por canal y predicciones
            AI — todo desde un único comando center.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            {/* Title bar */}
            <div className="bg-[#0D1526] border-b border-white/5 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                <div className="w-3 h-3 rounded-full bg-[#FF6B35]/60" />
                <div className="w-3 h-3 rounded-full bg-[#00D084]/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/5 rounded-md px-4 py-1 text-xs text-neutral-500 font-mono">
                  app.gymsos.io/dashboard
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
                <span className="text-xs text-[#00D084] font-medium">Live</span>
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-[#070D18] p-6">
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white font-bold text-lg">Panel de Control</p>
                  <p className="text-neutral-500 text-sm">GymFit Lima · Mayo 2026</p>
                </div>
                <div className="flex items-center gap-3">
                  <select className="bg-white/5 border border-white/8 text-neutral-400 text-xs rounded-lg px-3 py-2">
                    <option>Últimos 30 días</option>
                  </select>
                  <button className="bg-[#00D084] text-[#070D18] text-xs font-bold px-4 py-2 rounded-lg">
                    + Reporte
                  </button>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpis.map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                    className="bg-white/3 border border-white/6 rounded-xl p-4"
                  >
                    <p className="text-neutral-500 text-xs mb-2">{kpi.label}</p>
                    <p className="text-white font-black text-2xl">{kpi.value}</p>
                    <p
                      className={cn(
                        "text-xs font-semibold mt-1",
                        kpi.dir === "up" ? "text-[#00D084]" : "text-[#EF4444]",
                      )}
                    >
                      {kpi.change} vs mes anterior
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Bar chart — takes 2 cols */}
                <div className="lg:col-span-2 bg-white/3 border border-white/6 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold text-sm">Ingresos mensuales</p>
                    <span className="text-[#00D084] text-xs font-bold">↑ 23% YTD</span>
                  </div>
                  <p className="text-neutral-600 text-xs mb-2">Últimos 12 meses en USD</p>
                  <BarChart inView={inView} />
                </div>

                {/* At-risk members */}
                <div className="bg-white/3 border border-white/6 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white font-semibold text-sm">Miembros en riesgo</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] font-semibold">
                      3 alertas
                    </span>
                  </div>
                  <div className="space-y-3">
                    {atRisk.map((m, i) => (
                      <motion.div
                        key={m.name}
                        initial={{ opacity: 0, x: -12 }}
                        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {m.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-medium truncate">{m.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-[#EF4444] rounded-full"
                                initial={{ width: 0 }}
                                animate={inView ? { width: `${m.risk}%` } : { width: 0 }}
                                transition={{ delay: 0.8 + i * 0.1, duration: 0.7 }}
                              />
                            </div>
                            <span className="text-[#EF4444] text-[10px] font-bold shrink-0">{m.risk}%</span>
                          </div>
                          <p className="text-neutral-600 text-[10px] mt-0.5">Sin visita hace {m.days} días</p>
                        </div>
                        <button className="text-[10px] bg-[#00D084]/15 text-[#00D084] font-semibold px-2 py-1 rounded-lg shrink-0">
                          Intervenir
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow under dashboard */}
          <div className="absolute -bottom-12 left-1/4 right-1/4 h-24 bg-[#00D084]/10 filter blur-[40px] pointer-events-none" />
        </motion.div>
      </div>
    </section>
  )
}
