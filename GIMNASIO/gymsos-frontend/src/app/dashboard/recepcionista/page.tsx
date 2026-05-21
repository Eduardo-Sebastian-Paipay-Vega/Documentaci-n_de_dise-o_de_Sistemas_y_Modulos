"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { fadeIn, staggerContainer, staggerFast, easings } from "@/lib/motion"
import {
  UserPlus, Banknote, DoorOpen, Headphones,
  ArrowDownToLine, ArrowUpFromLine, ChevronRight, AlertCircle
} from "lucide-react"

const ACCESOS_RECIENTES = [
  { nombre: "Ana Torres",  hora: "08:47", plan: "Premium", tipo: "entrada" as const },
  { nombre: "Carlos M.",   hora: "08:31", plan: "Gold",    tipo: "entrada" as const },
  { nombre: "Jorge F.",    hora: "08:12", plan: "Gold",    tipo: "salida"  as const },
  { nombre: "Rosa Ch.",    hora: "07:58", plan: "Basic",   tipo: "entrada" as const },
  { nombre: "Luis P.",     hora: "07:45", plan: "Silver",  tipo: "salida"  as const },
  { nombre: "María V.",    hora: "07:30", plan: "Premium", tipo: "entrada" as const },
]

const COLA_SOPORTE = [
  { nombre: "Pedro R.",  asunto: "No puedo acceder con mi QR",   prioridad: "alta"  as const, tiempo: "5 min" },
  { nombre: "Lucía M.",  asunto: "Quiero cambiar mi plan",       prioridad: "media" as const, tiempo: "12 min" },
  { nombre: "Diego T.",  asunto: "Cobro duplicado en mi cuenta", prioridad: "alta"  as const, tiempo: "18 min" },
  { nombre: "Carla S.",  asunto: "Consulta sobre horarios",      prioridad: "baja"  as const, tiempo: "25 min" },
]

const PAGOS_PENDIENTES = [
  { nombre: "Roberto L.", monto: 89,  plan: "Silver", vence: "Hoy" },
  { nombre: "Sandra P.",  monto: 129, plan: "Gold",   vence: "Mañana" },
  { nombre: "Marcos D.",  monto: 49,  plan: "Basic",  vence: "En 3 días" },
]

const PRIORIDAD_STYLE = {
  alta:  { label: "Alta",  color: "var(--red)",   bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.18)" },
  media: { label: "Media", color: "#F97316",       bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.18)" },
  baja:  { label: "Baja",  color: "var(--blue)",  bg: "rgba(59,130,246,0.08)",  border: "rgba(59,130,246,0.18)" },
}

