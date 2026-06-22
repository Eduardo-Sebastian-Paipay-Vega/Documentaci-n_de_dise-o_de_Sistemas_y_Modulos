"use client"
// REEMPLAZADO: datos reales desde Supabase via hooks
import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { fadeIn, staggerContainer, staggerFast, easings } from "@/lib/motion"
import { useClasesHoy, useInscripcionesDelMiembro } from "@/hooks/useClases"
import { useHistorialMiembro } from "@/hooks/useAccesos"
import { QrCode, Flame, Trophy, CalendarCheck, ChevronRight, Check, Loader2 } from "lucide-react"
import { inscribirseEnClase, cancelarInscripcion } from "@/lib/services"

export default function MiembroDashboard() {
  const { user }   = useAuth()
  const router     = useRouter()
  const chartRef   = useRef<HTMLDivElement>(null)
  const inView     = useInView(chartRef, { once: true })
  const userId     = user?.id
  const gymId      = user?.tenant_id ?? undefined

  const clasesState        = useClasesHoy(gymId)
  const inscripcionesState = useInscripcionesDelMiembro(userId)
  const historialState     = useHistorialMiembro(userId)

  const clases        = clasesState.data ?? []
  const inscripciones = inscripcionesState.data ?? []
  const historial     = historialState.data ?? []

  const [inscribiendose, setInscribiendose] = useState<string | null>(null)

  async function toggleInscripcion(claseId: string, estaInscrito: boolean) {
    if (!userId || inscribiendose) return
    setInscribiendose(claseId)
    try {
      if (estaInscrito) await cancelarInscripcion(userId, claseId)
      else await inscribirseEnClase(userId, claseId)
      inscripcionesState.refetch()
    } finally {
      setInscribiendose(null)
    }
  }

  const SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const hoy = new Date()
  const inicioSemana = new Date(hoy)
  inicioSemana.setDate(hoy.getDate() - ((hoy.getDay() || 7) - 1))
  inicioSemana.setHours(0, 0, 0, 0)

  const progreso = SEMANA.map((dia, i) => {
    const diaFecha = new Date(inicioSemana)
    diaFecha.setDate(inicioSemana.getDate() + i)
    const fin = new Date(diaFecha); fin.setHours(23, 59, 59)
    const asistio = historial.some((a) => {
      const f = new Date(a.fecha_hora_entrada)
      return f >= diaFecha && f <= fin && a.estado_acceso === "permitido"
    })
    return { dia, asistio }
  })

  const rachaActual = progreso.filter((d) => d.asistio).length
  const sesionesMes = historial.filter((h) => {
    const f = new Date(h.fecha_hora_entrada)
    return f.getMonth() === new Date().getMonth() && h.estado_acceso === "permitido"
  }).length

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1200px]">

      {/* ─── Header ─── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeIn} className="flex items-start justify-between">
          <div>
            <p className="text-xs mb-1 capitalize" style={{ color: "var(--text-tertiary)" }}>
              {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {user?.full_name}
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

          <motion.button
            variants={fadeIn}
            onClick={() => router.push("/dashboard/miembro/qr")}
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
          </motion.button>
        </motion.div>
      </motion.div>

      {/* ─── Quick Stats ─── */}
      <motion.div className="grid grid-cols-3 gap-3 mb-6" variants={staggerFast} initial="hidden" animate="visible">
        {[
          { icon: CalendarCheck, label: "Sesiones este mes", value: historialState.loading ? "—" : String(sesionesMes), accent: "var(--accent)" },
          { icon: Flame,         label: "Racha esta semana", value: historialState.loading ? "—" : `${rachaActual} días`, accent: "#F97316" },
          { icon: Trophy,        label: "Nivel GYMsos",      value: "Nv. 1",  accent: "#8B5CF6" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={fadeIn} className="surface-interactive rounded-xl p-4">
              <Icon size={15} className="mb-3" style={{ color: s.accent }} />
              <p className="text-lg font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{s.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{s.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Progreso semanal */}
        <div className="lg:col-span-2 surface rounded-xl p-6" ref={chartRef}>
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Asistencia semanal</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Días asistidos esta semana</p>
            </div>
            <span className="badge badge-green">{rachaActual}/7 días</span>
          </div>

          {historialState.loading ? (
            <div className="flex items-center justify-center h-16">
              <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            </div>
          ) : (
            <div className="flex gap-1.5">
              {progreso.map((d, i) => (
                <div key={d.dia} className="flex-1 flex flex-col items-center gap-1.5">
                  <motion.div
                    className="w-full h-8 rounded-md flex items-center justify-center"
                    style={{ background: d.asistio ? "var(--accent)" : "var(--bg-muted)" }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={inView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: i * 0.06, duration: 0.25, ease: easings.heroOut }}
                  >
                    {d.asistio && <Check size={12} style={{ color: "#09090B" }} />}
                  </motion.div>
                  <span className="text-[9px]" style={{ color: d.asistio ? "var(--accent)" : "var(--text-disabled)" }}>
                    {d.dia}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tarjeta membresía */}
        <div className="rounded-xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #00D084 0%, #009E64 100%)" }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full" style={{ background: "rgba(0,0,0,0.08)" }} />
          <div className="relative z-10 h-full flex flex-col justify-between gap-8">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "rgba(0,60,35,0.7)" }}>GYMsos</span>
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "rgba(0,0,0,0.15)" }}>
                <span className="text-[10px] font-black" style={{ color: "rgba(255,255,255,0.9)" }}>G</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight" style={{ color: "#003C23" }}>
                {user?.membresia?.plan ?? "Sin plan"}
              </p>
              <p className="text-sm font-medium mt-0.5" style={{ color: "rgba(0,60,35,0.7)" }}>{user?.full_name}</p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium" style={{ color: "rgba(0,60,35,0.55)" }}>Vence</p>
                <p className="text-sm font-bold" style={{ color: "#003C23" }}>{user?.membresia?.fecha_vencimiento ?? "—"}</p>
              </div>
              <button
                onClick={() => router.push("/dashboard/miembro/membresia")}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(0,0,0,0.12)", color: "#003C23" }}
              >
                Gestionar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Clases de hoy ─── */}
      <div className="surface rounded-xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-faint)" }}>
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Clases de hoy</p>
          <button onClick={() => router.push("/dashboard/miembro/clases")} className="flex items-center gap-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
            Ver todas <ChevronRight size={12} />
          </button>
        </div>

        {clasesState.loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
          </div>
        ) : clases.length === 0 ? (
          <p className="text-xs text-center py-8" style={{ color: "var(--text-tertiary)" }}>No hay clases programadas para hoy</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
            {clases.map((c, i) => {
              const estaInscrito = inscripciones.includes(c.id_clase)
              const procesando   = inscribiendose === c.id_clase
              const llena        = c.inscritos !== undefined && c.inscritos >= c.capacidad_maxima && !estaInscrito

              return (
                <div key={c.id_clase} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-14 shrink-0">
                    <p className="text-sm font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {new Date(c.fecha_hora_inicio).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>hoy</p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{c.nombre}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
                      {c.nombre_entrenador} · {c.nombre_espacio}
                    </p>
                  </div>

                  <span className="badge shrink-0" style={{
                    background: llena ? "rgba(239,68,68,0.1)" : "var(--accent-dim)",
                    color: llena ? "var(--red)" : "var(--accent)",
                    border: `1px solid ${llena ? "rgba(239,68,68,0.2)" : "var(--accent-border)"}`,
                  }}>
                    {c.inscritos}/{c.capacidad_maxima}
                  </span>

                  <button
                    onClick={() => toggleInscripcion(c.id_clase, estaInscrito)}
                    disabled={llena || procesando}
                    className="shrink-0 h-7 px-3 rounded-md text-xs font-semibold transition-all"
                    style={{
                      background: estaInscrito ? "var(--accent)" : "var(--bg-muted)",
                      color: estaInscrito ? "#09090B" : llena ? "var(--text-disabled)" : "var(--text-secondary)",
                      border: `1px solid ${estaInscrito ? "transparent" : "var(--border-subtle)"}`,
                    }}
                  >
                    {procesando ? <Loader2 size={10} className="animate-spin" /> : estaInscrito ? <><Check size={10} /> Inscrito</> : llena ? "Llena" : "Inscribirse"}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
