"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { useAuth } from "@/components/providers/auth-provider"

// CU-007: Gestionar Clases — RF-004, RF-008
// SELECT c.*, COUNT(i.id_inscripcion) as inscritos FROM clases c
// LEFT JOIN inscripciones i ON i.id_clase = c.id_clase AND i.estado = 'inscrito'
// WHERE c.id_entrenador = auth.uid()
// GROUP BY c.id_clase ORDER BY c.hora_inicio ASC

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

type Clase = {
  id: string
  nombre: string
  dia: string
  hora: string
  duracion: number
  sala: string
  capacidad: number
  inscritos: number
  nivel: "principiante" | "intermedio" | "avanzado"
  color: string
  descripcion: string
}

const MIS_CLASES: Clase[] = [
  { id:"c001", nombre:"CrossFit Extremo", dia:"Lun", hora:"06:00", duracion:60,  sala:"Sala A", capacidad:15, inscritos:12, nivel:"avanzado",     color:"#FF6B35", descripcion:"Alta intensidad con movimientos funcionales y cardio explosivo." },
  { id:"c002", nombre:"CrossFit Extremo", dia:"Mié", hora:"06:00", duracion:60,  sala:"Sala A", capacidad:15, inscritos:14, nivel:"avanzado",     color:"#FF6B35", descripcion:"Alta intensidad con movimientos funcionales y cardio explosivo." },
  { id:"c003", nombre:"HIIT Total",       dia:"Mar", hora:"18:30", duracion:45,  sala:"Sala C", capacidad:12, inscritos:10, nivel:"intermedio",   color:"#EF4444", descripcion:"Circuitos de alta intensidad para quema de calorías efectiva." },
  { id:"c004", nombre:"HIIT Total",       dia:"Jue", hora:"18:30", duracion:45,  sala:"Sala C", capacidad:12, inscritos:11, nivel:"intermedio",   color:"#EF4444", descripcion:"Circuitos de alta intensidad para quema de calorías efectiva." },
  { id:"c005", nombre:"Fuerza Funcional", dia:"Vie", hora:"07:00", duracion:60,  sala:"Sala A", capacidad:10, inscritos:7,  nivel:"avanzado",     color:"#8B5CF6", descripcion:"Entrenamiento de fuerza con pesos libres y máquinas." },
  { id:"c006", nombre:"Boot Camp",        dia:"Sáb", hora:"08:00", duracion:90,  sala:"Exterior",capacidad:20, inscritos:20, nivel:"intermedio",  color:"#F59E0B", descripcion:"Entrenamiento militar funcional al aire libre." },
]

const NIVEL_COLOR: Record<string, string> = { principiante:"#10B981", intermedio:"#F59E0B", avanzado:"#EF4444" }

