"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// Datos: SELECT c.*, e.nombre as entrenador, es.nombre as espacio,
//        (SELECT COUNT(*) FROM inscripciones i WHERE i.id_clase = c.id_clase) as inscritos
// FROM clases c JOIN entrenadores en ON c.id_entrenador = en.id_entrenador
// JOIN usuarios e ON en.id_usuario = e.id_usuario JOIN espacios es ON c.id_espacio = es.id_espacio
// WHERE c.id_gimnasio = get_user_gym() ORDER BY c.fecha_hora_inicio

const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"]
const HORAS = ["06:00","07:30","09:00","10:30","12:00","17:00","18:30","20:00"]

const CLASES = [
  { id:"c001", nombre:"CrossFit Extremo",  entrenador:"Carlos V.", espacio:"Sala A", capacidad:15, inscritos:12, nivel:"avanzado",    dias:["Lun","Mié","Vie"], hora:"06:00", duracion:60,  estado:"programada", color:"#FF6B35" },
  { id:"c002", nombre:"Yoga Matutino",     entrenador:"Ana Torres",espacio:"Sala B", capacidad:20, inscritos:8,  nivel:"principiante",dias:["Mar","Jue","Sáb"], hora:"07:30", duracion:60,  estado:"programada", color:"#10B981" },
  { id:"c003", nombre:"HIIT Explosivo",    entrenador:"Luis M.",   espacio:"Sala A", capacidad:12, inscritos:12, nivel:"intermedio",  dias:["Lun","Mié","Vie"], hora:"18:30", duracion:45,  estado:"programada", color:"#EF4444" },
  { id:"c004", nombre:"Zumba Power",       entrenador:"María R.",  espacio:"Sala C", capacidad:25, inscritos:19, nivel:"principiante",dias:["Mar","Jue"],       hora:"17:00", duracion:60,  estado:"programada", color:"#F59E0B" },
  { id:"c005", nombre:"Pilates Core",      entrenador:"Ana Torres",espacio:"Sala B", capacidad:15, inscritos:6,  nivel:"intermedio",  dias:["Lun","Vie"],       hora:"09:00", duracion:50,  estado:"programada", color:"#8B5CF6" },
  { id:"c006", nombre:"Spinning",          entrenador:"Jorge P.",  espacio:"Sala D", capacidad:20, inscritos:20, nivel:"intermedio",  dias:["Sáb"],             hora:"08:00", duracion:45,  estado:"programada", color:"#3B82F6" },
]

const NIVEL_COLOR: Record<string, string> = {
  principiante: "#10B981",
  intermedio:   "#F59E0B",
  avanzado:     "#EF4444",
}

