"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/components/providers/auth-provider"
import { fadeIn, staggerContainer, staggerFast, easings } from "@/lib/motion"
import {
  Users, ClipboardList, Apple, TrendingUp,
  ChevronRight, Loader2, CheckCircle2, Clock, AlertCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"

const QUICK_ACTIONS = [
  { icon: Users,         label: "Mis Pacientes",    desc: "Ver lista de pacientes",      href: "/dashboard/nutricionista/miembros" },
  { icon: ClipboardList, label: "Nueva Evaluación", desc: "Registrar evaluación física",  href: "/dashboard/nutricionista/evaluaciones" },
  { icon: Apple,         label: "Planes Nutric.",   desc: "Crear o editar planes",        href: "/dashboard/nutricionista/planes-nutricion" },
  { icon: TrendingUp,    label: "Recetas",          desc: "Biblioteca de recetas",        href: "/dashboard/nutricionista/recetas" },
]

const PACIENTES_HOY = [
  { nombre: "Carlos Mamani",   hora: "09:00", tipo: "evaluacion",  estado: "completado", imc: 27.4, objetivo: "Pérdida de peso" },
  { nombre: "Ana Flores",      hora: "10:30", tipo: "seguimiento", estado: "completado", imc: 22.1, objetivo: "Mantenimiento" },
  { nombre: "Luis Ccapa",      hora: "12:00", tipo: "inicial",     estado: "en-curso",   imc: 30.2, objetivo: "Pérdida de peso" },
  { nombre: "María Quispe",    hora: "15:00", tipo: "seguimiento", estado: "pendiente",  imc: 24.8, objetivo: "Ganancia muscular" },
  { nombre: "Jorge Huamán",    hora: "16:30", tipo: "evaluacion",  estado: "pendiente",  imc: 23.5, objetivo: "Rendimiento" },
]

const ALERTAS_NUTRICION = [
  { nombre: "Roberto Apaza",  razon: "IMC > 30 sin plan activo",         prioridad: "alta"  },
  { nombre: "Lucía Mamani",   razon: "Plan vence en 3 días",             prioridad: "media" },
  { nombre: "Rosa Chipana",   razon: "Sin registro de seguimiento 14d",  prioridad: "baja"  },
]

const ESTADO_STYLE: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  completado: { label: "Completado", color: "var(--accent)",  bg: "var(--accent-dim)",         icon: CheckCircle2 },
  "en-curso": { label: "En curso",   color: "#F97316",        bg: "rgba(249,115,22,0.08)",      icon: Clock },
  pendiente:  { label: "Pendiente",  color: "var(--text-tertiary)", bg: "var(--bg-overlay)",   icon: Clock },
}

const PRIORIDAD_STYLE: Record<string, { color: string; bg: string; border: string }> = {
  alta:  { color: "var(--red)",  bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.18)"  },
  media: { color: "#F97316",     bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.18)" },
  baja:  { color: "var(--blue)", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.18)" },
}

export default function NutricionistaDashboard() {
  const { user } = useAuth()
  const router   = useRouter()

  const now = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  })

  const completados = PACIENTES_HOY.filter(p => p.estado === "completado").length
  const pendientes  = PACIENTES_HOY.filter(p => p.estado === "pendiente").length

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1400px]">

      {/* ─── Header ─── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeIn} className="flex items-start justify-between">
          <div>
            <p className="text-xs capitalize mb-1" style={{ color: "var(--text-tertiary)" }}>{now}</p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {user?.nombre}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Nutricionista · {user?.nombre_gimnasio ?? "GymFit Lima"} ·{" "}
              <span style={{ color: "#10B981" }}>Consultorio activo</span>
            </p>
          </div>
          <motion.div variants={fadeIn} className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Consultas hoy</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {PACIENTES_HOY.length}
              </p>
            </div>
            <div className="w-px h-8" style={{ background: "var(--border-subtle)" }} />
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Completadas</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "#10B981" }}>
                {completados}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ─── KPI Cards ─── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {[
          { label: "Pacientes activos",        valor: "42",  sub: "+3 esta semana",    color: "#10B981" },
          { label: "Planes nutricionales",      valor: "38",  sub: "6 por renovar",     color: "#10B981" },
          { label: "Evaluaciones pendientes",   valor: String(pendientes), sub: "Hoy",  color: "#F97316" },
          { label: "Alertas nutricionales",     valor: String(ALERTAS_NUTRICION.length), sub: "Requieren atención", color: "var(--red)" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            variants={fadeIn}
            className="surface rounded-xl p-4"
          >
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{k.label}</p>
            <p className="text-2xl font-bold tabular-nums mt-1" style={{ color: k.color }}>{k.valor}</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-disabled)" }}>{k.sub}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Quick Actions ─── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon
          return (
            <motion.button
              key={a.label}
              variants={fadeIn}
              onClick={() => router.push(a.href)}
              whileTap={{ scale: 0.97 }}
              className="surface-interactive rounded-xl p-4 flex items-start gap-3 text-left"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Icon size={15} style={{ color: "#10B981" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{a.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* ─── Main grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Agenda del día */}
        <div className="lg:col-span-2 surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Agenda de hoy</p>
            <button
              onClick={() => router.push("/dashboard/nutricionista/miembros")}
              className="text-xs flex items-center gap-1"
              style={{ color: "#10B981" }}
            >
              Ver pacientes <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-1.5">
            {PACIENTES_HOY.map((p) => {
              const est = ESTADO_STYLE[p.estado]
              const Icon = est.icon
              return (
                <div
                  key={p.nombre + p.hora}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: "var(--bg-overlay)" }}
                >
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
                  >
                    {p.nombre[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {p.nombre}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      {p.objetivo} · IMC {p.imc}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] tabular-nums font-mono" style={{ color: "var(--text-tertiary)" }}>
                      {p.hora}
                    </span>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                      style={{ background: est.bg, color: est.color }}
                    >
                      <Icon size={9} />
                      {est.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel lateral */}
        <div className="flex flex-col gap-4">

          {/* Progreso del día */}
          <div className="surface rounded-xl p-4">
            <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Progreso del día</p>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "#10B981" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(completados / PACIENTES_HOY.length) * 100}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: easings.heroOut }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums" style={{ color: "#10B981" }}>
                {completados}/{PACIENTES_HOY.length}
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
              {pendientes} consulta{pendientes !== 1 ? "s" : ""} pendiente{pendientes !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Alertas nutricionales */}
          <div className="surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Alertas</p>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(239,68,68,0.08)", color: "var(--red)" }}
              >
                {ALERTAS_NUTRICION.length}
              </span>
            </div>
            <div className="space-y-2">
              {ALERTAS_NUTRICION.map((a, i) => {
                const s = PRIORIDAD_STYLE[a.prioridad]
                return (
                  <div key={i} className="px-3 py-2.5 rounded-lg" style={{ background: "var(--bg-overlay)" }}>
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{a.nombre}</p>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 capitalize"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {a.prioridad}
                      </span>
                    </div>
                    <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{a.razon}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
