"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { staggerContainer, fadeUp, easings } from "@/lib/motion"
import { Loader2 } from "lucide-react"
import {
  useGamificationLevel,
  useXPHistorial,
  useSesionesSemana,
  getTituloNivel,
  getXPIcon,
} from "@/hooks/useGamificacion"

const LOGROS_BASE = [
  { nombre: "Primer Mes",  icon: "🥇", desc: "Completa 30 días",     umbralXP: 1000  },
  { nombre: "Centurión",   icon: "💯", desc: "100 visitas al gym",   umbralXP: 5000  },
  { nombre: "Madrugador",  icon: "🌅", desc: "10 sesiones antes 7am",umbralXP: 3000  },
  { nombre: "Nivel 20",    icon: "⭐", desc: "Alcanza el nivel 20",  umbralNivel: 20 },
  { nombre: "Nivel 50",    icon: "🏆", desc: "Alcanza el nivel 50",  umbralNivel: 50 },
  { nombre: "Power Week",  icon: "🔥", desc: "7 sesiones en 7 días", umbralXP: 2000  },
]

function formatFechaRelativa(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const dias = Math.floor(hrs / 24)
  return `Hace ${dias} día${dias !== 1 ? "s" : ""}`
}

export default function ProgresoPage() {
  const { user }   = useAuth()
  const chartRef   = useRef<HTMLDivElement>(null)
  const inView     = useInView(chartRef, { once: true })
  const userId     = user?.id

  const nivelState    = useGamificationLevel(userId)
  const xpState       = useXPHistorial(userId)
  const sesionesState = useSesionesSemana(userId)

  const nivel    = nivelState.data
  const xpEvents = xpState.data ?? []
  const sesiones = sesionesState.data ?? []
  const maxSesiones = Math.max(...sesiones.map((s) => s.valor), 1)

  const xpTotal    = nivel?.xp_total ?? 0
  const nivelNum   = nivel?.nivel_actual ?? 1
  const xpProximo  = nivel?.xp_proximo_nivel ?? 500
  const titulo     = getTituloNivel(nivelNum)

  // XP acumulado en el nivel actual para la barra de progreso
  let xpAcumuladoHastaNivel = 0
  for (let n = 1; n < nivelNum; n++) {
    xpAcumuladoHastaNivel += Math.round(500 * Math.pow(1.15, n - 1))
  }
  const xpEnNivelActual = xpTotal - xpAcumuladoHastaNivel

  // Logros derivados de los datos reales
  const logros = LOGROS_BASE.map((l) => {
    const desbloqueado = l.umbralNivel
      ? nivelNum >= l.umbralNivel
      : xpTotal >= (l.umbralXP ?? 0)
    const progreso = l.umbralNivel
      ? Math.min(100, Math.round((nivelNum / l.umbralNivel) * 100))
      : Math.min(100, Math.round((xpTotal / (l.umbralXP ?? 1)) * 100))
    return { ...l, desbloqueado, progreso }
  })

  const loading = nivelState.loading || xpState.loading || sesionesState.loading

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Mi Progreso
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Estadísticas personales y gamificación
          </p>
        </motion.div>
      </motion.div>

      {/* ─── Stats rápidas ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface rounded-xl p-5 h-24 flex items-center justify-center">
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
              </div>
            ))
          : [
              { icon: "💪", label: "XP total",       valor: xpTotal.toLocaleString("es-PE"),    sub: `${xpEvents.length} eventos recientes` },
              { icon: "🔥", label: "Racha actual",   valor: `${sesiones.at(-1)?.valor ?? 0} ses.`, sub: `Semana actual` },
              { icon: "⭐", label: "Nivel GYMsos",   valor: `Nv. ${nivelNum}`,                  sub: titulo },
              { icon: "🏆", label: "Logros",         valor: `${logros.filter((l) => l.desbloqueado).length}/${logros.length}`, sub: "Desbloqueados" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="surface-interactive rounded-xl p-5"
              >
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xl font-bold mt-2 tabular-nums" style={{ color: "var(--accent)" }}>{s.valor}</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>{s.sub}</p>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* ─── Gráfico sesiones ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 surface rounded-xl p-6" ref={chartRef}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Sesiones por semana</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Últimas 8 semanas · accesos reales</p>
            </div>
            <span className="badge badge-green">
              {sesiones.reduce((s, d) => s + d.valor, 0)} total
            </span>
          </div>

          {sesionesState.loading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            </div>
          ) : (
            <div className="flex items-end gap-1 h-32">
              {sesiones.map((d, i) => {
                const isCurrent = i === sesiones.length - 1
                return (
                  <div key={d.semana} className="flex flex-col items-center gap-1.5 flex-1">
                    <motion.div
                      className="w-full rounded-t-sm"
                      style={{
                        background:  isCurrent ? "var(--accent)" : "var(--border-subtle)",
                        alignSelf:   "flex-end",
                      }}
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${(d.valor / maxSesiones) * 120}px` } : { height: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.55, ease: easings.heroOut }}
                    />
                    <span className="text-[9px]" style={{ color: isCurrent ? "var(--accent)" : "var(--text-disabled)" }}>
                      {d.semana}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* ─── Nivel XP ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="surface rounded-xl p-6"
        >
          <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>🎮 Nivel GYMsos</p>

          {nivelState.loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{
                    background: "linear-gradient(135deg, var(--accent) 0%, #00A86B 100%)",
                    boxShadow:  "0 0 30px rgba(0,208,132,0.25)",
                  }}
                >
                  <span className="font-black text-2xl" style={{ color: "#09090B" }}>{nivelNum}</span>
                </div>
                <p className="text-sm font-bold" style={{ color: "var(--accent)" }}>{titulo}</p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Nivel {nivelNum}</p>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: "var(--text-tertiary)" }}>→ Nv. {nivelNum + 1}</span>
                  <span style={{ color: "var(--accent)" }}>{xpEnNivelActual}/{xpProximo} XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--accent), #00E891)" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (xpEnNivelActual / xpProximo) * 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.8, ease: easings.heroOut }}
                  />
                </div>
              </div>
              <p className="text-center text-xs" style={{ color: "var(--text-disabled)" }}>
                {xpTotal.toLocaleString("es-PE")} XP acumulado
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* ─── Logros ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="surface rounded-xl p-6 mb-4"
      >
        <p className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>🏅 Logros</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {logros.map((l) => (
            <div
              key={l.nombre}
              className="rounded-xl p-4 text-center"
              style={{
                border:     `1px solid ${l.desbloqueado ? "rgba(0,208,132,0.25)" : "var(--border-faint)"}`,
                background: l.desbloqueado ? "rgba(0,208,132,0.06)" : "var(--bg-overlay)",
                opacity:    l.desbloqueado ? 1 : 0.65,
              }}
            >
              <p className="text-2xl mb-1">{l.icon}</p>
              <p className="text-sm font-bold" style={{ color: l.desbloqueado ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                {l.nombre}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>{l.desc}</p>
              {!l.desbloqueado && (
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                  <div className="h-full rounded-full" style={{ width: `${l.progreso}%`, background: "var(--accent)" }} />
                </div>
              )}
              {l.desbloqueado && (
                <p className="text-[10px] font-bold mt-1" style={{ color: "var(--accent)" }}>✓ Desbloqueado</p>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ─── Historial XP ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="surface rounded-xl overflow-hidden"
      >
        <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border-faint)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Últimos eventos XP</p>
        </div>

        {xpState.loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
          </div>
        ) : xpEvents.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--text-tertiary)" }}>
            Aún no hay eventos XP — empieza a entrenar 💪
          </p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
            {xpEvents.map((x) => (
              <div key={x.id_xp} className="px-5 py-3 flex items-center gap-3">
                <span className="text-lg">{getXPIcon(x.tipo_evento)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {x.descripcion ?? x.tipo_evento.replace(/_/g, " ")}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                    {formatFechaRelativa(x.fecha_evento)}
                  </p>
                </div>
                <span className="text-sm font-black tabular-nums" style={{ color: "var(--accent)" }}>
                  +{x.cantidad_xp} XP
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
