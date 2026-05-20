"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/motion"

const kpis = [
  { label: "Miembros activos",  value: "1,247", change: "+12%",  dir: "up",   icon: "👥" },
  { label: "Ingresos del mes",  value: "$37,140", change: "+8%", dir: "up",   icon: "💰" },
  { label: "Tasa de churn",     value: "2.1%",  change: "-0.5%", dir: "down", icon: "📉" },
  { label: "NPS Score",         value: "72",    change: "+3pts", dir: "up",   icon: "⭐" },
]

const barData = [
  { mes: "Jun", v: 52 }, { mes: "Jul", v: 61 }, { mes: "Ago", v: 58 },
  { mes: "Sep", v: 74 }, { mes: "Oct", v: 69 }, { mes: "Nov", v: 83 },
  { mes: "Dic", v: 78 }, { mes: "Ene", v: 88 }, { mes: "Feb", v: 92 },
  { mes: "Mar", v: 87 }, { mes: "Abr", v: 96 }, { mes: "May", v: 100 },
]

const atRisk = [
  { nombre: "Carlos M.",   riesgo: 85, plan: "Gold",    dias: 18 },
  { nombre: "Ana Torres",  riesgo: 71, plan: "Silver",  dias: 22 },
  { nombre: "Luis P.",     riesgo: 64, plan: "Premium", dias: 31 },
  { nombre: "Rosa Ch.",    riesgo: 58, plan: "Basic",   dias: 38 },
]

const acciones = [
  { icon: "📈", label: "Reportes",     desc: "Descargar PDF / Excel" },
  { icon: "👥", label: "Miembros",     desc: "Gestionar base de datos" },
  { icon: "📅", label: "Clases",       desc: "Programación semanal" },
  { icon: "🎯", label: "Promociones",  desc: "Crear oferta nueva" },
]

export default function GerenteDashboard() {
  const { user } = useAuth()
  const chartRef = useRef<HTMLDivElement>(null)
  const inView = useInView(chartRef, { once: true })

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Bienvenido,</p>
            <h1 className="text-white font-black text-2xl">{user?.nombre} 📊</h1>
            <p className="text-neutral-600 text-sm mt-0.5">GymFit Lima · Mayo 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D084]/10 border border-[#00D084]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
              <span className="text-[#00D084] text-xs font-semibold">Sistema activo</span>
            </div>
            <button className="bg-[#00D084] text-[#070D18] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#00E891] transition-colors">
              + Reporte
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="glass-card rounded-2xl p-5 hover:border-white/12 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{kpi.icon}</span>
              <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                kpi.dir === "up" ? "bg-[#00D084]/15 text-[#00D084]" : "bg-[#EF4444]/15 text-[#EF4444]"
              )}>
                {kpi.change}
              </span>
            </div>
            <p className="text-white font-black text-2xl tabular-nums">{kpi.value}</p>
            <p className="text-neutral-500 text-xs mt-1">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6" ref={chartRef}>
        {/* Bar chart — 2 cols */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold">Ingresos mensuales</p>
            <span className="text-[#00D084] text-xs font-bold bg-[#00D084]/10 px-2 py-0.5 rounded-full">
              ↑ 23% YTD
            </span>
          </div>
          <p className="text-neutral-600 text-xs mb-4">Últimos 12 meses en USD</p>
          <div className="flex items-end gap-1.5 h-36">
            {barData.map((d, i) => (
              <div key={d.mes} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  className={cn("w-full rounded-t-md", d.mes === "May" ? "bg-[#00D084]" : "bg-white/15")}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.v / 100) * 140}px` } : { height: 0 }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ alignSelf: "flex-end" }}
                />
                <span className="text-[9px] text-neutral-600">{d.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* At-risk members */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold text-sm">⚠️ Riesgo de churn</p>
            <span className="text-xs bg-[#EF4444]/15 text-[#EF4444] px-2 py-0.5 rounded-full font-bold">
              {atRisk.length} alertas
            </span>
          </div>
          <div className="space-y-3">
            {atRisk.map((m, i) => (
              <motion.div
                key={m.nombre}
                initial={{ opacity: 0, x: -12 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {m.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{m.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[#EF4444] rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${m.riesgo}%` } : {}}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.7 }}
                      />
                    </div>
                    <span className="text-[#EF4444] text-[10px] font-bold">{m.riesgo}%</span>
                  </div>
                  <p className="text-neutral-600 text-[10px]">Sin visita {m.dias} días</p>
                </div>
                <button className="shrink-0 text-[10px] bg-[#00D084]/15 text-[#00D084] font-bold px-2 py-1 rounded-lg hover:bg-[#00D084]/25 transition-colors">
                  Intervenir
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-neutral-500 text-xs uppercase tracking-wider mb-3">Acciones rápidas</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {acciones.map((a) => (
            <button
              key={a.label}
              className="glass-card rounded-2xl p-4 text-left hover:border-[#00D084]/20 hover:bg-[#00D084]/5 transition-all group"
            >
              <span className="text-2xl">{a.icon}</span>
              <p className="text-white font-semibold text-sm mt-2">{a.label}</p>
              <p className="text-neutral-600 text-xs mt-0.5">{a.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
