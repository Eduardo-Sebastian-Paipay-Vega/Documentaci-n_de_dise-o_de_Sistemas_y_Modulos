"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { useAuth } from "@/components/providers/auth-provider"
import { useClasesGerente } from "@/hooks/useClases"
import { crearClase, actualizarEstadoClase, type ClaseDetalle } from "@/lib/services"
import { Loader2 } from "lucide-react"

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
const HORAS = ["06:00", "07:30", "09:00", "10:30", "12:00", "17:00", "18:30", "20:00"]

const NIVEL_COLOR: Record<string, string> = {
  principiante: "#10B981",
  intermedio:   "#F59E0B",
  avanzado:     "#EF4444",
}

const CLASE_COLORS = ["#FF6B35", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6", "#3B82F6", "#EC4899", "#06B6D4"]

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })
}

function claseTieneDia(clase: ClaseDetalle, diaIdx: number): boolean {
  const diasMap: Record<string, number> = { lun: 0, mar: 1, mie: 2, mié: 2, jue: 3, vie: 4, sab: 5, sáb: 5, dom: 6 }
  if (clase.recurrencia === "diaria") return true
  if (clase.recurrencia === "unica") {
    const d = new Date(clase.fecha_hora_inicio).getDay()
    return (d === 0 ? 6 : d - 1) === diaIdx
  }
  if (clase.recurrencia === "semanal" && clase.dias_semana) {
    return clase.dias_semana.toLowerCase().split(",").some((d) => (diasMap[d.trim()] ?? -1) === diaIdx)
  }
  return false
}

function claseTieneHora(clase: ClaseDetalle, hora: string): boolean {
  return fmtHora(clase.fecha_hora_inicio) === hora
}

const colorForClass = (idx: number) => CLASE_COLORS[idx % CLASE_COLORS.length]

type NuevaClaseForm = {
  nombre: string
  descripcion: string
  capacidad_maxima: number
  nivel: "principiante" | "intermedio" | "avanzado"
  fecha_hora_inicio: string
  duracion_minutos: number
  recurrencia: "unica" | "diaria" | "semanal" | "mensual"
  dias_semana: string
}

