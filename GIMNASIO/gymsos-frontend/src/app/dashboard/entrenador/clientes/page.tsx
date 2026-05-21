"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-007: Ver Perfil del Alumno — SELECT u.*, m.estado, e.*, ea.peso, ea.altura
// JOIN evaluaciones_atleticas ea ON ea.id_usuario = u.id_usuario
// WHERE ea.id_entrenador = auth.uid()
// RF-023: Predicción de Abandono — SELECT cp.* FROM churn_predictions WHERE id_usuario = ?

type Cliente = {
  id: string
  nombre: string
  plan: string
  clases: string[]
  asistencia: number
  ultimaVisita: string
  nivel: "principiante" | "intermedio" | "avanzado"
  churnRisk: number
  peso: number
  altura: number
  objetivo: string
  telefono: string
}

const MIS_CLIENTES: Cliente[] = [
  { id:"u001", nombre:"Juan Quispe",    plan:"Gold Premium", clases:["CrossFit Extremo","HIIT Total"], asistencia:85, ultimaVisita:"Hoy 09:15",  nivel:"avanzado",     churnRisk:12, peso:78, altura:175, objetivo:"Masa muscular",    telefono:"+51 987 111 222" },
  { id:"u002", nombre:"Ana Flores",     plan:"Silver",       clases:["CrossFit Extremo"],               asistencia:72, ultimaVisita:"Ayer",        nivel:"intermedio",   churnRisk:28, peso:62, altura:162, objetivo:"Perder peso",       telefono:"+51 987 333 444" },
  { id:"u003", nombre:"Luis Mamani",    plan:"Gold Premium", clases:["HIIT Total","Fuerza Funcional"],  asistencia:91, ultimaVisita:"Hoy 08:30",  nivel:"avanzado",     churnRisk:5,  peso:85, altura:180, objetivo:"Rendimiento",       telefono:"+51 987 555 666" },
  { id:"u004", nombre:"Rosa Chávez",    plan:"Basic",        clases:["CrossFit Extremo"],               asistencia:45, ultimaVisita:"Hace 5 días", nivel:"principiante", churnRisk:67, peso:58, altura:158, objetivo:"Tonificar",         telefono:"+51 987 777 888" },
  { id:"u005", nombre:"Pablo Fuentes",  plan:"Silver",       clases:["HIIT Total"],                     asistencia:60, ultimaVisita:"Hace 2 días", nivel:"intermedio",   churnRisk:35, peso:72, altura:170, objetivo:"Resistencia",       telefono:"+51 987 999 000" },
  { id:"u006", nombre:"Carmen Torres",  plan:"Gold Premium", clases:["CrossFit Extremo","Boot Camp"],   asistencia:78, ultimaVisita:"Ayer",        nivel:"avanzado",     churnRisk:18, peso:65, altura:165, objetivo:"Masa muscular",    telefono:"+51 987 111 333" },
  { id:"u007", nombre:"Andrés Rojas",   plan:"Silver",       clases:["Fuerza Funcional"],               asistencia:30, ultimaVisita:"Hace 9 días", nivel:"principiante", churnRisk:82, peso:90, altura:178, objetivo:"Perder peso",       telefono:"+51 987 444 555" },
]

