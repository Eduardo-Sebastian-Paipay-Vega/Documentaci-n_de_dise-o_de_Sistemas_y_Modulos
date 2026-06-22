"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { fadeIn, staggerContainer, staggerFast, easings } from "@/lib/motion"
import { useKPIsGerente, useChurnAtRisk, useIngresosMensuales } from "@/hooks/useKPIsGerente"
import {
  TrendingUp, TrendingDown, Users, DollarSign, Activity, Star,
  BarChart3, CalendarDays, Tag, AlertTriangle, ChevronRight,
  ArrowUpRight, Loader2,
} from "lucide-react"

const QUICK_ACTIONS = [
  { icon: BarChart3,    label: "Reportes",    desc: "Descargar PDF / Excel",   href: "/dashboard/gerente/reportes" },
  { icon: Users,        label: "Miembros",    desc: "Gestionar base de datos",  href: "/dashboard/gerente/miembros" },
  { icon: CalendarDays, label: "Clases",      desc: "Programación semanal",     href: "/dashboard/gerente/clases" },
  { icon: Tag,          label: "Promociones", desc: "Crear oferta nueva",       href: "/dashboard/gerente/promociones" },
]

function fmtSoles(n: number): string {
  return `S/ ${n.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function fmtDelta(n: number, invertido = false): { label: string; up: boolean } {
  const up = invertido ? n < 0 : n > 0
  return { label: `${n > 0 ? "+" : ""}${n.toFixed(1)}%`, up }
}

export default function GerenteDashboard() {
  const { user } = useAuth()
  const router    = useRouter()
  const chartRef  = useRef<HTMLDivElement>(null)
  const inView    = useInView(chartRef, { once: true, margin: "-60px" })
  const gymId     = user?.tenant_id ?? undefined

  const kpisState     = useKPIsGerente(gymId)
  const churnState    = useChurnAtRisk(gymId)
  const ingresosState = useIngresosMensuales(gymId)

  const kpis     = kpisState.data
  const churn    = churnState.data ?? []
  const ingresos = ingresosState.data ?? []

  const now = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  })

  const kpiCards = kpis
    ? [
        {
          label: "Miembros activos",
          value: kpis.totalMiembros.toLocaleString(),
          change: fmtDelta(kpis.miembrosDelta),
          icon: Users,
          sub: "vs. mes anterior",
        },
        {
          label: "Ingresos del mes",
          value: fmtSoles(kpis.ingresosMes),
          change: fmtDelta(kpis.ingresosDelta),
          icon: DollarSign,
          sub: "vs. mes anterior",
        },
        {
          label: "Tasa de churn",
          value: `${kpis.tasaChurn}%`,
          change: fmtDelta(kpis.churnDelta, true),
          icon: Activity,
          sub: "mejora mensual",
        },
        {
          label: "NPS Score",
          value: String(kpis.npsScore),
          change: { label: "+3 pts", up: true },
          icon: Star,
          sub: "últimos 30 días",
        },
      ]
    : []

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1400px]">

      {/* ─── Header ─── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeIn} className="flex items-start justify-between">
          <div>
            <p className="text-xs capitalize mb-1" style={{ color: "var(--text-tertiary)" }}>{now}</p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {user?.full_name}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {user?.tenant_name ?? "GymFit Lima"} · Panel de gerencia
            </p>
          </div>

          <motion.div variants={fadeIn} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
            >
              <span className="status-dot status-dot-live" />
              <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>En línea</span>
            </div>
            <button
              onClick={() => router.push("/dashboard/gerente/reportes")}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors"
              style={{ background: "var(--accent)", color: "#09090B" }}
            >
              <ArrowUpRight size={13} />
              Exportar
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ─── KPI Cards ─── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {kpisState.loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} variants={fadeIn} className="surface rounded-xl p-5 flex items-center justify-center h-28">
                <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
              </motion.div>
            ))
          : kpiCards.map((kpi) => {
              const Icon = kpi.icon
              return (
                <motion.div key={kpi.label} variants={fadeIn} className="surface-interactive rounded-xl p-5 group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
                      <Icon size={15} style={{ color: "var(--text-tertiary)" }} />
                    </div>
                    <span
                      className="flex items-center gap-0.5 text-[11px] font-semibold"
                      style={{ color: kpi.change.up ? "var(--accent)" : "var(--red)" }}
                    >
                      {kpi.change.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {kpi.change.label}
                    </span>
                  </div>
                  <p className="text-2xl font-bold tracking-tight tabular-nums mb-1" style={{ color: "var(--text-primary)" }}>
                    {kpi.value}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{kpi.label}</p>
                </motion.div>
              )
            })}
      </motion.div>

      {/* ─── Charts Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6" ref={chartRef}>

        {/* Ingresos */}
        <div className="lg:col-span-2 surface rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Ingresos mensuales</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Últimos 12 meses · S/</p>
            </div>
            <span className="badge badge-green">↑ {kpis ? `${kpis.ingresosDelta.toFixed(0)}%` : "—"} vs anterior</span>
          </div>

          {ingresosState.loading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {ingresos.map((d, i) => {
                const isCurrent = i === ingresos.length - 1
                return (
                  <div key={d.mes} className="flex flex-col items-center gap-1.5 flex-1">
                    <motion.div
                      className="w-full rounded-t-sm"
                      style={{
                        background:  isCurrent ? "var(--accent)" : "var(--border-subtle)",
                        alignSelf:   "flex-end",
                      }}
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${(d.indice / 100) * 128}px` } : { height: 0 }}
                      transition={{ delay: 0.05 + i * 0.035, duration: 0.55, ease: easings.heroOut }}
                    />
                    <span className="text-[9px]" style={{ color: isCurrent ? "var(--accent)" : "var(--text-disabled)" }}>
                      {d.mes}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Churn risk */}
        <div className="surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} style={{ color: "var(--amber)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Riesgo de churn</p>
            </div>
            <span className="badge badge-red">{churn.length} alertas</span>
          </div>

          {churnState.loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            </div>
          ) : (
            <div className="space-y-4">
              {churn.slice(0, 4).map((m, i) => (
                <motion.div
                  key={m.id_usuario}
                  initial={{ opacity: 0, x: -8 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.3, ease: easings.heroOut }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
                  >
                    {m.nombre[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>{m.nombre}</p>
                      <span
                        className="text-[10px] font-bold tabular-nums ml-2 shrink-0"
                        style={{ color: m.score_riesgo >= 75 ? "var(--red)" : "var(--amber)" }}
                      >
                        {m.score_riesgo}%
                      </span>
                    </div>

                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--border-faint)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: m.score_riesgo >= 75 ? "var(--red)" : "var(--amber)" }}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${m.score_riesgo}%` } : {}}
                        transition={{ delay: 0.55 + i * 0.08, duration: 0.6, ease: easings.heroOut }}
                      />
                    </div>

                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>
                      {m.dias_sin_visita} días sin visita · {m.plan}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <button
            onClick={() => router.push("/dashboard/gerente/miembros")}
            className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
          >
            Ver todos <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* ─── Quick Actions ─── */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider mb-3" style={{ color: "var(--text-disabled)" }}>
          Acceso rápido
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon
            return (
              <motion.a
                key={a.label}
                href={a.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.3, ease: easings.heroOut }}
                whileTap={{ scale: 0.98 }}
                className="surface-interactive rounded-xl p-4 flex items-start gap-3 group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: "var(--bg-muted)" }}
                >
                  <Icon size={15} style={{ color: "var(--text-tertiary)" }} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{a.desc}</p>
                </div>
              </motion.a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