export default function ClasesPage() {
  const { user } = useAuth()
  const gymId    = user?.id_gimnasio

  const { data: clases, loading, refetch } = useClasesGerente(gymId)

  const [vista, setVista]         = useState<"lista" | "semana">("lista")
  const [modalNueva, setModalNueva] = useState(false)
  const [claseActiva, setClaseActiva] = useState<ClaseDetalle | null>(null)
  const [guardando, setGuardando]   = useState(false)
  const [cancelando, setCancelando] = useState<string | null>(null)

  const [form, setForm] = useState<NuevaClaseForm>({
    nombre:            "",
    descripcion:       "",
    capacidad_maxima:  15,
    nivel:             "intermedio",
    fecha_hora_inicio: new Date().toISOString().slice(0, 16),
    duracion_minutos:  60,
    recurrencia:       "semanal",
    dias_semana:       "lun,mie,vie",
  })

  const activaCount = (clases ?? []).filter(c => c.estado !== "cancelada" && c.estado !== "finalizada").length
  const llenas      = (clases ?? []).filter(c => (c.inscritos ?? 0) >= c.capacidad_maxima).length
  const inscritos   = (clases ?? []).reduce((a, c) => a + (c.inscritos ?? 0), 0)

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (!gymId) return
    setGuardando(true)
    try {
      await crearClase({
        id_gimnasio:       gymId,
        nombre:            form.nombre,
        descripcion:       form.descripcion || undefined,
        capacidad_maxima:  form.capacidad_maxima,
        nivel:             form.nivel,
        fecha_hora_inicio: new Date(form.fecha_hora_inicio).toISOString(),
        duracion_minutos:  form.duracion_minutos,
        recurrencia:       form.recurrencia,
        dias_semana:       form.recurrencia === "semanal" ? form.dias_semana : undefined,
      })
      setModalNueva(false)
      refetch()
    } finally {
      setGuardando(false)
    }
  }

  async function handleCancelar(id: string) {
    setCancelando(id)
    try {
      await actualizarEstadoClase(id, "cancelada")
      setClaseActiva(null)
      refetch()
    } finally {
      setCancelando(null)
    }
  }

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-2xl">Programación de Clases</h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              {loading ? "Cargando..." : `${activaCount} clases activas`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex glass-card rounded-xl overflow-hidden">
              {([{ v: "lista" as const, icon: "☰" }, { v: "semana" as const, icon: "📅" }]).map(({ v, icon }) => (
                <button
                  key={v}
                  onClick={() => setVista(v)}
                  className={cn("px-3 py-2 text-sm transition-all",
                    vista === v ? "bg-[#00D084]/20 text-[#00D084]" : "text-neutral-500 hover:text-neutral-300"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
            <button
              onClick={() => setModalNueva(true)}
              className="bg-[#00D084] text-[#070D18] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#00E891] transition-colors"
            >
              + Nueva Clase
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label: "Clases activas", value: activaCount.toString(), icon: "📅" },
            { label: "Llenas",         value: llenas.toString(),       icon: "🔴" },
            { label: "Inscritos",      value: inscritos.toString(),    icon: "👥" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-white font-black text-xl text-[#00D084]">
                  {loading ? <Loader2 size={16} className="animate-spin text-neutral-500 inline" /> : s.value}
                </p>
                <p className="text-neutral-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Vista Lista */}
      {vista === "lista" && (
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin text-neutral-500" />
            </div>
          ) : (clases ?? []).filter(c => c.estado !== "cancelada").map((c, i) => {
            const pct   = ((c.inscritos ?? 0) / c.capacidad_maxima) * 100
            const llena = (c.inscritos ?? 0) >= c.capacidad_maxima
            const color = colorForClass(i)

            return (
              <motion.div
                key={c.id_clase}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5 hover:border-white/12 transition-all cursor-pointer"
                onClick={() => setClaseActiva(c)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-1 h-14 rounded-full shrink-0" style={{ background: color }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold">{c.nombre}</p>
                      {c.nivel && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: `${NIVEL_COLOR[c.nivel]}20`, color: NIVEL_COLOR[c.nivel] }}
                        >
                          {c.nivel}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-500 text-xs">
                      {c.nombre_entrenador ?? "—"} · {c.nombre_espacio ?? "—"} · {c.duracion_minutos} min
                    </p>
                    <p className="text-neutral-600 text-xs mt-0.5">
                      {c.dias_semana ? c.dias_semana.toUpperCase() : "Una vez"} — {fmtHora(c.fecha_hora_inicio)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-white text-sm font-bold">
                      {c.inscritos ?? 0}/{c.capacidad_maxima}
                    </p>
                    <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(pct, 100)}%`, background: llena ? "#EF4444" : "#00D084" }}
                      />
                    </div>
                    {llena && <p className="text-[#EF4444] text-[10px] font-bold mt-0.5">LLENA</p>}
                  </div>

                  <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setClaseActiva(c)}
                      className="text-xs px-2.5 py-1 glass-card rounded-lg text-neutral-300 hover:text-white transition-all"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleCancelar(c.id_clase)}
                      disabled={cancelando === c.id_clase}
                      className="text-xs px-2.5 py-1 bg-[#EF4444]/15 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/25 transition-all disabled:opacity-50"
                    >
                      {cancelando === c.id_clase ? <Loader2 size={10} className="animate-spin" /> : "Cancelar"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {!loading && (clases ?? []).filter(c => c.estado !== "cancelada").length === 0 && (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-4xl mb-3">📅</p>
              <p>No hay clases programadas</p>
            </div>
          )}
        </div>
      )}

      {/* Vista Semana */}
      {vista === "semana" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-8 border-b border-white/5">
            <div className="p-3" />
            {DIAS.map(d => (
              <div key={d} className="p-3 text-center text-xs font-semibold text-neutral-400 border-l border-white/5">{d}</div>
            ))}
          </div>
          {HORAS.map((hora) => (
            <div key={hora} className="grid grid-cols-8 border-b border-white/4 min-h-[60px]">
              <div className="p-3 text-xs text-neutral-600 border-r border-white/5">{hora}</div>
              {DIAS.map((_, diaIdx) => {
                const clase = (clases ?? []).find(c =>
                  c.estado !== "cancelada" && claseTieneHora(c, hora) && claseTieneDia(c, diaIdx)
                )
                const idx = clase ? (clases ?? []).indexOf(clase) : 0
                const color = clase ? colorForClass(idx) : "#00D084"
                return (
                  <div key={diaIdx} className="border-l border-white/4 p-1 relative">
                    {clase && (
                      <div
                        className="rounded-lg p-1.5 text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: `${color}25`, color, borderLeft: `2px solid ${color}` }}
                        onClick={() => setClaseActiva(clase)}
                      >
                        <p className="leading-tight truncate">{clase.nombre}</p>
                        <p className="text-[9px] opacity-70">{clase.inscritos ?? 0}/{clase.capacidad_maxima}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
      )}

      {/* Modal Detalle */}
      <AnimatePresence>
        {claseActiva && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setClaseActiva(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{claseActiva.nombre}</h3>
                  <p className="text-neutral-500 text-sm">{claseActiva.nombre_entrenador ?? "—"}</p>
                </div>
                <button onClick={() => setClaseActiva(null)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  ["Espacio",    claseActiva.nombre_espacio ?? "—"],
                  ["Horario",    `${claseActiva.dias_semana?.toUpperCase() ?? "Una vez"} · ${fmtHora(claseActiva.fecha_hora_inicio)}`],
                  ["Duración",   `${claseActiva.duracion_minutos} min`],
                  ["Nivel",      claseActiva.nivel ?? "—"],
                  ["Inscritos",  `${claseActiva.inscritos ?? 0} / ${claseActiva.capacidad_maxima}`],
                  ["Estado",     claseActiva.estado],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-neutral-500">{k}</span>
                    <span className="text-white font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCancelar(claseActiva.id_clase)}
                  disabled={cancelando === claseActiva.id_clase}
                  className="py-2.5 rounded-xl bg-[#EF4444]/15 text-[#EF4444] text-sm font-semibold disabled:opacity-50"
                >
                  {cancelando === claseActiva.id_clase ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Cancelar clase"}
                </button>
                <button onClick={() => setClaseActiva(null)} className="py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">Cerrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nueva Clase */}
      <AnimatePresence>
        {modalNueva && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setModalNueva(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Nueva Clase</h3>
                <button onClick={() => setModalNueva(false)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>
              <form onSubmit={handleCrear} className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Nombre</label>
                  <input
                    required value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: CrossFit Advanced"
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Capacidad</label>
                    <input
                      type="number" min={1} max={200} required value={form.capacidad_maxima}
                      onChange={e => setForm(f => ({ ...f, capacidad_maxima: Number(e.target.value) }))}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Duración (min)</label>
                    <input
                      type="number" min={15} max={240} required value={form.duracion_minutos}
                      onChange={e => setForm(f => ({ ...f, duracion_minutos: Number(e.target.value) }))}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Fecha y hora inicio</label>
                  <input
                    type="datetime-local" required value={form.fecha_hora_inicio}
                    onChange={e => setForm(f => ({ ...f, fecha_hora_inicio: e.target.value }))}
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors"
                  />
                </div>
                {[
                  { label: "Nivel",      key: "nivel",      opts: ["principiante", "intermedio", "avanzado"] },
                  { label: "Recurrencia",key: "recurrencia",opts: ["unica", "diaria", "semanal", "mensual"] },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <select
                      value={form[f.key as keyof NuevaClaseForm] as string}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    >
                      {f.opts.map(o => <option key={o} value={o} className="bg-[#0D1526] capitalize">{o}</option>)}
                    </select>
                  </div>
                ))}
                {form.recurrencia === "semanal" && (
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Días (separados por coma: lun,mie,vie)</label>
                    <input
                      value={form.dias_semana}
                      onChange={e => setForm(f => ({ ...f, dias_semana: e.target.value }))}
                      placeholder="lun,mie,vie"
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    />
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalNueva(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cancelar</button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {guardando ? <Loader2 size={14} className="animate-spin" /> : null}
                    Crear Clase
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
