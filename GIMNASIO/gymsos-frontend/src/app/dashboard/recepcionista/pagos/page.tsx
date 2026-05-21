"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-002: Cobrar Membresía — INSERT INTO pagos + UPDATE membresias
// RF-016: Gestión de Descuentos — validación de cupones en tabla `promociones`
// RF-013: Recordatorios — SELECT u.nombre, m.fecha_vencimiento FROM membresias...

const PLANES = [
  { id:"basic",   nombre:"Basic",        precio:79.90 },
  { id:"silver",  nombre:"Silver",       precio:109.90 },
  { id:"gold",    nombre:"Gold Premium", precio:149.90 },
  { id:"annual",  nombre:"Gold Anual",   precio:1499.00 },
]

type PagoItem = {
  id: string
  miembro: string
  plan: string
  monto: number
  metodo: "efectivo" | "yape" | "tarjeta"
  fecha: string
  estado: "completado" | "pendiente" | "reembolsado"
  cupon?: string
}

const PAGOS_HOY: PagoItem[] = [
  { id:"p001", miembro:"Juan Quispe",    plan:"Gold Premium", monto:149.90, metodo:"efectivo", fecha:"09:45", estado:"completado" },
  { id:"p002", miembro:"Ana Flores",     plan:"Silver",       monto:109.90, metodo:"yape",     fecha:"09:22", estado:"completado" },
  { id:"p003", miembro:"Carmen Torres",  plan:"Gold Premium", monto:119.92, metodo:"tarjeta",  fecha:"08:58", estado:"completado", cupon:"DESC20" },
  { id:"p004", miembro:"Luis Mamani",    plan:"Basic",        monto:79.90,  metodo:"efectivo", fecha:"08:30", estado:"pendiente" },
  { id:"p005", miembro:"Sofía Mendoza",  plan:"Gold Anual",   monto:1499.00,metodo:"tarjeta",  fecha:"08:10", estado:"completado" },
]

const VENCIMIENTOS = [
  { nombre:"Rosa Chávez",    plan:"Silver",       dias:2,  telefono:"+51 987 654 321" },
  { nombre:"Pablo Fuentes",  plan:"Gold Premium", dias:5,  telefono:"+51 912 345 678" },
  { nombre:"Valeria Cruz",   plan:"Basic",        dias:7,  telefono:"+51 923 456 789" },
  { nombre:"Andrés Rojas",   plan:"Silver",       dias:10, telefono:"+51 934 567 890" },
]

const METODOS = [
  { v:"efectivo", label:"💵 Efectivo" },
  { v:"yape",     label:"📱 Yape" },
  { v:"tarjeta",  label:"💳 Tarjeta" },
]

