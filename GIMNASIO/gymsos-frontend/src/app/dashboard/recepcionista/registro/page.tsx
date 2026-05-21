"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-001: Registro de nuevo miembro
// En prod: INSERT INTO usuarios + INSERT INTO membresias + INSERT INTO pagos
// Todos bajo el id_gimnasio del recepcionista

const PLANES = [
  { id:"basic",   nombre:"Basic",        precio:79.90,  duracion:30,  desc:"Acceso básico L-V" },
  { id:"silver",  nombre:"Silver",       precio:109.90, duracion:30,  desc:"Acceso completo + 10 clases" },
  { id:"gold",    nombre:"Gold Premium", precio:149.90, duracion:30,  desc:"Ilimitado + clases ilimitadas" },
  { id:"annual",  nombre:"Gold Anual",   precio:1499.00,duracion:365, desc:"Gold + 2 meses gratis" },
]

const RECIENTES = [
  { nombre:"Sofía Mendoza",  plan:"Gold Premium",hora:"10:23", tipo:"Nuevo miembro",   color:"#00D084" },
  { nombre:"Pablo Fuentes",  plan:"Silver",      hora:"09:47", tipo:"Renovación",      color:"#3B82F6" },
  { nombre:"Valeria Cruz",   plan:"Basic",       hora:"09:15", tipo:"Nuevo miembro",   color:"#00D084" },
  { nombre:"Andrés Rojas",   plan:"Gold Premium",hora:"08:52", tipo:"Pago pendiente",  color:"#F59E0B" },
]

export default function RegistroPage() {
  const [step, setStep] = useState(1)
  const [planSel, setPlanSel] = useState("gold")
  const [exito, setExito] = useState(false)
  const [form, setForm] = useState({ nombre:"", email:"", telefono:"", documento:"", genero:"M", pago:"efectivo" })

  function handleChange(k: string, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function handleRegistrar(e: React.FormEvent) {
    e.preventDefault()
    setExito(true)
    setTimeout(() => { setExito(false); setStep(1); setForm({ nombre:"", email:"", telefono:"", documento:"", genero:"M", pago:"efectivo" }) }, 3000)
  }

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Registrar Nuevo Miembro</h1>
          <p className="text-neutral-500 text-sm mt-0.5">RF-001 · Registro con plan y pago inmediato</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Formulario */}
        <div className="lg:col-span-2">
          {/* Steps */}
          <div className="flex items-center gap-2 mb-5">
            {[1,2,3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step > s ? "bg-[#00D084] text-[#070D18]" :
                  step === s ? "bg-[#00D084]/20 border border-[#00D084] text-[#00D084]" :
                  "bg-white/8 text-neutral-500"
                )}>
                  {step > s ? "✓" : s}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block",
                  step >= s ? "text-white" : "text-neutral-600"
                )}>
                  {s === 1 ? "Datos personales" : s === 2 ? "Plan" : "Pago"}
                </span>
                {s < 3 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card rounded-2xl p-6"
          >
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2) }}>
                <p className="text-white font-semibold mb-4">Datos personales</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label:"Nombre completo", key:"nombre",    type:"text",  placeholder:"María González", required:true },
                    { label:"Email",           key:"email",     type:"email", placeholder:"maria@email.com",  required:true },
                    { label:"Teléfono",        key:"telefono",  type:"tel",   placeholder:"+51 9XX XXX XXX",  required:false },
                    { label:"DNI / Documento", key:"documento", type:"text",  placeholder:"12345678",          required:true },
                  ].map(f => (
                    <div key={f.key} className={f.key === "nombre" ? "sm:col-span-2" : ""}>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        required={f.required}
                        value={form[f.key as keyof typeof form]}
                        onChange={e => handleChange(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Género</label>
                    <select value={form.genero} onChange={e => handleChange("genero", e.target.value)}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40">
                      <option value="M" className="bg-[#0D1526]">Masculino</option>
                      <option value="F" className="bg-[#0D1526]">Femenino</option>
                      <option value="Otro" className="bg-[#0D1526]">Otro</option>
                    </select>
                  </div>
                </div>
                <button type="submit"
                  className="mt-5 w-full py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors">
                  Siguiente →
                </button>
              </form>
            )}

            {step === 2 && (
              <div>
                <p className="text-white font-semibold mb-4">Seleccionar Plan</p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {PLANES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlanSel(p.id)}
                      className={cn(
                        "rounded-xl p-4 text-left border-2 transition-all",
                        planSel === p.id ? "border-[#00D084] bg-[#00D084]/8" : "border-white/8 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-bold text-sm">{p.nombre}</p>
                        {planSel === p.id && <span className="text-[#00D084] text-xs">✓</span>}
                      </div>
                      <p className="text-[#00D084] font-black">S/ {p.precio}</p>
                      <p className="text-neutral-600 text-[11px] mt-1">{p.desc}</p>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl glass-card text-neutral-300 font-semibold">← Atrás</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors">Siguiente →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleRegistrar}>
                <p className="text-white font-semibold mb-4">Procesar Pago</p>

                <div className="glass-card rounded-xl p-4 mb-4">
                  <p className="text-neutral-500 text-xs mb-2">Resumen</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">{form.nombre}</span>
                    <span className="text-white font-bold">{PLANES.find(p => p.id === planSel)?.nombre}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-neutral-500">Total a cobrar</span>
                    <span className="text-[#00D084] font-black text-lg">S/ {PLANES.find(p => p.id === planSel)?.precio}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Método de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v:"efectivo", label:"💵 Efectivo" },
                      { v:"yape",     label:"📱 Yape" },
                      { v:"tarjeta",  label:"💳 Tarjeta" },
                    ].map(m => (
                      <button key={m.v} type="button" onClick={() => handleChange("pago", m.v)}
                        className={cn("py-2.5 rounded-xl text-sm font-semibold transition-all",
                          form.pago === m.v ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
                        )}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl glass-card text-neutral-300 font-semibold">← Atrás</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors">
                    ✓ Registrar y Cobrar
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Panel lateral — Registros recientes */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Registros de Hoy</p>
              <span className="text-xs bg-[#00D084]/15 text-[#00D084] font-bold px-2 py-0.5 rounded-full">{RECIENTES.length}</span>
            </div>
            <div className="divide-y divide-white/4">
              {RECIENTES.map((r, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="px-4 py-3"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-6 h-6 rounded-full bg-[#00D084] flex items-center justify-center text-[10px] font-black text-[#070D18]">
                      {r.nombre[0]}
                    </div>
                    <p className="text-white text-xs font-semibold">{r.nombre}</p>
                  </div>
                  <p className="text-neutral-500 text-[11px] ml-8">{r.plan}</p>
                  <div className="flex items-center justify-between ml-8 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${r.color}20`, color: r.color }}>
                      {r.tipo}
                    </span>
                    <span className="text-neutral-600 text-[10px]">{r.hora}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast de éxito */}
      <AnimatePresence>
        {exito && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00D084] text-[#070D18] font-bold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            ✓ Miembro registrado exitosamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