export default function EntrenadorClientesPage() {
  const [busqueda, setBusqueda] = useState("")
  const [ordenar, setOrdenar] = useState<"nombre"|"asistencia"|"churn">("churn")
  const [detalle, setDetalle] = useState<Cliente | null>(null)

  const imc = detalle ? (detalle.peso / ((detalle.altura / 100) ** 2)).toFixed(1) : null

  const filtrados = MIS_CLIENTES
    .filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.plan.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) =>
      ordenar === "nombre"     ? a.nombre.localeCompare(b.nombre) :
      ordenar === "asistencia" ? b.asistencia - a.asistencia :
      b.churnRisk - a.churnRisk
    )

  const enRiesgo = MIS_CLIENTES.filter(c => c.churnRisk >= 60).length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Mis Clientes</h1>
          <p className="text-neutral-500 text-sm mt-0.5">RF-007 · RF-023 · {MIS_CLIENTES.length} alumnos asignados</p>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label:"Total alumnos",    valor:MIS_CLIENTES.length, color:"#00D084" },
            { label:"En riesgo abandono",valor:enRiesgo,           color:"#EF4444" },
            { label:"Asistencia prom",  valor:`${Math.round(MIS_CLIENTES.reduce((s,c)=>s+c.asistencia,0)/MIS_CLIENTES.length)}%`, color:"#3B82F6" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3">
              <p className="font-black text-xl" style={{ color:s.color }}>{s.valor}</p>
              <p className="text-neutral-500 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-3 mt-4">
          <input
            type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cliente..."
            className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
          />
          <select value={ordenar} onChange={e => setOrdenar(e.target.value as typeof ordenar)}
            className="h-10 bg-[#0D1526] border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none">
            <option value="churn">Por riesgo</option>
            <option value="asistencia">Por asistencia</option>
            <option value="nombre">Por nombre</option>
          </select>
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        {filtrados.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.05 }}
            className="glass-card rounded-2xl p-4 cursor-pointer hover:border-white/15 transition-all"
            onClick={() => setDetalle(c)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D084]/30 to-[#00D084]/10 flex items-center justify-center font-black text-[#00D084] shrink-0">
                {c.nombre[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{c.nombre}</p>
                <p className="text-neutral-500 text-xs truncate">{c.plan} · {c.clases.join(" · ")}</p>
                <p className="text-neutral-700 text-[10px]">Última visita: {c.ultimaVisita}</p>
              </div>

              <div className="text-right shrink-0 space-y-1">
                <div>
                  <span className="text-xs text-neutral-500">Asistencia </span>
                  <span className={cn("text-xs font-bold",
                    c.asistencia >= 70 ? "text-[#00D084]" : c.asistencia >= 50 ? "text-[#F59E0B]" : "text-[#EF4444]"
                  )}>
                    {c.asistencia}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-neutral-500">Riesgo </span>
                  <span className={cn("text-xs font-bold",
                    c.churnRisk < 30 ? "text-[#00D084]" : c.churnRisk < 60 ? "text-[#F59E0B]" : "text-[#EF4444]"
                  )}>
                    {c.churnRisk}%
                  </span>
                </div>
              </div>

              <div className="w-1.5 h-12 rounded-full bg-white/8 overflow-hidden shrink-0">
                <div className="w-full rounded-full transition-all"
                  style={{
                    height:`${c.churnRisk}%`,
                    background: c.churnRisk < 30 ? "#00D084" : c.churnRisk < 60 ? "#F59E0B" : "#EF4444",
                    marginTop: `${100-c.churnRisk}%`
                  }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal detalle cliente */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setDetalle(null)}
          >
            <motion.div
              initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#00D084]/30 to-[#00D084]/10 flex items-center justify-center font-black text-[#00D084] text-xl">
                  {detalle.nombre[0]}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{detalle.nombre}</h3>
                  <p className="text-neutral-500 text-sm">{detalle.plan} · {detalle.telefono}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  { label:"Nivel",       value:detalle.nivel },
                  { label:"Objetivo",    value:detalle.objetivo },
                  { label:"Peso",        value:`${detalle.peso} kg` },
                  { label:"Altura",      value:`${detalle.altura} cm` },
                  { label:"IMC",         value:imc ?? "—" },
                  { label:"Asistencia",  value:`${detalle.asistencia}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-card rounded-xl p-3">
                    <p className="text-neutral-600 text-[10px] uppercase tracking-wider">{label}</p>
                    <p className="text-white text-sm font-semibold mt-0.5 capitalize">{value}</p>
                  </div>
                ))}
              </div>

              {/* Riesgo churn */}
              <div className="glass-card rounded-xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <p className="text-white text-sm font-semibold">Riesgo de abandono</p>
                  <span className={cn("font-black text-sm",
                    detalle.churnRisk < 30 ? "text-[#00D084]" : detalle.churnRisk < 60 ? "text-[#F59E0B]" : "text-[#EF4444]"
                  )}>
                    {detalle.churnRisk}%
                  </span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width:`${detalle.churnRisk}%`,
                      background: detalle.churnRisk < 30 ? "#00D084" : detalle.churnRisk < 60 ? "#F59E0B" : "#EF4444"
                    }}
                  />
                </div>
                {detalle.churnRisk >= 60 && (
                  <p className="text-[#EF4444] text-xs mt-2">⚠️ Alto riesgo — se recomienda intervención personal</p>
                )}
              </div>

              <div className="mb-4">
                <p className="text-neutral-500 text-xs mb-2">Clases inscritas</p>
                {detalle.clases.map(cl => (
                  <span key={cl} className="inline-block mr-2 mb-1 text-xs px-2 py-0.5 rounded-full bg-[#00D084]/15 text-[#00D084] font-semibold">
                    {cl}
                  </span>
                ))}
              </div>

              <button onClick={() => setDetalle(null)}
                className="w-full py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
