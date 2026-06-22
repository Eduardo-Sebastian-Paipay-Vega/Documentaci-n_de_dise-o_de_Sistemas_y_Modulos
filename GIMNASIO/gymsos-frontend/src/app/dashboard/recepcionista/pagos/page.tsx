"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { useAuth } from "@/components/providers/auth-provider"
import { usePlanes } from "@/hooks/usePlanes"
import { usePagosHoy, usePagosPendientes } from "@/hooks/useMiembros"
import { registrarPago, buscarUsuarios } from "@/lib/services"
import { Loader2, Search } from "lucide-react"
import type { Plan } from "@/lib/services"

const METODOS = [
  { v: "efectivo",     label: "💵 Efectivo" },
  { v: "yape",         label: "📱 Yape" },
  { v: "tarjeta",      label: "💳 Tarjeta" },
] as const

type MetodoPago = "efectivo" | "yape" | "tarjeta"

type MiembroResult = { id_usuario: string; nombre: string; email: string; documento: string | null }

export default function PagosPage() {
  const { user } = useAuth()
  const gymId    = user?.tenant_id ?? undefined

  const planesState  = usePlanes(gymId)
  const pagosState   = usePagosHoy(gymId)
  const vencState    = usePagosPendientes(gymId)

  const planes = planesState.data ?? []
  const pagos  = pagosState.data ?? []
  const venc   = vencState.data ?? []

  const [tab, setTab]           = useState<"cobrar" | "historial" | "vencimientos">("cobrar")
  const [planSel, setPlanSel]   = useState<Plan | null>(null)
  const [metodo, setMetodo]     = useState<MetodoPago>("efectivo")
  const [cupon, setCupon]       = useState("")
  const [cuponAplicado, setCuponAplicado] = useState(false)
  const [exito, setExito]       = useState(false)
  const [procesando, setProcesando] = useState(false)

  // miembro search
  const [busqueda, setBusqueda]         = useState("")
  const [miembroSel, setMiembroSel]    = useState<MiembroResult | null>(null)
  const [sugerencias, setSugerencias]  = useState<MiembroResult[]>([])
  const [buscando, setBuscando]        = useState(false)
  const searchTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null)

  // set first plan when plans load
  useEffect(() => {
    if (planes.length > 0 && !planSel) {
      setPlanSel(planes.find(p => p.nombre === "Gold Premium") ?? planes[0])
    }
  }, [planes])  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!busqueda.trim() || miembroSel) {
      setSugerencias([])
      return
    }
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(async () => {
      if (!gymId) return
      setBuscando(true)
      try {
        const res = await buscarUsuarios(gymId, busqueda)
        setSugerencias(res as MiembroResult[])
      } finally {
        setBuscando(false)
      }
    }, 350)
  }, [busqueda, gymId, miembroSel])

  function seleccionarMiembro(m: MiembroResult) {
    setMiembroSel(m)
    setBusqueda(m.nombre)
    setSugerencias([])
  }

  const descuento = cuponAplicado && planSel ? planSel.precio_mensual * 0.20 : 0
  const total     = planSel ? planSel.precio_mensual - descuento : 0

  function aplicarCupon(e: React.FormEvent) {
    e.preventDefault()
    const c = cupon.toUpperCase()
    if (c === "DESC20" || c === "GYMSOS") {
      setCuponAplicado(true)
    } else {
      alert("Cupón inválido o vencido")
    }
  }

  async function procesarPago(e: React.FormEvent) {
    e.preventDefault()
    if (!miembroSel || !planSel) return
    setProcesando(true)
    try {
      await registrarPago({
        id_usuario:   miembroSel.id_usuario,
        monto:        total,
        metodo_pago:  metodo,
        descripcion:  cuponAplicado ? `Plan ${planSel.nombre} · Cupón ${cupon.toUpperCase()}` : `Plan ${planSel.nombre}`,
      })
      pagosState.refetch()
      setExito(true)
      setMiembroSel(null); setBusqueda("")
      setCupon(""); setCuponAplicado(false); setMetodo("efectivo")
      setTimeout(() => setExito(false), 3000)
    } finally {
      setProcesando(false)
    }
  }

  const totalHoy  = pagos.filter(p => p.estado === "completado").reduce((s, p) => s + p.monto, 0)
  const countHoy  = pagos.filter(p => p.estado === "completado").length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Pagos y Cobros</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Cobros y gestión de membresías</p>
          </div>
          <div className="text-right glass-card rounded-xl px-4 py-2">
            {pagosState.loading ? (
              <Loader2 size={16} className="animate-spin text-neutral-500 mx-auto" />
            ) : (
              <>
                <p className="text-[#00D084] font-black text-lg">S/ {totalHoy.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
                <p className="text-neutral-500 text-xs">{countHoy} cobros hoy</p>
              </>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 mt-4">
          {([["cobrar", "💳 Cobrar"], ["historial", "📋 Historial"], ["vencimientos", "⚠️ Por vencer"]] as const).map(([t, label]) => (
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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
            <p className="text-white font-semibold mb-4">Procesar Pago</p>
            <form onSubmit={procesarPago} className="space-y-4">
              {/* Búsqueda de miembro */}
              <div className="relative">
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Miembro</label>
                <div className="relative">
                  <input
                    type="text" value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); if (miembroSel) setMiembroSel(null) }}
                    placeholder="Buscar por nombre, email o DNI..."
                    className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 pr-8 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    required
                  />
                  {buscando
                    ? <Loader2 size={14} className="animate-spin absolute right-3 top-3 text-neutral-500" />
                    : <Search size={14} className="absolute right-3 top-3 text-neutral-600" />
                  }
                </div>
                {sugerencias.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-[#0D1526] border border-white/10 rounded-xl mt-1 overflow-hidden shadow-xl">
                    {sugerencias.map((m) => (
                      <button key={m.id_usuario} type="button" onClick={() => seleccionarMiembro(m)}
                        className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors">
                        <p className="text-white text-sm font-medium">{m.nombre}</p>
                        <p className="text-neutral-500 text-xs">{m.email}</p>
                      </button>
                    ))}
                  </div>
                )}
                {miembroSel && (
                  <p className="text-[#00D084] text-xs mt-1 font-semibold">✓ Miembro seleccionado</p>
                )}
              </div>

              {/* Plan */}
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">Plan</label>
                {planesState.loading ? (
                  <div className="flex items-center justify-center h-20">
                    <Loader2 size={14} className="animate-spin text-neutral-500" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {planes.map(p => (
                      <button key={p.id_plan} type="button" onClick={() => setPlanSel(p)}
                        className={cn("rounded-xl p-3 text-left border-2 transition-all",
                          planSel?.id_plan === p.id_plan ? "border-[#00D084] bg-[#00D084]/8" : "border-white/8 hover:border-white/20"
                        )}>
                        <p className="text-white font-bold text-xs">{p.nombre}</p>
                        <p className="text-[#00D084] font-black text-sm">S/ {p.precio_mensual.toFixed(2)}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Método de pago */}
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

              {/* Cupón */}
              <div>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Cupón (opcional)</label>
                <div className="flex gap-2">
                  <input
                    type="text" value={cupon}
                    onChange={e => { setCupon(e.target.value); setCuponAplicado(false) }}
                    placeholder="Código de cupón..."
                    className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                  />
                  <button type="button" onClick={aplicarCupon}
                    className="px-4 rounded-xl glass-card text-neutral-300 text-sm font-semibold hover:text-white transition-colors">
                    Aplicar
                  </button>
                </div>
                {cuponAplicado && <p className="text-[#00D084] text-xs mt-1 font-semibold">✓ Descuento 20% aplicado</p>}
              </div>

              {/* Resumen */}
              <div className="glass-card rounded-xl p-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Plan {planSel?.nombre ?? "—"}</span>
                  <span className="text-white">S/ {planSel?.precio_mensual.toFixed(2) ?? "0.00"}</span>
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

              <button type="submit" disabled={procesando || !miembroSel || !planSel}
                className="w-full py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold hover:bg-[#00E891] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {procesando && <Loader2 size={14} className="animate-spin" />}
                ✓ Confirmar Cobro · S/ {total.toFixed(2)}
              </button>
            </form>
          </motion.div>

          {/* Pagos recientes */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <p className="text-white font-semibold text-sm">Pagos de Hoy</p>
            </div>
            {pagosState.loading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={16} className="animate-spin text-neutral-500" />
              </div>
            ) : (
              <div className="divide-y divide-white/4 max-h-[520px] overflow-y-auto">
                {pagos.map((p, i) => (
                  <motion.div key={p.id_pago || i}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="px-4 py-3 flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0",
                      p.estado === "completado" ? "bg-[#00D084]/15 text-[#00D084]" :
                      p.estado === "pendiente"  ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                      "bg-[#EF4444]/15 text-[#EF4444]"
                    )}>
                      {p.metodo_pago === "efectivo" ? "💵" : p.metodo_pago === "yape" ? "📱" : "💳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{p.nombre_usuario ?? "—"}</p>
                      <p className="text-neutral-600 text-xs">{p.plan_nombre ?? "—"} · {p.metodo_pago}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white font-bold text-sm">S/ {p.monto.toFixed(2)}</p>
                      <p className="text-neutral-600 text-xs">
                        {new Date(p.fecha_pago).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {pagos.length === 0 && (
                  <p className="text-center text-neutral-500 text-sm py-8">Sin cobros hoy</p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {tab === "historial" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <p className="text-white font-semibold text-sm">Historial de Pagos — Hoy</p>
            <span className="text-xs glass-card px-3 py-1.5 rounded-lg text-neutral-300">
              {pagos.length} pagos
            </span>
          </div>
          {pagosState.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={16} className="animate-spin text-neutral-500" />
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {pagos.map((p, i) => (
                <div key={p.id_pago || i} className="px-5 py-3 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{p.nombre_usuario ?? "—"}</p>
                    <p className="text-neutral-600 text-xs">
                      {p.plan_nombre ?? "—"} · {p.metodo_pago} ·{" "}
                      {new Date(p.fecha_pago).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                    </p>
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
              {pagos.length === 0 && (
                <p className="text-center text-neutral-500 text-sm py-8">Sin pagos registrados hoy</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {tab === "vencimientos" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="glass-card rounded-2xl p-4 mb-2">
            <p className="text-neutral-400 text-sm">
              Miembros con membresía próxima a vencer en los próximos{" "}
              <span className="text-white font-bold">7 días</span>. Contáctalos para renovar.
            </p>
          </div>
          {vencState.loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={16} className="animate-spin text-neutral-500" />
            </div>
          ) : venc.length === 0 ? (
            <p className="text-center text-neutral-500 text-sm py-8">Sin vencimientos próximos</p>
          ) : venc.map((v, i) => {
            const diasHasta = Math.max(0, Math.ceil(
              (new Date(v.fecha_pago).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            ))
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0",
                  diasHasta <= 2 ? "bg-[#EF4444]/20 text-[#EF4444]" :
                  diasHasta <= 5 ? "bg-[#F59E0B]/20 text-[#F59E0B]" : "bg-[#3B82F6]/20 text-[#3B82F6]"
                )}>
                  {diasHasta}d
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{v.nombre_usuario ?? "—"}</p>
                  <p className="text-neutral-500 text-xs">{v.plan_nombre ?? "—"} · vence {new Date(v.fecha_pago).toLocaleDateString("es-PE")}</p>
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
            )
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {exito && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#00D084] text-[#070D18] font-bold px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            ✓ Pago registrado exitosamente
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
