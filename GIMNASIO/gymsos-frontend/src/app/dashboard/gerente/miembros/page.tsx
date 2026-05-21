"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/motion"

// Datos de miembros — en producción vienen de Supabase:
// SELECT u.*, m.estado, m.fecha_vencimiento, p.nombre as plan
// FROM usuarios u LEFT JOIN membresias m ON u.id_usuario = m.id_usuario
// LEFT JOIN planes p ON m.id_plan = p.id_plan
// WHERE u.id_gimnasio = get_user_gym() AND u.rol = 'miembro'
const MIEMBROS = [
  { id: "001", nombre: "Juan Quispe",     email: "juan@email.com",  telefono: "+51 912 345 678", plan: "Gold Premium", estado_mem: "activa",    vencimiento: "2026-06-30", estado: "activo",  sesiones: 24, score_churn: 12 },
  { id: "002", nombre: "Rosa Chávez",     email: "rosa@email.com",  telefono: "+51 934 567 890", plan: "Silver",       estado_mem: "activa",    vencimiento: "2026-05-31", estado: "activo",  sesiones: 6,  score_churn: 58 },
  { id: "003", nombre: "Pedro Llontop",   email: "pedro@email.com", telefono: "+51 956 789 012", plan: "Basic",        estado_mem: "activa",    vencimiento: "2026-06-15", estado: "activo",  sesiones: 3,  score_churn: 71 },
  { id: "004", nombre: "Carmen Torres",   email: "carmen@email.com",telefono: "+51 923 456 789", plan: "Gold Premium", estado_mem: "vencida",   vencimiento: "2026-04-30", estado: "activo",  sesiones: 0,  score_churn: 88 },
  { id: "005", nombre: "Luis Mamani",     email: "luis@email.com",  telefono: "+51 945 678 901", plan: "Enterprise",   estado_mem: "activa",    vencimiento: "2026-12-31", estado: "activo",  sesiones: 31, score_churn: 5  },
  { id: "006", nombre: "Ana Flores",      email: "ana@email.com",   telefono: "+51 967 890 123", plan: "Silver",       estado_mem: "activa",    vencimiento: "2026-06-20", estado: "activo",  sesiones: 14, score_churn: 29 },
  { id: "007", nombre: "Miguel Huanca",   email: "miguel@email.com",telefono: "+51 989 012 345", plan: "Basic",        estado_mem: "suspendida",vencimiento: "2026-05-10", estado: "suspendido", sesiones: 0, score_churn: 95 },
  { id: "008", nombre: "Patricia Ríos",   email: "paty@email.com",  telefono: "+51 901 234 567", plan: "Gold Premium", estado_mem: "activa",    vencimiento: "2026-07-15", estado: "activo",  sesiones: 19, score_churn: 18 },
]

type FiltroEstado = "todos" | "activa" | "vencida" | "suspendida"

const PLAN_COLOR: Record<string, string> = {
  "Basic":        "#6B7280",
  "Silver":       "#9CA3AF",
  "Gold Premium": "#F59E0B",
  "Enterprise":   "#8B5CF6",
}

