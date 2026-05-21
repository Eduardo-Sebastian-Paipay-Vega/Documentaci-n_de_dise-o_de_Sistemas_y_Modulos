"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-010: Evaluación Atlética — INSERT INTO evaluaciones_atleticas
// (id_usuario, id_entrenador, peso, altura, grasa_corporal, masa_muscular,
//  resistencia_cardiovascular, fuerza_maxima, flexibilidad, fecha_evaluacion)

type Evaluacion = {
  id: string
  nombre: string
  fecha: string
  peso: number
  altura: number
  grasa: number
  musculo: number
  cardio: number
  fuerza: string
  flexibilidad: string
  nota: string
}

const EVALUACIONES: Evaluacion[] = [
  { id:"e001", nombre:"Juan Quispe",   fecha:"2026-05-15", peso:78.2, altura:175, grasa:14.5, musculo:38.2, cardio:82, fuerza:"Sentadilla 100kg", flexibilidad:"Alta",  nota:"Excelente progreso en fuerza. Reducir tiempo de recuperación." },
  { id:"e002", nombre:"Ana Flores",    fecha:"2026-05-14", peso:61.8, altura:162, grasa:22.3, musculo:27.8, cardio:74, fuerza:"Press banca 45kg",  flexibilidad:"Media", nota:"Buena técnica. Enfocar en core y resistencia." },
  { id:"e003", nombre:"Luis Mamani",   fecha:"2026-05-12", peso:85.4, altura:180, grasa:12.8, musculo:42.6, cardio:91, fuerza:"Sentadilla 130kg",  flexibilidad:"Media", nota:"Atleta de alto rendimiento. Mantener programa actual." },
  { id:"e004", nombre:"Rosa Chávez",   fecha:"2026-05-10", peso:57.9, altura:158, grasa:28.1, musculo:24.3, cardio:61, fuerza:"Peso corporal",      flexibilidad:"Baja",  nota:"Necesita más constancia. Motivación decayendo." },
]

