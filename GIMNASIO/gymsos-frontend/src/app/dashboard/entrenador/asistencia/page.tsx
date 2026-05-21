"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-009: Registrar Asistencia a Clase — INSERT INTO asistencias
// SELECT u.nombre, i.estado FROM inscripciones i
// JOIN usuarios u ON u.id_usuario = i.id_usuario
// WHERE i.id_clase = :id_clase AND i.estado = 'inscrito'

const CLASES_HOY = [
  { id:"c001", nombre:"CrossFit Extremo", hora:"06:00", sala:"Sala A", inscritos:12 },
  { id:"c003", nombre:"HIIT Total",       hora:"18:30", sala:"Sala C", inscritos:10 },
]

type EstadoA = "presente" | "ausente" | "tardanza" | null

type Alumno = { id:string; nombre:string; plan:string }

const ALUMNOS_CROSSFIT: Alumno[] = [
  { id:"u001", nombre:"Juan Quispe",   plan:"Gold Premium" },
  { id:"u002", nombre:"Ana Flores",    plan:"Silver" },
  { id:"u003", nombre:"Luis Mamani",   plan:"Gold Premium" },
  { id:"u006", nombre:"Carmen Torres", plan:"Gold Premium" },
  { id:"u008", nombre:"Mario Salinas", plan:"Silver" },
  { id:"u009", nombre:"Lucia Puma",    plan:"Gold Premium" },
  { id:"u010", nombre:"Diego Castro",  plan:"Basic" },
  { id:"u011", nombre:"Sandra Lima",   plan:"Silver" },
  { id:"u012", nombre:"Roberto Vera",  plan:"Gold Premium" },
  { id:"u013", nombre:"Gloria Huanca", plan:"Silver" },
  { id:"u014", nombre:"Félix Quispe",  plan:"Gold Premium" },
  { id:"u015", nombre:"Natalia Cruz",  plan:"Silver" },
]

const ALUMNOS_HIIT: Alumno[] = [
  { id:"u002", nombre:"Ana Flores",    plan:"Silver" },
  { id:"u005", nombre:"Pablo Fuentes", plan:"Silver" },
  { id:"u007", nombre:"Andrés Rojas",  plan:"Silver" },
  { id:"u016", nombre:"Carla Mendez",  plan:"Gold Premium" },
  { id:"u017", nombre:"Hugo Torres",   plan:"Basic" },
  { id:"u018", nombre:"Valeria Salas", plan:"Silver" },
  { id:"u019", nombre:"Omar Chávez",   plan:"Gold Premium" },
  { id:"u020", nombre:"Iris Neyra",    plan:"Silver" },
  { id:"u021", nombre:"Frank Reyes",   plan:"Gold Premium" },
  { id:"u022", nombre:"Tania Puente",  plan:"Silver" },
]

