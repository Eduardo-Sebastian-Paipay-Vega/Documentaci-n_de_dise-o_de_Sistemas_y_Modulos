"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { fadeIn, staggerContainer, staggerFast, easings } from "@/lib/motion"
import { QrCode, Flame, Trophy, CalendarCheck, ChevronRight, Check } from "lucide-react"

const CLASES = [
  { nombre: "Spinning Extremo", hora: "07:30", entrenador: "Coach Ana", sala: "Sala A", cupos: 3,  inscrito: true  },
  { nombre: "Yoga Flow",        hora: "10:00", entrenador: "María V.",  sala: "Sala B", cupos: 8,  inscrito: false },
  { nombre: "HIIT Total",       hora: "18:30", entrenador: "Coach J.",  sala: "Sala C", cupos: 1,  inscrito: false },
]

const PROGRESO_SEMANAL = [3, 5, 2, 6, 4, 7, 5, 8]
const MAX = 8

export default function MiembroDashboard() {
  const { user } = useAuth()
  const chartRef = useRef<HTMLDivElement>(null)
  const inView   = useInView(chartRef, { once: true })

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1200px]">

      {/* ─── Header ─── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={fadeIn} className="flex items-start justify-between">
          <div>
            <p className="text-xs mb-1 capitalize" style={{ color: "var(--text-tertiary)" }}>
              {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {user?.nombre}
            </h1>
            {user?.membresia && (
              <div className="mt-2 inline-flex items-center gap-1.5">
                <span className="status-dot status-dot-live" />
                <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                  {user.membresia.plan}
                </span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  · vence {user.membresia.fecha_vencimiento}
                </span>
              </div>
            )}
          </div>

          <motion.a
            variants={fadeIn}
            href="/dashboard/miembro/qr"
            className="flex items-center gap-2 h-8 px-3 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            <QrCode size={13} />
            Mi QR
          </motion.a>
        </motion.div>
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {[
          { icon: CalendarCheck, label: "Sesiones este mes", value: "8",      accent: "var(--accent)" },
          { icon: Flame,         label: "Racha actual",      value: "5 días",  accent: "#F97316" },
          { icon: Trophy,        label: "Nivel GYMsos",      value: "Nv. 32",  accent: "#8B5CF6" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              variants={fadeIn}
              className="surface-interactive rounded-xl p-4"
            >
              <Icon size={15} className="mb-3" style={{ color: s.accent }} />
              <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                {s.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {s.label}
              </p>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Progress chart */}
        <div className="lg:col-span-2 surface rounded-xl p-6" ref={chartRef}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Actividad semanal
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Sesiones últimas 8 semanas
              </p>
            </div>
            <span className="badge badge-green">Meta: 5/sem</span>
          </div>

          <div className="flex items-end gap-2 h-24 mb-4">
            {PROGRESO_SEMANAL.map((v, i) => {
              const isCurrent = i === PROGRESO_SEMANAL.length - 1
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-1">
                  <motion.div
                    className="w-full rounded-sm"
                    style={{
                      background: isCurrent ? "var(--accent)" : "var(--border-faint)",
                      alignSelf: "flex-end",
                    }}
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${(v / MAX) * 96}px` } : {}}
                    transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: easings.heroOut }}
                  />
                  <span
                    className="text-[9px]"
                    style={{ color: isCurrent ? "var(--accent)" : "var(--text-disabled)" }}
                  >
                    S{i + 1}
                  </span>
                </div>
              )
            })}
          </div>

          <div
            className="flex items-center justify-between pt-4"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Objetivo semanal</p>
              <p className="text-sm font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>
                4 / 5 sesiones
              </p>
            </div>
            <a
              href="/dashboard/miembro/progreso"
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: "var(--text-tertiary)" }}
            >
              Ver progreso completo <ChevronRight size={12} />
            </a>
          </div>
        </div>

        {/* Membership card — physical, dimensional */}
        <div
          className="rounded-xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #00D084 0%, #009E64 100%)",
          }}
        >
          {/* Embossed circle detail */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full"
            style={{ background: "rgba(0,0,0,0.08)" }}
          />

          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase"
                style={{ color: "rgba(0,60,35,0.7)" }}
              >
                GYMsos
              </span>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.15)" }}
              >
                <span className="text-[10px] font-black" style={{ color: "rgba(255,255,255,0.9)" }}>G</span>
              </div>
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight" style={{ color: "#003C23" }}>
                {user?.membresia?.plan ?? "Plan Activo"}
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "rgba(0,60,35,0.7)" }}>
                {user?.nombre}
              </p>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium" style={{ color: "rgba(0,60,35,0.55)" }}>
                  Vence
                </p>
                <p className="text-sm font-bold" style={{ color: "#003C23" }}>
                  {user?.membresia?.fecha_vencimiento ?? "—"}
                </p>
              </div>
              <a
                href="/dashboard/miembro/membresia"
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: "rgba(0,0,0,0.12)",
                  color: "#003C23",
                }}
              >
                Gestionar
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Upcoming classes ─── */}
      <div className="surface rounded-xl overflow-hidden">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--border-faint)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Clases de hoy
          </p>
          <a
            href="/dashboard/miembro/clases"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Ver todas <ChevronRight size={12} />
          </a>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
          {CLASES.map((c, i) => (
            <motion.div
              key={c.nombre}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.25, ease: easings.sharp }}
              className="px-5 py-3.5 flex items-center gap-4"
            >
              <div className="w-14 shrink-0">
                <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {c.hora}
                </p>
                <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>hoy</p>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {c.nombre}
                </p>
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
                  {c.entrenador} · {c.sala}
                </p>
              </div>

              <span
                className="badge shrink-0"
                style={{
                  background: c.cupos <= 2 ? "rgba(249,115,22,0.1)" : "var(--accent-dim)",
                  color: c.cupos <= 2 ? "#F97316" : "var(--accent)",
                  border: `1px solid ${c.cupos <= 2 ? "rgba(249,115,22,0.2)" : "var(--accent-border)"}`,
                }}
              >
                {c.cupos} {c.cupos === 1 ? "cupo" : "cupos"}
              </span>

              {c.inscrito ? (
                <div
                  className="flex items-center gap-1 text-xs font-medium shrink-0"
                  style={{ color: "var(--accent)" }}
                >
                  <Check size={12} />
                  Inscrito
                </div>
              ) : (
                <button
                  className="shrink-0 h-7 px-3 rounded-md text-xs font-semibold transition-colors"
                  style={{
                    background: "var(--bg-muted)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "var(--accent)"
                    e.currentTarget.style.color = "#09090B"
                    e.currentTarget.style.borderColor = "var(--accent)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "var(--bg-muted)"
                    e.currentTarget.style.color = "var(--text-secondary)"
                    e.currentTarget.style.borderColor = "var(--border-subtle)"
                  }}
                >
                  Inscribirse
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
