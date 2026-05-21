"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// CU-005: Inscribirse en Clase — RF-005
// SELECT c.*, e.nombre as entrenador, es.nombre as espacio,
//   (SELECT COUNT(*) FROM inscripciones i WHERE i.id_clase = c.id_clase AND i.estado = 'inscrito') as inscritos,
//   EXISTS (SELECT 1 FROM inscripciones i WHERE i.id_clase = c.id_clase AND i.id_usuario = auth.uid()) as ya_inscrito
// FROM clases c JOIN ... WHERE c.id_gimnasio = get_user_gym()

const CLASES = [
  { id:"c001", nombre:"CrossFit Extremo", hora:"06:00", duracion:60, entrenador:"Carlos V.", sala:"Sala A", capacidad:15, inscritos:12, nivel:"avanzado",    confirmada:false, dia:"Hoy",   color:"#FF6B35", descripcion:"Alta intensidad, fuerza funcional y resistencia cardiovascular." },
  { id:"c002", nombre:"Yoga Flow",        hora:"07:30", duracion:60, entrenador:"Ana Torres",sala:"Sala B", capacidad:20, inscritos:8,  nivel:"principiante",  confirmada:true,  dia:"Hoy",   color:"#10B981", descripcion:"Yoga dinámico para cuerpo y mente. Todos los niveles bienvenidos." },
  { id:"c003", nombre:"HIIT Total",       hora:"18:30", duracion:45, entrenador:"Coach J.", sala:"Sala C", capacidad:12, inscritos:11, nivel:"intermedio",    confirmada:false, dia:"Hoy",   color:"#EF4444", descripcion:"Entrenamiento de alta intensidad para quemar calorías en tiempo récord." },
  { id:"c004", nombre:"Zumba Power",      hora:"17:00", duracion:60, entrenador:"María R.", sala:"Sala D", capacidad:25, inscritos:25, nivel:"principiante",  confirmada:false, dia:"Mañana",color:"#F59E0B", descripcion:"Baile fitness para tonocar y divertirte al mismo tiempo." },
  { id:"c005", nombre:"Pilates Core",     hora:"09:00", duracion:50, entrenador:"Ana Torres",sala:"Sala B", capacidad:15, inscritos:6,  nivel:"intermedio",    confirmada:false, dia:"Mañana",color:"#8B5CF6", descripcion:"Fortalecimiento del core y mejora de la postura con técnica Pilates." },
  { id:"c006", nombre:"Spinning",         hora:"08:00", duracion:45, entrenador:"Jorge P.", sala:"Sala D", capacidad:20, inscritos:20, nivel:"intermedio",    confirmada:false, dia:"Sáb",   color:"#3B82F6", descripcion:"Ciclismo indoor para resistencia cardiovascular y piernas." },
]

const NIVEL_COLOR: Record<string, string> = {
  principiante: "#10B981",
  intermedio:   "#F59E0B",
  avanzado:     "#EF4444",
}

export default function ClasesMiembroPage() {
  const [filtro, setFiltro] = useState<"todas"|"Hoy"|"Mañana"|"Sáb">("todas")
  const [detalle, setDetalle] = useState<typeof CLASES[0] | null>(null)
  const [inscripciones, setInscripciones] = useState<string[]>(["c002"]) // c002 ya confirmada

  const filtradas = filtro === "todas" ? CLASES : CLASES.filter(c => c.dia === filtro)

  function inscribirse(id: string) {
    setInscripciones(prev => [...prev, id])
    setDetalle(null)
  }

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Clases Disponibles</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Explora, inscríbete y asiste</p>
        </motion.div>

        {/* Filtros por día */}
        <motion.div variants={fadeUp} className="flex gap-2 mt-4">
          {(["todas","Hoy","Mañana","Sáb"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                filtro === f ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
              )}>
              {f === "todas" ? "Todas" : f}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {/* Grid de clases */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtradas.map((c, i) => {
          const yaInscrito = inscripciones.includes(c.id)
          const llena      = c.inscritos >= c.capacidad && !yaInscrito

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={cn(
                "glass-card rounded-2xl p-5 cursor-pointer transition-all hover:border-white/15",
                yaInscrito && "border-[#00D084]/25 bg-[#00D084]/5"
              )}
              onClick={() => setDetalle(c)}
            >
              {/* Color bar + nivel */}
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-1 rounded-full" style={{ background: c.color }} />
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: `${NIVEL_COLOR[c.nivel]}20`, color: NIVEL_COLOR[c.nivel] }}>
                  {c.nivel}
                </span>
              </div>

              <p className="text-white font-bold text-base mb-1">{c.nombre}</p>
              <p className="text-neutral-500 text-xs mb-3">
                {c.entrenador} · {c.sala} · {c.duracion} min
              </p>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-neutral-400 text-xs">Horario</p>
                  <p className="text-white font-bold">{c.hora}</p>
                  <p className="text-neutral-600 text-[10px]">{c.dia}</p>
                </div>
                <div className="text-right">
                  <p className="text-neutral-400 text-xs">Cupos</p>
                  <p className={cn("font-bold", llena ? "text-[#EF4444]" : c.inscritos >= c.capacidad * 0.8 ? "text-[#F59E0B]" : "text-[#00D084]")}>
                    {c.capacidad - c.inscritos} libre{c.capacidad - c.inscritos !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Barra ocupación */}
              <div className="h-1 bg-white/8 rounded-full overflow-hidden mb-3">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${(c.inscritos/c.capacidad)*100}%`, background: llena ? "#EF4444" : c.color }} />
              </div>

              {yaInscrito ? (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#00D084]/15 text-[#00D084] text-sm font-bold">
                  ✓ Inscrito
                </div>
              ) : llena ? (
                <div className="flex items-center justify-center gap-2 py-2 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-sm font-semibold">
                  Lista de espera
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); inscribirse(c.id) }}
                  className="w-full py-2 rounded-xl bg-white text-[#070D18] text-sm font-bold hover:bg-neutral-100 transition-colors"
                >
                  Inscribirse →
                </button>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Modal detalle clase */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setDetalle(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <div style={{ borderLeft: `3px solid ${detalle.color}` }} className="pl-3 mb-4">
                <h3 className="text-white font-bold text-xl">{detalle.nombre}</h3>
                <p className="text-neutral-500 text-sm">{detalle.entrenador}</p>
              </div>

              <p className="text-neutral-400 text-sm mb-4">{detalle.descripcion}</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label:"Horario",  value:`${detalle.dia} · ${detalle.hora}` },
                  { label:"Duración", value:`${detalle.duracion} min` },
                  { label:"Espacio",  value:detalle.sala },
                  { label:"Cupos",    value:`${detalle.capacidad - detalle.inscritos} disponibles` },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-card rounded-xl p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider">{label}</p>
                    <p className="text-white text-sm font-semibold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setDetalle(null)}
                  className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cerrar</button>
                {!inscripciones.includes(detalle.id) && detalle.inscritos < detalle.capacidad && (
                  <button onClick={() => inscribirse(detalle.id)}
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                    Inscribirme ✓
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