export default function AsistenciaPage() {
  const [claseActiva, setClaseActiva] = useState(CLASES_HOY[0].id)
  const [asistencias, setAsistencias] = useState<Record<string, EstadoA>>({})
  const [guardado, setGuardado] = useState(false)

  const clase = CLASES_HOY.find(c => c.id === claseActiva)!
  const alumnos = claseActiva === "c001" ? ALUMNOS_CROSSFIT : ALUMNOS_HIIT

  function setEstado(idUsuario: string, estado: EstadoA) {
    setAsistencias(prev => ({ ...prev, [idUsuario]: estado }))
  }

  function marcarTodos(estado: EstadoA) {
    const nuevo: Record<string, EstadoA> = {}
    alumnos.forEach(a => { nuevo[a.id] = estado })
    setAsistencias(prev => ({ ...prev, ...nuevo }))
  }

  function guardar() {
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const presentes  = alumnos.filter(a => asistencias[a.id] === "presente").length
  const ausentes   = alumnos.filter(a => asistencias[a.id] === "ausente").length
  const tardanzas  = alumnos.filter(a => asistencias[a.id] === "tardanza").length
  const sinMarcar  = alumnos.filter(a => !asistencias[a.id]).length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Registro de Asistencia</h1>
          <p className="text-neutral-500 text-sm mt-0.5">RF-009 · Hoy · {new Date().toLocaleDateString("es-PE")}</p>
        </motion.div>

        {/* Selector de clase */}
        <motion.div variants={fadeUp} className="flex gap-3 mt-4">
          {CLASES_HOY.map(c => (
            <button key={c.id} onClick={() => { setClaseActiva(c.id); setAsistencias({}) }}
              className={cn("flex-1 rounded-2xl p-4 text-left border-2 transition-all",
                claseActiva === c.id ? "border-[#00D084] bg-[#00D084]/8" : "border-white/8 glass-card hover:border-white/20"
              )}>
              <p className="text-white font-bold text-sm">{c.nombre}</p>
              <p className="text-neutral-500 text-xs">{c.hora} · {c.sala} · {c.inscritos} alumnos</p>
            </button>
          ))}
        </motion.div>

        {/* Stats en tiempo real */}
        <motion.div variants={fadeUp} className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label:"Presentes",  valor:presentes, color:"#00D084" },
            { label:"Tardanzas",  valor:tardanzas, color:"#F59E0B" },
            { label:"Ausentes",   valor:ausentes,  color:"#EF4444" },
            { label:"Sin marcar", valor:sinMarcar, color:"#6B7280" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3 text-center">
              <p className="font-black text-lg" style={{ color:s.color }}>{s.valor}</p>
              <p className="text-neutral-600 text-[10px]">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Acciones rápidas */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => marcarTodos("presente")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#00D084]/15 text-[#00D084] hover:bg-[#00D084]/25 transition-colors">
          ✓ Todos presentes
        </button>
        <button onClick={() => marcarTodos("ausente")}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 transition-colors">
          ✗ Todos ausentes
        </button>
        <button onClick={() => marcarTodos(null)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold glass-card text-neutral-400 hover:text-white transition-colors">
          Limpiar
        </button>
      </div>

      {/* Lista de alumnos */}
      <div className="glass-card rounded-2xl overflow-hidden mb-4">
        <div className="p-4 border-b border-white/5">
          <p className="text-white font-semibold text-sm">{clase.nombre} · {clase.hora}</p>
        </div>
        <div className="divide-y divide-white/4">
          {alumnos.map((a, i) => {
            const estado = asistencias[a.id] ?? null
            return (
              <motion.div
                key={a.id}
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay: i * 0.03 }}
                className="px-4 py-3 flex items-center gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-white text-xs shrink-0">
                  {a.nombre[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{a.nombre}</p>
                  <p className="text-neutral-600 text-xs">{a.plan}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {([
                    { e:"presente" as const, label:"P", color:"#00D084", bg:"rgba(0,208,132,0.15)" },
                    { e:"tardanza" as const, label:"T", color:"#F59E0B", bg:"rgba(245,158,11,0.15)" },
                    { e:"ausente"  as const, label:"A", color:"#EF4444", bg:"rgba(239,68,68,0.15)" },
                  ] as const).map(({ e, label, color, bg }) => (
                    <button
                      key={e}
                      onClick={() => setEstado(a.id, estado === e ? null : e)}
                      className="w-8 h-8 rounded-lg text-xs font-black transition-all"
                      style={{
                        background: estado === e ? bg : "rgba(255,255,255,0.05)",
                        color: estado === e ? color : "#6B7280",
                        border: estado === e ? `1.5px solid ${color}40` : "1.5px solid transparent",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <button
        onClick={guardar}
        disabled={sinMarcar > 0}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-sm transition-all",
          sinMarcar === 0
            ? "bg-[#00D084] text-[#070D18] hover:bg-[#00E891]"
            : "bg-white/5 text-neutral-600 cursor-not-allowed"
        )}
      >
        {sinMarcar > 0 ? `Faltan ${sinMarcar} por marcar` : guardado ? "✓ Asistencia guardada" : "Guardar Asistencia"}
      </button>
    </div>
  )
}