export default function ClasesPage() {
  const [vista, setVista]         = useState<"lista"|"semana">("lista")
  const [modalNueva, setModalNueva] = useState(false)
  const [claseActiva, setClaseActiva] = useState<typeof CLASES[0] | null>(null)

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-black text-2xl">Programación de Clases</h1>
            <p className="text-neutral-500 text-sm mt-0.5">{CLASES.length} clases activas esta semana</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Vista toggle */}
            <div className="flex glass-card rounded-xl overflow-hidden">
              {[{ v:"lista" as const, icon:"☰" }, { v:"semana" as const, icon:"📅" }].map(({ v, icon }) => (
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

        {/* Stats */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {[
            { label:"Clases Hoy", value:"8",  icon:"📅" },
            { label:"Llenas",     value: CLASES.filter(c => c.inscritos >= c.capacidad).length.toString(), icon:"🔴" },
            { label:"Inscritos",  value: CLASES.reduce((a,c) => a + c.inscritos, 0).toString(), icon:"👥" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-white font-black text-xl text-[#00D084]">{s.value}</p>
                <p className="text-neutral-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Vista Lista */}
      {vista === "lista" && (
        <div className="space-y-3">
          {CLASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card rounded-2xl p-5 hover:border-white/12 transition-all cursor-pointer"
              onClick={() => setClaseActiva(c)}
            >
              <div className="flex items-center gap-4">
                {/* Color indicator */}
                <div className="w-1 h-14 rounded-full shrink-0" style={{ background: c.color }} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-bold">{c.nombre}</p>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                      style={{ background: `${NIVEL_COLOR[c.nivel]}20`, color: NIVEL_COLOR[c.nivel] }}
                    >
                      {c.nivel}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs">
                    {c.entrenador} · {c.espacio} · {c.duracion} min
                  </p>
                  <p className="text-neutral-600 text-xs mt-0.5">
                    {c.dias.join(", ")} — {c.hora}
                  </p>
                </div>

                {/* Ocupación */}
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-bold">
                    {c.inscritos}/{c.capacidad}
                  </p>
                  <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width:      `${(c.inscritos/c.capacidad)*100}%`,
                        background: c.inscritos >= c.capacidad ? "#EF4444" : "#00D084",
                      }}
                    />
                  </div>
                  {c.inscritos >= c.capacidad && (
                    <p className="text-[#EF4444] text-[10px] font-bold mt-0.5">LLENA</p>
                  )}
                </div>

                <div className="flex gap-1.5 shrink-0">
                  <button className="text-xs px-2.5 py-1 glass-card rounded-lg text-neutral-300 hover:text-white transition-all">
                    Editar
                  </button>
                  <button className="text-xs px-2.5 py-1 bg-[#EF4444]/15 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/25 transition-all">
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Vista Semana (Calendario) */}
      {vista === "semana" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-8 border-b border-white/5">
            <div className="p-3" />
            {DIAS.map(d => (
              <div key={d} className="p-3 text-center text-xs font-semibold text-neutral-400 border-l border-white/5">
                {d}
              </div>
            ))}
          </div>
          {HORAS.map((hora) => (
            <div key={hora} className="grid grid-cols-8 border-b border-white/4 min-h-[60px]">
              <div className="p-3 text-xs text-neutral-600 border-r border-white/5">{hora}</div>
              {DIAS.map((dia) => {
                const clase = CLASES.find(c => c.hora === hora && c.dias.includes(dia))
                return (
                  <div key={dia} className="border-l border-white/4 p-1 relative">
                    {clase && (
                      <div
                        className="rounded-lg p-1.5 text-[10px] font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ background: `${clase.color}25`, color: clase.color, borderLeft: `2px solid ${clase.color}` }}
                        onClick={() => setClaseActiva(clase)}
                      >
                        <p className="leading-tight truncate">{clase.nombre}</p>
                        <p className="text-[9px] opacity-70">{clase.inscritos}/{clase.capacidad}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </motion.div>
      )}

      {/* Modal Detalle de Clase */}
      <AnimatePresence>
        {claseActiva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setClaseActiva(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{claseActiva.nombre}</h3>
                  <p className="text-neutral-500 text-sm">{claseActiva.entrenador}</p>
                </div>
                <button onClick={() => setClaseActiva(null)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>
              <div className="space-y-2.5 text-sm">
                {[
                  ["Espacio",    claseActiva.espacio],
                  ["Horario",    `${claseActiva.dias.join(", ")} · ${claseActiva.hora}`],
                  ["Duración",   `${claseActiva.duracion} min`],
                  ["Nivel",      claseActiva.nivel],
                  ["Inscritos",  `${claseActiva.inscritos} / ${claseActiva.capacidad}`],
                  ["Estado",     claseActiva.estado],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-neutral-500">{k}</span>
                    <span className="text-white font-medium capitalize">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Ver Inscritos</button>
                <button className="py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">Editar Clase</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Nueva Clase */}
      <AnimatePresence>
        {modalNueva && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setModalNueva(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Nueva Clase</h3>
                <button onClick={() => setModalNueva(false)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>
              <form className="space-y-3" onSubmit={e => { e.preventDefault(); setModalNueva(false) }}>
                {[
                  { label:"Nombre de la clase",  type:"text",  placeholder:"Ej: CrossFit Advanced" },
                  { label:"Descripción",          type:"text",  placeholder:"Descripción breve" },
                  { label:"Capacidad máxima",     type:"number",placeholder:"15" },
                  { label:"Duración (minutos)",   type:"number",placeholder:"60" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors" />
                  </div>
                ))}
                {[
                  { label:"Entrenador", options:["Carlos V.", "Ana Torres", "Luis M.", "María R."] },
                  { label:"Espacio",    options:["Sala A", "Sala B", "Sala C", "Sala D"] },
                  { label:"Nivel",      options:["principiante", "intermedio", "avanzado"] },
                  { label:"Recurrencia",options:["unica", "diaria", "semanal", "mensual"] },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors">
                      {f.options.map(o => <option key={o} value={o} className="bg-[#0D1526] capitalize">{o}</option>)}
                    </select>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalNueva(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">Crear Clase</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