export default function EntrenadorClasesPage() {
  const { user } = useAuth()
  const [vista, setVista] = useState<"lista"|"semana">("lista")
  const [detalle, setDetalle] = useState<Clase | null>(null)
  const [tab, setTab] = useState<"info"|"asistentes">("info")

  const totalInscritos = MIS_CLASES.reduce((s, c) => s + c.inscritos, 0)
  const totalCapacidad = MIS_CLASES.reduce((s, c) => s + c.capacidad, 0)

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Mis Clases</h1>
            <p className="text-neutral-500 text-sm mt-0.5">RF-004 · {MIS_CLASES.length} clases semanales · {user?.nombre}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setVista("lista")}
              className={cn("px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                vista === "lista" ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white")}>
              Lista
            </button>
            <button onClick={() => setVista("semana")}
              className={cn("px-3 py-2 rounded-lg text-xs font-semibold transition-all",
                vista === "semana" ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white")}>
              Semana
            </button>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label:"Clases / semana", valor:MIS_CLASES.length, color:"#00D084" },
            { label:"Miembros totales", valor:totalInscritos,    color:"#3B82F6" },
            { label:"% Ocupación",      valor:`${Math.round((totalInscritos/totalCapacidad)*100)}%`, color:"#F59E0B" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3">
              <p className="font-black text-xl" style={{ color:s.color }}>{s.valor}</p>
              <p className="text-neutral-500 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {vista === "lista" && (
        <div className="space-y-3">
          {MIS_CLASES.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}
              className="glass-card rounded-2xl p-4 cursor-pointer hover:border-white/15 transition-all flex items-center gap-4"
              onClick={() => { setDetalle(c); setTab("info") }}
            >
              <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: c.color }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-bold text-sm">{c.nombre}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background:`${NIVEL_COLOR[c.nivel]}20`, color:NIVEL_COLOR[c.nivel] }}>
                    {c.nivel}
                  </span>
                </div>
                <p className="text-neutral-500 text-xs">{c.dia} · {c.hora} · {c.duracion}min · {c.sala}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("font-bold text-sm",
                  c.inscritos >= c.capacidad ? "text-[#EF4444]" :
                  c.inscritos >= c.capacidad * 0.8 ? "text-[#F59E0B]" : "text-[#00D084]"
                )}>
                  {c.inscritos}/{c.capacidad}
                </p>
                <p className="text-neutral-600 text-xs">inscritos</p>
              </div>
              <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden shrink-0">
                <div className="h-full rounded-full" style={{ width:`${(c.inscritos/c.capacidad)*100}%`, background:c.color }} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {vista === "semana" && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-white/5">
            {DIAS.map(d => (
              <div key={d} className="p-3 text-center text-xs font-bold text-neutral-500">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 min-h-[300px] divide-x divide-white/4">
            {DIAS.map(dia => (
              <div key={dia} className="p-2 space-y-1">
                {MIS_CLASES.filter(c => c.dia === dia).map(c => (
                  <button key={c.id} onClick={() => { setDetalle(c); setTab("info") }}
                    className="w-full text-left rounded-lg p-2 transition-opacity hover:opacity-80"
                    style={{ background:`${c.color}20`, borderLeft:`2px solid ${c.color}` }}>
                    <p className="text-white font-bold text-[10px]">{c.nombre}</p>
                    <p className="text-neutral-400 text-[9px]">{c.hora} · {c.inscritos}/{c.capacidad}</p>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Modal detalle */}
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
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div style={{ borderLeft:`3px solid ${detalle.color}` }} className="pl-3 mb-4">
                <h3 className="text-white font-bold text-xl">{detalle.nombre}</h3>
                <p className="text-neutral-500 text-sm">{detalle.dia} · {detalle.hora} · {detalle.sala}</p>
              </div>

              <div className="flex gap-2 mb-4">
                {(["info","asistentes"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={cn("flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize",
                      tab === t ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400"
                    )}>
                    {t === "info" ? "Información" : "Asistentes"}
                  </button>
                ))}
              </div>

              {tab === "info" && (
                <div className="space-y-3">
                  <p className="text-neutral-400 text-sm">{detalle.descripcion}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label:"Nivel",     value:detalle.nivel },
                      { label:"Duración",  value:`${detalle.duracion} min` },
                      { label:"Sala",      value:detalle.sala },
                      { label:"Cupos",     value:`${detalle.inscritos}/${detalle.capacidad}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="glass-card rounded-xl p-3">
                        <p className="text-neutral-600 text-[10px] uppercase tracking-wider">{label}</p>
                        <p className="text-white text-sm font-semibold mt-0.5 capitalize">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${(detalle.inscritos/detalle.capacidad)*100}%`, background:detalle.color }} />
                  </div>
                </div>
              )}

              {tab === "asistentes" && (
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {Array.from({ length: detalle.inscritos }, (_, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-[#00D084]/20 flex items-center justify-center text-[10px] font-bold text-[#00D084] shrink-0">
                        {String.fromCharCode(65 + (i % 26))}
                      </div>
                      <p className="text-white text-xs">Miembro {String(i + 1).padStart(2, "0")}</p>
                      <span className="ml-auto text-[10px] text-[#00D084]">inscrito</span>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => setDetalle(null)}
                className="mt-4 w-full py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
