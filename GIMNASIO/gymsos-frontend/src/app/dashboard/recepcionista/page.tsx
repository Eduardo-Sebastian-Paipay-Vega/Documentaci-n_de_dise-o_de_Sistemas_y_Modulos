"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/components/providers/auth-provider"
import { fadeIn, staggerContainer, staggerFast, easings } from "@/lib/motion"
import { useAccesosRecientes, useConteoAccesos } from "@/hooks/useAccesos"
import { usePagosPendientes } from "@/hooks/useMiembros"
import {
  UserPlus, Banknote, DoorOpen, Headphones,
  ArrowDownToLine, ArrowUpFromLine, ChevronRight, Loader2,
} from "lucide-react"
import { useRouter } from "next/navigation"

const QUICK_ACTIONS = [
  { icon: UserPlus,   label: "Nuevo registro", desc: "Registrar nuevo miembro",    href: "/dashboard/recepcionista/registro" },
  { icon: Banknote,   label: "Cobrar",         desc: "Registrar pago o renovación",href: "/dashboard/recepcionista/pagos" },
  { icon: DoorOpen,   label: "Acceso manual",  desc: "Registrar entrada/salida",   href: "/dashboard/recepcionista/acceso" },
  { icon: Headphones, label: "Soporte",        desc: "Ver tickets pendientes",     href: "/dashboard/recepcionista/soporte" },
]

const PRIORIDAD_STYLE = {
  alta:  { label: "Alta",  color: "var(--red)",  bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.18)" },
  media: { label: "Media", color: "#F97316",     bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.18)" },
  baja:  { label: "Baja",  color: "var(--blue)", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.18)" },
}

const COLA_SOPORTE = [
  { nombre: "Pedro R.",  asunto: "No puedo acceder con mi QR",   prioridad: "alta"  as const, tiempo: "5 min" },
  { nombre: "Lucía M.",  asunto: "Quiero cambiar mi plan",       prioridad: "media" as const, tiempo: "12 min" },
  { nombre: "Diego T.",  asunto: "Cobro duplicado en mi cuenta", prioridad: "alta"  as const, tiempo: "18 min" },
]

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })
}

export default function RecepcionistaDashboard() {
  const { user } = useAuth()
  const router   = useRouter()
  const gymId    = user?.tenant_id ?? undefined

  const accesosState = useAccesosRecientes(gymId, 10)
  const conteoState  = useConteoAccesos(gymId)
  const pagosState   = usePagosPendientes(gymId)

  const accesos = accesosState.data ?? []
  const conteo  = conteoState.data ?? { total: 0, actualmente_dentro: 0 }
  const pagos   = pagosState.data ?? []

  const now = new Date().toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  })

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
              Recepción · {user?.tenant_name ?? "GymFit Lima"} ·{" "}
              <span style={{ color: "var(--blue)" }}>Turno mañana</span>
            </p>
          </div>

          <motion.div variants={fadeIn} className="flex items-center gap-5">
            {conteoState.loading ? (
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            ) : (
              <>
                <div className="text-right">
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Accesos hoy</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                    {conteo.total}
                  </p>
                </div>
                <div className="w-px h-8" style={{ background: "var(--border-subtle)" }} />
                <div className="text-right">
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>En el gym</p>
                  <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
                    {conteo.actualmente_dentro}
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
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
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bg-muted)" }}>
                <Icon size={15} style={{ color: "var(--text-tertiary)" }} />
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

        {/* Accesos recientes */}
        <div className="lg:col-span-2 surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Accesos recientes</p>
            <button
              onClick={() => router.push("/dashboard/recepcionista/acceso")}
              className="text-xs flex items-center gap-1"
              style={{ color: "var(--accent)" }}
            >
              Ver todo <ChevronRight size={12} />
            </button>
          </div>

          {accesosState.loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
            </div>
          ) : (
            <div className="space-y-1">
              {accesos.map((a) => (
                <div
                  key={a.id_acceso}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: "var(--bg-overlay)" }}
                >
                  <div
                    className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
                  >
                    {(a.nombre_usuario ?? "?")[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {a.nombre_usuario ?? "—"}
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      {a.plan_usuario ?? "Sin plan"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] tabular-nums" style={{ color: "var(--text-tertiary)" }}>
                      {formatHora(a.fecha_hora_entrada)}
                    </span>
                    <div
                      className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                      style={{
                        background: a.fecha_hora_salida ? "var(--bg-muted)" : "var(--accent-dim)",
                        color:      a.fecha_hora_salida ? "var(--text-tertiary)" : "var(--accent)",
                      }}
                    >
                      {a.fecha_hora_salida
                        ? <><ArrowUpFromLine size={9} /> Salida</>
                        : <><ArrowDownToLine size={9} /> Entrada</>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div className="flex flex-col gap-4">

          {/* Pagos por vencer */}
          <div className="surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Pagos por vencer</p>
              <span className="badge badge-red">{pagos.length}</span>
            </div>

            {pagosState.loading ? (
              <div className="flex items-center justify-center h-20">
                <Loader2 size={14} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
              </div>
            ) : (
              <div className="space-y-2">
                {pagos.slice(0, 3).map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "var(--bg-overlay)" }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{p.nombre_usuario}</p>
                      <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                        {p.plan_nombre} · {new Date(p.fecha_pago).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      S/ {p.monto.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/dashboard/recepcionista/pagos")}
              className="mt-3 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] transition-colors"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
            >
              Ver pagos <ChevronRight size={11} />
            </button>
          </div>

          {/* Cola de soporte */}
          <div className="surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cola de soporte</p>
              <span className="badge badge-amber">{COLA_SOPORTE.length}</span>
            </div>
            <div className="space-y-2">
              {COLA_SOPORTE.map((t, i) => {
                const s = PRIORIDAD_STYLE[t.prioridad]
                return (
                  <div key={i} className="px-3 py-2.5 rounded-lg" style={{ background: "var(--bg-overlay)" }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{t.nombre}</p>
                      <span
                        className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>{t.asunto}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>Hace {t.tiempo}</p>
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