export default function PagosPage() {
  const [tab, setTab] = useState<"cobrar"|"historial"|"vencimientos">("cobrar")
  const [busqueda, setBusqueda] = useState("")
  const [planSel, setPlanSel] = useState("gold")
  const [metodo, setMetodo] = useState("efectivo")
  const [cupon, setCupon] = useState("")
  const [cuponAplicado, setCuponAplicado] = useState(false)
  const [exito, setExito] = useState(false)
  const [pagos, setPagos] = useState(PAGOS_HOY)

  const planActual = PLANES.find(p => p.id === planSel)
  const descuento  = cuponAplicado ? planActual!.precio * 0.20 : 0
  const total      = planActual ? planActual.precio - descuento : 0

  function aplicarCupon(e: React.FormEvent) {
    e.preventDefault()
    if (cupon.toUpperCase() === "DESC20" || cupon.toUpperCase() === "GYMSOS") {
      setCuponAplicado(true)
    } else {
      alert("Cupón inválido o vencido")
    }
  }

  function procesarPago(e: React.FormEvent) {
    e.preventDefault()
    if (!busqueda.trim()) return
    const nuevoPago: PagoItem = {
      id:     `p${Date.now()}`,
      miembro: busqueda,
      plan:   planActual?.nombre ?? "Gold Premium",
      monto:  total,
      metodo: metodo as "efectivo" | "yape" | "tarjeta",
      fecha:  new Date().toLocaleTimeString("es-PE", { hour:"2-digit", minute:"2-digit" }),
      estado: "completado",
      cupon:  cuponAplicado ? cupon.toUpperCase() : undefined,
    }
    setPagos(prev => [nuevoPago, ...prev])
    setExito(true)
    setBusqueda(""); setCupon(""); setCuponAplicado(false); setMetodo("efectivo"); setPlanSel("gold")
    setTimeout(() => setExito(false), 3000)
  }

  const totalHoy = pagos.filter(p => p.estado === "completado").reduce((s, p) => s + p.monto, 0)
  const countHoy = pagos.filter(p => p.estado === "completado").length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Pagos y Cobros</h1>
            <p className="text-neutral-500 text-sm mt-0.5">RF-002 · RF-016 · Cobros y gestión de descuentos</p>
          </div>
          <div className="text-right glass-card rounded-xl px-4 py-2">
            <p className="text-[#00D084] font-black text-lg">S/ {totalHoy.toLocaleString("es-PE", { minimumFractionDigits:2 })}</p>
            <p className="text-neutral-500 text-xs">{countHoy} cobros hoy</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 mt-4">
          {([["cobrar","💳 Cobrar"],["historial","📋 Historial"],["vencimientos","⚠️ Por vencer"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                tab === t ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
              )}>
              {label}
            </button>
          ))}
        </motion.div>
      </motion.div>

      {tab === "cobrar" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Formulario de cobro */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card rounded-2xl p-6">
            <p className="text-white font-semibold mb-4">Procesar Pago</p>
            <form onSubmit={procesarPago} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Miembro</label>
                <input
                  type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {PLANES.map(p => (
                    <button key={p.id} type="button" onClick={() => setPlanSel(p.id)}
                      className={cn("rounded-xl p-3 text-left border-2 transition-all",
                        planSel === p.id ? "border-[#00D084] bg-[#00D084]/8" : "border-white/8 hover:border-white/20"
                      )}>
                      <p className="text-white font-bold text-xs">{p.nombre}</p>
                      <p className="text-[#00D084] font-black text-sm">S/ {p.precio}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Método de pago</label>
                <div className="grid grid-cols-3 gap-2">
                  {METODOS.map(m => (
                    <button key={m.v} type="button" onClick={() => setMetodo(m.v)}
                      className={cn("py-2.5 rounded-xl text-sm font-semibold transition-all",
                        metodo === m.v ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
                      )}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Cupón de descuento (opcional)</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={cupon} onChange={e => { setCupon(e.target.value); setCuponAplicado(false) }}
                    placeholder="Código de cupón..."
                    className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                  />
                  <button type="button" onClick={aplicarCupon}
                    className="px-4 rounded-xl glass-card text-neutral-300 text-sm font-semibold hover:text-white transition-colors">
                    Aplicar
                  </button>
                </div>
                {cuponAplicado && (
                  <p className="text-[#00D084] text-xs mt-1 font-semibold">✓ Descuento 20% aplicado</p>
                )}
              </div>

              {/* Resumen */}
              <div className="glass-card rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Plan {planActual?.nombre}</span>
                  <span className="text-white">S/ {planActual?.precio.toFixed(2)}</span>
                </div>
                {cuponAplicado && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#00D084]">Descuento ({cupon.toUpperCase()})</span>
                    <span className="text-[#00D084]">-S/ {descuento.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black pt-1 border-t border-white/8">
                  <span className="text-white">Total</span>
                  <span className="text-[#00D084]">S/ {total.toFixed(2)}</span>
                </div>
              </div>

              <button type="submit"
                className="w-full py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors">
                ✓ Confirmar Cobro · S/ {total.toFixed(2)}
              </button>
            </form>
          </motion.div>

          {/* Pagos recientes */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <p className="text-white font-semibold text-sm">Pagos de Hoy</p>
            </div>
            <div className="divide-y divide-white/4 max-h-[520px] overflow-y-auto">
              {pagos.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i * 0.05 }}
                  className="px-4 py-3 flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0",
                    p.estado === "completado" ? "bg-[#00D084]/15 text-[#00D084]" :
                    p.estado === "pendiente"  ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                    "bg-[#EF4444]/15 text-[#EF4444]"
                  )}>
                    {p.metodo === "efectivo" ? "💵" : p.metodo === "yape" ? "📱" : "💳"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{p.miembro}</p>
                    <p className="text-neutral-600 text-xs">{p.plan} · {p.metodo}
                      {p.cupon && <span className="text-[#00D084] ml-1">· {p.cupon}</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-sm">S/ {p.monto.toFixed(2)}</p>
                    <p className="text-neutral-600 text-xs">{p.fecha}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {tab === "historial" && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <p className="text-white font-semibold text-sm">Historial de Pagos</p>
            <button className="text-xs glass-card px-3 py-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors">
              Exportar CSV
            </button>
          </div>
          <div className="divide-y divide-white/4">
            {pagos.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{p.miembro}</p>
                  <p className="text-neutral-600 text-xs">{p.plan} · {p.metodo} · Hoy {p.fecha}</p>
                </div>
                <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                  p.estado === "completado"  ? "bg-[#00D084]/15 text-[#00D084]" :
                  p.estado === "pendiente"   ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                  "bg-[#EF4444]/15 text-[#EF4444]"
                )}>
                  {p.estado}
                </span>
                <p className="text-white font-black text-sm w-20 text-right">S/ {p.monto.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {tab === "vencimientos" && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="space-y-3">
          <div className="glass-card rounded-2xl p-4 mb-2">
            <p className="text-neutral-400 text-sm">
              Miembros con membresía próxima a vencer en los próximos <span className="text-white font-bold">14 días</span>.
              Contáctalos para renovar.
            </p>
          </div>
          {VENCIMIENTOS.map((v, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0",
                v.dias <= 3 ? "bg-[#EF4444]/20 text-[#EF4444]" : v.dias <= 7 ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-[#3B82F6]/20 text-[#3B82F6]"
              )}>
                {v.dias}d
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{v.nombre}</p>
                <p className="text-neutral-500 text-xs">{v.plan} · {v.telefono}</p>
              </div>
              <div className="flex gap-2">
                <button className="text-xs px-3 py-1.5 rounded-lg glass-card text-neutral-300 hover:text-white transition-colors">
                  📱 Recordar
                </button>
                <button className="text-xs px-3 py-1.5 rounded-lg bg-[#00D084]/15 text-[#00D084] hover:bg-[#00D084]/25 transition-colors font-semibold">
                  Renovar
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {exito && (
          <motion.div
            initial={{ opacity:0, scale:0.9, y:40 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.9, y:40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00D084] text-[#070D18] font-bold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            ✓ Pago registrado exitosamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
