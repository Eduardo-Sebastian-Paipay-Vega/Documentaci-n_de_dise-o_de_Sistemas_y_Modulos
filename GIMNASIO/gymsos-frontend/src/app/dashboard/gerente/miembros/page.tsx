"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/motion"
import { useAuth } from "@/components/providers/auth-provider"
import { useMiembros } from "@/hooks/useMiembros"
import { Loader2, Search, UserPlus, Filter } from "lucide-react"
import { actualizarEstadoUsuario } from "@/lib/services"

type FiltroEstado = "todos" | "activa" | "vencida" | "suspendida"

const PLAN_COLOR: Record<string, string> = {
  "Basic":        "#6B7280",
  "Silver":       "#9CA3AF",
  "Gold Premium": "#F59E0B",
  "Enterprise":   "#8B5CF6",
}

export default function MiembrosPage() {
  const { user }  = useAuth()
  const gymId     = user?.id_gimnasio

  const [busqueda, setBusqueda]  = useState("")
  const [filtro, setFiltro]      = useState<FiltroEstado>("todos")
  const [seleccionado, setSeleccionado] = useState<string | null>(null)
  const [modalNuevo, setModalNuevo] = useState(false)

  const { miembros, total, loading, error, refetch } = useMiembros(gymId, { busqueda })

  const filtrados = miembros.filter((m) => {
    if (filtro === "todos") return true
    return m.membresia?.estado === filtro
  })

  const stats = {
    total,
    activos:  miembros.filter(m => m.membresia?.estado === "activa").length,
    riesgo:   miembros.filter(m => (m.score_churn ?? 0) >= 60).length,
    vencidos: miembros.filter(m => m.membresia?.estado === "vencida").length,
  }

  async function cambiarEstado(id: string, estado: "activo" | "suspendido") {
    await actualizarEstadoUsuario(id, estado)
    refetch()
  }

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Gestión de Miembros</h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {stats.total} miembros registrados · GymFit Lima
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setModalNuevo(true)}
            className="bg-[#00D084] text-[#070D18] font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#00E891] transition-colors shadow-[0_0_20px_rgba(0,208,132,0.2)]"
          >
            + Nuevo Miembro
          </motion.button>
        </motion.div>

        {/* Stats rápidas */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Total",         value: stats.total,    color: "#00D084", icon: "👥" },
            { label: "Activos",       value: stats.activos,  color: "#10B981", icon: "✅" },
            { label: "En riesgo",     value: stats.riesgo,   color: "#F59E0B", icon: "⚠️" },
            { label: "Vencidos",      value: stats.vencidos, color: "#EF4444", icon: "❌" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-white font-black text-xl" style={{ color: s.color }}>{s.value}</p>
                <p className="text-neutral-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
        />
        <div className="flex gap-2 shrink-0">
          {(["todos","activa","vencida","suspendida"] as FiltroEstado[]).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                filtro === f
                  ? "bg-[#00D084] text-[#070D18]"
                  : "glass-card text-neutral-400 hover:text-white",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de miembros */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {error && (
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-sm font-semibold text-[#EF4444]">No se pudo cargar datos reales de Supabase</p>
            <p className="text-xs mt-1 text-neutral-400">{error}</p>
            <p className="text-[11px] mt-2 text-neutral-500">
              Tip: suele ser una policy RLS faltante en alguna tabla relacionada (por ejemplo `membresias`, `planes` o `churn_predictions`).
            </p>
          </div>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={20} className="animate-spin text-neutral-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Miembro</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Plan</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Membresía</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Vence</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Riesgo</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((m, i) => {
                  const churn = m.score_churn ?? 0
                  const planNombre = m.membresia?.plan_nombre ?? "—"
                  return (
                    <motion.tr
                      key={m.id_usuario}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-white/4 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-[#070D18] shrink-0",
                            m.estado === "suspendido" ? "bg-[#EF4444]" : "bg-[#00D084]"
                          )}>
                            {m.nombre[0]}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{m.nombre}</p>
                            <p className="text-neutral-600 text-xs">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                          background: `${PLAN_COLOR[planNombre] ?? "#6B7280"}20`,
                          color:       PLAN_COLOR[planNombre] ?? "#6B7280",
                        }}>
                          {planNombre}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full capitalize",
                          m.membresia?.estado === "activa"     ? "bg-[#10B981]/15 text-[#10B981]" :
                          m.membresia?.estado === "vencida"    ? "bg-[#EF4444]/15 text-[#EF4444]" :
                          m.membresia?.estado === "suspendida" ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                                                                  "bg-white/10 text-neutral-400"
                        )}>
                          {m.membresia?.estado ?? "sin plan"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <p className="text-white text-sm tabular-nums">
                          {m.membresia?.fecha_vencimiento ?? "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 bg-white/8 rounded-full w-16 overflow-hidden">
                            <div className="h-full rounded-full" style={{
                              width:      `${churn}%`,
                              background: churn >= 70 ? "#EF4444" : churn >= 40 ? "#F59E0B" : "#10B981",
                            }} />
                          </div>
                          <span className={cn("text-[10px] font-bold",
                            churn >= 70 ? "text-[#EF4444]" : churn >= 40 ? "text-[#F59E0B]" : "text-[#10B981]"
                          )}>
                            {churn}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSeleccionado(seleccionado === m.id_usuario ? null : m.id_usuario)}
                            className="text-xs px-2.5 py-1 rounded-lg glass-card text-neutral-300 hover:text-white transition-all"
                          >
                            Ver
                          </button>
                          {m.estado === "suspendido" ? (
                            <button
                              onClick={() => cambiarEstado(m.id_usuario, "activo")}
                              className="text-xs px-2.5 py-1 rounded-lg bg-[#10B981]/15 text-[#10B981] font-semibold transition-all"
                            >
                              Reactivar
                            </button>
                          ) : churn >= 60 ? (
                            <button className="text-xs px-2.5 py-1 rounded-lg bg-[#EF4444]/15 text-[#EF4444] font-semibold transition-all">
                              Intervenir
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

            {filtrados.length === 0 && (
              <div className="text-center py-12 text-neutral-500">
                <p className="text-4xl mb-3">🔍</p>
                <p>No se encontraron miembros con ese criterio</p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {modalNuevo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setModalNuevo(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-md glass-card rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">Nuevo miembro</p>
                  <p className="text-neutral-500 text-xs mt-1">
                    Pantalla en construccion. Por ahora crea usuarios desde Supabase Auth + tabla `usuarios`.
                  </p>
                </div>
                <button
                  className="text-neutral-400 hover:text-white text-sm"
                  onClick={() => setModalNuevo(false)}
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
