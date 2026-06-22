"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { useAuth } from "@/components/providers/auth-provider"
import { usePlanes } from "@/hooks/usePlanes"
import { usePagosHoy } from "@/hooks/useMiembros"
import { registrarNuevoMiembro } from "@/lib/services"
import { Loader2 } from "lucide-react"

const METODOS = [
  { v: "efectivo", label: "💵 Efectivo" },
  { v: "yape",     label: "📱 Yape" },
  { v: "tarjeta",  label: "💳 Tarjeta" },
] as const

type MetodoPago = "efectivo" | "yape" | "tarjeta"

type FormData = {
  nombre: string
  email: string
  telefono: string
  documento: string
  genero: "M" | "F" | "Otro"
  pago: MetodoPago
}

export default function RegistroPage() {
  const { user } = useAuth()
  const gymId    = user?.tenant_id ?? undefined

  const planesState  = usePlanes(gymId)
  const pagosHoyState = usePagosHoy(gymId)

  const planes  = planesState.data ?? []
  const recientes = (pagosHoyState.data ?? []).slice(0, 5)

  const [step, setStep]     = useState(1)
  const [planSel, setPlanSel] = useState<string | null>(null)
  const [exito, setExito]   = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [form, setForm]     = useState<FormData>({
    nombre: "", email: "", telefono: "", documento: "", genero: "M", pago: "efectivo",
  })

  function handleChange(k: keyof FormData, v: string) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  const planActual = planes.find(p => p.id_plan === planSel) ?? planes[0]

  async function handleRegistrar(e: React.FormEvent) {
    e.preventDefault()
    if (!gymId || !planActual) return
    setGuardando(true)
    setError(null)
    try {
      await registrarNuevoMiembro({
        nombre:       form.nombre,
        email:        form.email,
        telefono:     form.telefono || undefined,
        documento:    form.documento || undefined,
        genero:       form.genero,
        id_gimnasio:  gymId,
        id_plan:      planActual.id_plan,
        duracion_dias: planActual.duracion_dias,
        metodo_pago:  form.pago,
        monto:        planActual.precio_mensual,
      })
      pagosHoyState.refetch()
      setExito(true)
      setStep(1)
      setForm({ nombre: "", email: "", telefono: "", documento: "", genero: "M", pago: "efectivo" })
      setPlanSel(null)
      setTimeout(() => setExito(false), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el miembro")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Registrar Nuevo Miembro</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Registro con plan y pago inmediato</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Formulario */}
        <div className="lg:col-span-2">
          {/* Steps */}
          <div className="flex items-center gap-2 mb-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  step > s  ? "bg-[#00D084] text-[#070D18]" :
                  step === s ? "bg-[#00D084]/20 border border-[#00D084] text-[#00D084]" :
                  "bg-white/8 text-neutral-500"
                )}>
                  {step > s ? "✓" : s}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", step >= s ? "text-white" : "text-neutral-600")}>
                  {s === 1 ? "Datos personales" : s === 2 ? "Plan" : "Pago"}
                </span>
                {s < 3 && <div className="w-8 h-px bg-white/10" />}
              </div>
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-6">
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2) }}>
                <p className="text-white font-semibold mb-4">Datos personales</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: "Nombre completo", key: "nombre",    type: "text",  placeholder: "María González", required: true },
                    { label: "Email",           key: "email",     type: "email", placeholder: "maria@email.com", required: true },
                    { label: "Teléfono",        key: "telefono",  type: "tel",   placeholder: "+51 9XX XXX XXX", required: false },
                    { label: "DNI / Documento", key: "documento", type: "text",  placeholder: "12345678",        required: true },
                  ].map(f => (
                    <div key={f.key} className={f.key === "nombre" ? "sm:col-span-2" : ""}>
                      <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                      <input
                        type={f.type} required={f.required}
                        value={form[f.key as keyof FormData]}
                        onChange={e => handleChange(f.key as keyof FormData, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Género</label>
                    <select value={form.genero} onChange={e => handleChange("genero", e.target.value as "M" | "F" | "Otro")}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40">
                      <option value="M" className="bg-[#0D1526]">Masculino</option>
                      <option value="F" className="bg-[#0D1526]">Femenino</option>
                      <option value="Otro" className="bg-[#0D1526]">Otro</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="mt-5 w-full py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors">
                  Siguiente →
                </button>
              </form>
            )}

            {step === 2 && (
              <div>
                <p className="text-white font-semibold mb-4">Seleccionar Plan</p>
                {planesState.loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 size={16} className="animate-spin text-neutral-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {planes.map(p => (
                      <button key={p.id_plan} onClick={() => setPlanSel(p.id_plan)}
                        className={cn("rounded-xl p-4 text-left border-2 transition-all",
                          (planSel === p.id_plan || (!planSel && planes[0]?.id_plan === p.id_plan))
                            ? "border-[#00D084] bg-[#00D084]/8" : "border-white/8 hover:border-white/20"
                        )}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white font-bold text-sm">{p.nombre}</p>
                          {(planSel === p.id_plan || (!planSel && planes[0]?.id_plan === p.id_plan)) && (
                            <span className="text-[#00D084] text-xs">✓</span>
                          )}
                        </div>
                        <p className="text-[#00D084] font-black">S/ {p.precio_mensual.toFixed(2)}</p>
                        <p className="text-neutral-600 text-[11px] mt-1">{p.descripcion ?? `${p.duracion_dias} días`}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl glass-card text-neutral-300 font-semibold">← Atrás</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors">Siguiente →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleRegistrar}>
                <p className="text-white font-semibold mb-4">Procesar Pago</p>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm">
                    {error}
                  </div>
                )}

                <div className="glass-card rounded-xl p-4 mb-4">
                  <p className="text-neutral-500 text-xs mb-2">Resumen</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-300">{form.nombre}</span>
                    <span className="text-white font-bold">{planActual?.nombre ?? "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-neutral-500">Total a cobrar</span>
                    <span className="text-[#00D084] font-black text-lg">S/ {planActual?.precio_mensual.toFixed(2) ?? "0.00"}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Método de pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    {METODOS.map(m => (
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
                  <button type="submit" disabled={guardando}
                    className="flex-1 py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {guardando && <Loader2 size={14} className="animate-spin" />}
                    ✓ Registrar y Cobrar
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Panel lateral — Registros recientes */}
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Cobros de Hoy</p>
              <span className="text-xs bg-[#00D084]/15 text-[#00D084] font-bold px-2 py-0.5 rounded-full">
                {pagosHoyState.loading ? "—" : recientes.length}
              </span>
            </div>
            {pagosHoyState.loading ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 size={16} className="animate-spin text-neutral-500" />
              </div>
            ) : (
              <div className="divide-y divide-white/4">
                {recientes.map((r, i) => (
                  <motion.div key={r.id_pago || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-6 h-6 rounded-full bg-[#00D084] flex items-center justify-center text-[10px] font-black text-[#070D18]">
                        {(r.nombre_usuario ?? "?")[0]}
                      </div>
                      <p className="text-white text-xs font-semibold truncate">{r.nombre_usuario ?? "—"}</p>
                    </div>
                    <p className="text-neutral-500 text-[11px] ml-8">{r.plan_nombre ?? "—"}</p>
                    <div className="flex items-center justify-between ml-8 mt-0.5">
                      <span className="text-[10px] font-bold text-[#00D084]">S/ {r.monto.toFixed(2)}</span>
                      <span className="text-neutral-600 text-[10px]">
                        {new Date(r.fecha_pago).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {recientes.length === 0 && (
                  <p className="text-center text-neutral-500 text-sm py-6">Sin cobros hoy</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

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