const CLIENTES_SIN_EVAL = ["Pablo Fuentes", "Carmen Torres", "Andrés Rojas"]

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState(EVALUACIONES)
  const [detalle, setDetalle] = useState<Evaluacion | null>(null)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    nombre:"", peso:"", altura:"", grasa:"", musculo:"",
    cardio:"", fuerza:"", flexibilidad:"Alta", nota:""
  })

  function crearEvaluacion(e: React.FormEvent) {
    e.preventDefault()
    const nueva: Evaluacion = {
      id: `e${Date.now()}`,
      nombre: form.nombre,
      fecha: new Date().toISOString().split("T")[0],
      peso: Number(form.peso),
      altura: Number(form.altura),
      grasa: Number(form.grasa),
      musculo: Number(form.musculo),
      cardio: Number(form.cardio),
      fuerza: form.fuerza,
      flexibilidad: form.flexibilidad,
      nota: form.nota,
    }
    setEvaluaciones(prev => [nueva, ...prev])
    setModal(false)
    setForm({ nombre:"", peso:"", altura:"", grasa:"", musculo:"", cardio:"", fuerza:"", flexibilidad:"Alta", nota:"" })
  }

  function imc(ev: Evaluacion) {
    return (ev.peso / ((ev.altura / 100) ** 2)).toFixed(1)
  }

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Evaluaciones Atléticas</h1>
            <p className="text-neutral-500 text-sm mt-0.5">RF-010 · Métricas y seguimiento de alumnos</p>
          </div>
          <button onClick={() => setModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] font-bold text-sm hover:bg-[#00E891] transition-colors">
            + Nueva Evaluación
          </button>
        </motion.div>

        {/* Pendientes */}
        {CLIENTES_SIN_EVAL.length > 0 && (
          <motion.div variants={fadeUp} className="mt-4 glass-card rounded-xl p-4">
            <p className="text-[#F59E0B] text-xs font-semibold mb-2">⚠️ Sin evaluación reciente ({CLIENTES_SIN_EVAL.length})</p>
            <div className="flex gap-2 flex-wrap">
              {CLIENTES_SIN_EVAL.map(n => (
                <button key={n} onClick={() => { setForm(prev => ({...prev, nombre:n})); setModal(true) }}
                  className="text-xs px-2 py-1 rounded-lg bg-[#F59E0B]/10 text-[#F59E0B] font-semibold hover:bg-[#F59E0B]/20 transition-colors">
                  {n} →
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {evaluaciones.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-5 cursor-pointer hover:border-white/15 transition-all"
            onClick={() => setDetalle(ev)}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D084]/30 to-[#00D084]/10 flex items-center justify-center font-black text-[#00D084]">
                {ev.nombre[0]}
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{ev.nombre}</p>
                <p className="text-neutral-500 text-xs">{ev.fecha}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label:"Peso",    value:`${ev.peso}kg` },
                { label:"IMC",     value:imc(ev) },
                { label:"% Grasa", value:`${ev.grasa}%` },
                { label:"Cardio",  value:`${ev.cardio}` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-white font-bold text-sm">{value}</p>
                  <p className="text-neutral-600 text-[9px] uppercase">{label}</p>
                </div>
              ))}
            </div>

            {/* Barras métricas */}
            <div className="space-y-1.5">
              {[
                { label:"Masa Muscular", valor:ev.musculo, max:50, color:"#00D084" },
                { label:"Cardio",        valor:ev.cardio,  max:100, color:"#3B82F6" },
                { label:"% Grasa",       valor:ev.grasa,   max:40,  color:"#F59E0B" },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-neutral-600 text-[9px] w-20 shrink-0">{m.label}</span>
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${(m.valor/m.max)*100}%`, background:m.color }} />
                  </div>
                  <span className="text-neutral-400 text-[9px] w-8 text-right">{m.valor}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00D084]/30 to-[#00D084]/10 flex items-center justify-center font-black text-[#00D084] text-lg">
                  {detalle.nombre[0]}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{detalle.nombre}</h3>
                  <p className="text-neutral-500 text-sm">{detalle.fecha}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label:"Peso",        value:`${detalle.peso} kg` },
                  { label:"Altura",      value:`${detalle.altura} cm` },
                  { label:"IMC",         value:imc(detalle) },
                  { label:"% Grasa",     value:`${detalle.grasa}%` },
                  { label:"Masa musc.",  value:`${detalle.musculo} kg` },
                  { label:"Cardio VO2",  value:`${detalle.cardio}` },
                ].map(({ label, value }) => (
                  <div key={label} className="glass-card rounded-xl p-3">
                    <p className="text-neutral-600 text-[9px] uppercase tracking-wider">{label}</p>
                    <p className="text-white text-sm font-bold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              <div className="glass-card rounded-xl p-3 mb-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Fuerza máxima</span>
                  <span className="text-white font-semibold">{detalle.fuerza}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">Flexibilidad</span>
                  <span className="text-white font-semibold">{detalle.flexibilidad}</span>
                </div>
              </div>

              {detalle.nota && (
                <div className="glass-card rounded-xl p-3 mb-4">
                  <p className="text-neutral-500 text-xs mb-1">Notas del entrenador</p>
                  <p className="text-neutral-300 text-sm">{detalle.nota}</p>
                </div>
              )}

              <button onClick={() => setDetalle(null)}
                className="w-full py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">
                Cerrar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal nueva evaluación */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-8"
            onClick={() => setModal(false)}
          >
            <motion.div
              initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-white font-bold text-lg mb-4">Nueva Evaluación</h3>
              <form onSubmit={crearEvaluacion} className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Alumno</label>
                  <input type="text" required value={form.nombre} onChange={e => setForm(p=>({...p,nombre:e.target.value}))}
                    placeholder="Nombre del alumno"
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label:"Peso (kg)",  key:"peso",    placeholder:"78.5" },
                    { label:"Altura (cm)",key:"altura",  placeholder:"175" },
                    { label:"% Grasa",    key:"grasa",   placeholder:"14.5" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                      <input type="number" step="0.1" required
                        value={form[f.key as keyof typeof form]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.placeholder}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label:"Masa musc. (kg)", key:"musculo", placeholder:"38" },
                    { label:"Cardio VO2",      key:"cardio",  placeholder:"82" },
                    { label:"Fuerza (desc.)",  key:"fuerza",  placeholder:"Sentadilla 100kg" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                      <input type={f.key === "fuerza" ? "text" : "number"} step="0.1" required
                        value={form[f.key as keyof typeof form]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                        placeholder={f.placeholder}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Flexibilidad</label>
                    <select value={form.flexibilidad} onChange={e => setForm(p=>({...p,flexibilidad:e.target.value}))}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none">
                      <option className="bg-[#0D1526]">Alta</option>
                      <option className="bg-[#0D1526]">Media</option>
                      <option className="bg-[#0D1526]">Baja</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Notas</label>
                  <textarea rows={2} value={form.nota} onChange={e => setForm(p=>({...p,nota:e.target.value}))}
                    placeholder="Observaciones del entrenador..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 resize-none" />
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setModal(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                    Guardar Evaluación
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