export default function MiembrosPage() {
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro]     = useState<FiltroEstado>("todos")
  const [seleccionado, setSeleccionado] = useState<typeof MIEMBROS[0] | null>(null)
  const [modalNuevo, setModalNuevo] = useState(false)

  const filtrados = MIEMBROS.filter((m) => {
    const coincideTexto = busqueda === "" ||
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.email.toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === "todos" || m.estado_mem === filtro
    return coincideTexto && coincideFiltro
  })

  const stats = {
    total:    MIEMBROS.length,
    activos:  MIEMBROS.filter(m => m.estado_mem === "activa").length,
    riesgo:   MIEMBROS.filter(m => m.score_churn >= 60).length,
    vencidos: MIEMBROS.filter(m => m.estado_mem === "vencida").length,
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Miembro</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">Plan</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Membresía</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Vence</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden lg:table-cell">Sesiones</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">Riesgo</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m, i) => (
                <motion.tr
                  key={m.id}
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
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: `${PLAN_COLOR[m.plan] ?? "#6B7280"}20`,
                        color:      PLAN_COLOR[m.plan] ?? "#6B7280",
                      }}
                    >
                      {m.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full capitalize",
                      m.estado_mem === "activa"     ? "bg-[#10B981]/15 text-[#10B981]" :
                      m.estado_mem === "vencida"    ? "bg-[#EF4444]/15 text-[#EF4444]" :
                      m.estado_mem === "suspendida" ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                                                      "bg-white/10 text-neutral-400"
                    )}>
                      {m.estado_mem}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-white text-sm tabular-nums">{m.vencimiento}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <p className="text-white text-sm">{m.sesiones}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/8 rounded-full w-16 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width:      `${m.score_churn}%`,
                            background: m.score_churn >= 70 ? "#EF4444" :
                                        m.score_churn >= 40 ? "#F59E0B" : "#10B981",
                          }}
                        />
                      </div>
                      <span className={cn("text-[10px] font-bold",
                        m.score_churn >= 70 ? "text-[#EF4444]" :
                        m.score_churn >= 40 ? "text-[#F59E0B]" : "text-[#10B981]"
                      )}>
                        {m.score_churn}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSeleccionado(m)}
                        className="text-xs px-2.5 py-1 rounded-lg glass-card text-neutral-300 hover:text-white hover:border-white/20 transition-all"
                      >
                        Ver
                      </button>
                      {m.score_churn >= 60 && (
                        <button className="text-xs px-2.5 py-1 rounded-lg bg-[#EF4444]/15 text-[#EF4444] hover:bg-[#EF4444]/25 transition-all font-semibold">
                          Intervenir
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-4xl mb-3">🔍</p>
              <p>No se encontraron miembros con ese criterio</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Detalle de Miembro */}
      <AnimatePresence>
        {seleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setSeleccionado(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00D084] flex items-center justify-center font-black text-[#070D18]">
                    {seleccionado.nombre[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold">{seleccionado.nombre}</p>
                    <p className="text-neutral-500 text-xs">{seleccionado.email}</p>
                  </div>
                </div>
                <button onClick={() => setSeleccionado(null)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  { label: "Plan",         value: seleccionado.plan },
                  { label: "Estado mem.",  value: seleccionado.estado_mem },
                  { label: "Vencimiento",  value: seleccionado.vencimiento },
                  { label: "Teléfono",     value: seleccionado.telefono },
                  { label: "Sesiones mes", value: seleccionado.sesiones.toString() },
                  { label: "Score churn",  value: `${seleccionado.score_churn}% riesgo` },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-neutral-500">{row.label}</span>
                    <span className="text-white font-medium">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-5">
                <button className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold hover:text-white transition-colors">
                  Editar Perfil
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                  Renovar Membresía
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Nuevo Miembro */}
      <AnimatePresence>
        {modalNuevo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setModalNuevo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Nuevo Miembro</h3>
                <button onClick={() => setModalNuevo(false)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>

              <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setModalNuevo(false) }}>
                {[
                  { label: "Nombre completo", placeholder: "Ej: María González", type: "text" },
                  { label: "Email",            placeholder: "maria@email.com",     type: "email" },
                  { label: "Teléfono",         placeholder: "+51 9XX XXX XXX",     type: "tel" },
                  { label: "DNI / Documento",  placeholder: "12345678",            type: "text" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Plan</label>
                  <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors">
                    <option value="basic" className="bg-[#0D1526]">Basic — S/ 79.90/mes</option>
                    <option value="silver" className="bg-[#0D1526]">Silver — S/ 109.90/mes</option>
                    <option value="gold" className="bg-[#0D1526]">Gold Premium — S/ 149.90/mes</option>
                    <option value="enterprise" className="bg-[#0D1526]">Enterprise — S/ 299.90/mes</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalNuevo(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                    Registrar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