export default function RecepcionistaDashboard() {
  const { user } = useAuth()

  const now = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  })

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1400px]">

      {/* ─── Header ─── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={fadeIn} className="flex items-start justify-between">
          <div>
            <p className="text-xs capitalize mb-1" style={{ color: "var(--text-tertiary)" }}>{now}</p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {user?.nombre}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Recepción · GymFit Lima ·{" "}
              <span style={{ color: "var(--blue)" }}>Turno mañana</span>
            </p>
          </div>

          <motion.div variants={fadeIn} className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Accesos hoy</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>42</p>
            </div>
            <div
              className="w-px h-8"
              style={{ background: "var(--border-subtle)" }}
            />
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>En el gym</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--blue)" }}>18</p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ─── KPI row ─── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: UserPlus,  label: "Registros hoy",    value: "3", color: "var(--accent)" },
          { icon: Banknote,  label: "Pagos procesados", value: "7", color: "var(--blue)" },
          { icon: Headphones,label: "Cola soporte",     value: "4", color: "#F97316" },
          { icon: AlertCircle,label:"Alertas QR",       value: "1", color: "var(--red)" },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              variants={fadeIn}
              className="surface-interactive rounded-xl p-4"
            >
              <Icon size={14} className="mb-3" style={{ color: kpi.color }} />
              <p className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {kpi.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {kpi.label}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* ─── Main grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

        {/* Accesos recientes */}
        <div className="surface rounded-xl overflow-hidden">
          <div
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Control de acceso
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="status-dot status-dot-live" />
              <span className="text-[10px] font-medium" style={{ color: "var(--accent)" }}>Live</span>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
            {ACCESOS_RECIENTES.map((a, i) => (
              <motion.div
                key={`${a.nombre}-${a.hora}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.25, ease: easings.heroOut }}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center"
                  style={{
                    background: a.tipo === "entrada" ? "var(--accent-dim)" : "rgba(239,68,68,0.08)",
                  }}
                >
                  {a.tipo === "entrada"
                    ? <ArrowDownToLine size={11} style={{ color: "var(--accent)" }} />
                    : <ArrowUpFromLine size={11} style={{ color: "var(--red)" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {a.nombre}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                    {a.plan}
                  </p>
                </div>
                <span className="text-[10px] tabular-nums shrink-0" style={{ color: "var(--text-disabled)" }}>
                  {a.hora}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="px-4 py-3" style={{ borderTop: "1px solid var(--border-faint)" }}>
            <a
              href="/dashboard/recepcionista/acceso"
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors"
              style={{
                background: "var(--bg-muted)",
                color: "var(--text-secondary)",
              }}
            >
              Ver historial completo <ChevronRight size={11} />
            </a>
          </div>
        </div>

        {/* Pagos pendientes */}
        <div className="surface rounded-xl overflow-hidden">
          <div
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Pagos pendientes
            </p>
            <span className="badge badge-amber">{PAGOS_PENDIENTES.length}</span>
          </div>

          <div className="p-4 space-y-2">
            {PAGOS_PENDIENTES.map((p, i) => (
              <motion.div
                key={p.nombre}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.25, ease: easings.heroOut }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{
                  background: "var(--bg-base)",
                  border: "1px solid var(--border-faint)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                  style={{ background: "rgba(59,130,246,0.1)", color: "var(--blue)" }}
                >
                  {p.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {p.nombre}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {p.plan} · vence {p.vence}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    S/ {p.monto}
                  </p>
                  <button
                    className="text-[10px] font-semibold transition-colors"
                    style={{ color: "var(--blue)" }}
                  >
                    Cobrar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <a
              href="/dashboard/recepcionista/pagos"
              className="flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-colors"
              style={{
                background: "var(--bg-muted)",
                color: "var(--text-secondary)",
              }}
            >
              Procesar pago manual <ChevronRight size={11} />
            </a>
          </div>
        </div>

        {/* Cola soporte */}
        <div className="surface rounded-xl overflow-hidden">
          <div
            className="px-4 py-3.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Cola de soporte
            </p>
            <span className="badge badge-red">{COLA_SOPORTE.length} en espera</span>
          </div>

          <div className="p-4 space-y-2">
            {COLA_SOPORTE.map((t, i) => {
              const s = PRIORIDAD_STYLE[t.prioridad]
              return (
                <motion.div
                  key={t.nombre}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.25, ease: easings.heroOut }}
                  className="px-3 py-2.5 rounded-lg"
                  style={{
                    background: "var(--bg-base)",
                    border: "1px solid var(--border-faint)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                      {t.nombre}
                    </p>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-[11px] mb-1.5" style={{ color: "var(--text-tertiary)" }}>
                    {t.asunto}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      Hace {t.tiempo}
                    </span>
                    <button
                      className="text-[10px] font-semibold px-2 py-0.5 rounded transition-colors"
                      style={{
                        background: "rgba(59,130,246,0.1)",
                        color: "var(--blue)",
                      }}
                    >
                      Atender →
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Quick links ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {[
          { icon: UserPlus,  label: "Registrar Miembro", href: "/dashboard/recepcionista/registro" },
          { icon: Banknote,  label: "Procesar Pago",     href: "/dashboard/recepcionista/pagos" },
          { icon: DoorOpen,  label: "Control Acceso",    href: "/dashboard/recepcionista/acceso" },
          { icon: Headphones,label: "Soporte",           href: "/dashboard/recepcionista/soporte" },
        ].map((a, i) => {
          const Icon = a.icon
          return (
            <motion.a
              key={a.label}
              href={a.href}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.25, ease: easings.heroOut }}
              whileTap={{ scale: 0.98 }}
              className="surface-interactive rounded-xl p-4 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--bg-muted)" }}
              >
                <Icon size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {a.label}
              </span>
            </motion.a>
          )
        })}
      </div>
    </div>
  )
}
