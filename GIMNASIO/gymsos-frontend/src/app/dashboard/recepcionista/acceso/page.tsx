"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"
import { useAuth } from "@/components/providers/auth-provider"
import { useAccesosRecientes, useConteoAccesos } from "@/hooks/useAccesos"
import { registrarAcceso, buscarUsuarios } from "@/lib/services"
import type { AccesoDetalle } from "@/lib/services"
import { Loader2, Search } from "lucide-react"

type MiembroResult = { id_usuario: string; nombre: string; email: string; documento: string | null }

function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export default function AccesoPage() {
  const { user } = useAuth()
  const gymId    = user?.tenant_id ?? undefined

  const accesosState = useAccesosRecientes(gymId, 30)
  const conteoState  = useConteoAccesos(gymId)

  const accesos = accesosState.data ?? []
  const conteo  = conteoState.data ?? { total: 0, actualmente_dentro: 0 }

  const [qrInput, setQrInput]       = useState("")
  const [busqueda, setBusqueda]     = useState("")
  const [sugerencias, setSugerencias] = useState<MiembroResult[]>([])
  const [buscando, setBuscando]     = useState(false)
  const [procesando, setProcesando] = useState(false)
  const [ultimo, setUltimo]         = useState<{ nombre: string; permitido: boolean; razon?: string } | null>(null)
  const [reloj, setReloj]           = useState(formatHora(new Date().toISOString()))
  const searchTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const t = setInterval(() => setReloj(formatHora(new Date().toISOString())), 1000)
    return () => clearInterval(t)
  }, [])

  // Búsqueda debounced de miembros
  useEffect(() => {
    if (!busqueda.trim()) { setSugerencias([]); return }
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
  }, [busqueda, gymId])

  async function procesarAcceso(
    usuarioId: string,
    nombre: string,
    tipo: "qr" | "manual",
  ) {
    if (!gymId || procesando) return
    setProcesando(true)
    try {
      const result = await registrarAcceso(usuarioId, gymId, tipo)
      setUltimo({ nombre, permitido: result.permitido, razon: result.razon })
      accesosState.refetch()
      conteoState.refetch()
    } finally {
      setProcesando(false)
      setTimeout(() => setUltimo(null), 4000)
    }
  }

  async function handleQR(e: React.FormEvent) {
    e.preventDefault()
    if (!qrInput.trim()) return
    // El QR contiene el id_usuario (UUID)
    await procesarAcceso(qrInput.trim(), "Miembro QR", "qr")
    setQrInput("")
  }

  async function handleManual(miembro: MiembroResult) {
    setBusqueda("")
    setSugerencias([])
    await procesarAcceso(miembro.id_usuario, miembro.nombre, "manual")
  }

  const hoyPermitidos = accesos.filter(a => a.estado_acceso === "permitido").length
  const hoyDenegados  = accesos.filter(a => a.estado_acceso === "denegado").length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Control de Acceso</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Monitor en tiempo real</p>
          </div>
          <div className="text-right">
            <p className="text-[#00D084] font-mono font-black text-2xl">{reloj}</p>
            <p className="text-neutral-600 text-xs">Hora actual</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Accesos hoy",  valor: conteoState.loading ? "—" : hoyPermitidos.toString(),              color: "#00D084", icon: "✅" },
            { label: "Denegados",    valor: conteoState.loading ? "—" : hoyDenegados.toString(),               color: "#EF4444", icon: "🚫" },
            { label: "Dentro ahora", valor: conteoState.loading ? "—" : conteo.actualmente_dentro.toString(),  color: "#3B82F6", icon: "👥" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="font-black text-xl" style={{ color: s.color }}>{s.valor}</p>
                <p className="text-neutral-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel de control */}
        <div className="space-y-4">
          {/* Lector QR */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">📱 Código QR</p>
            <form onSubmit={handleQR}>
              <input
                type="text" value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                placeholder="Escanea o escribe el ID de miembro..."
                autoFocus
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors mb-2"
              />
              <button type="submit" disabled={procesando || !qrInput.trim()}
                className="w-full py-2.5 rounded-xl bg-[#00D084] text-[#070D18] font-bold text-sm hover:bg-[#00E891] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {procesando ? <Loader2 size={13} className="animate-spin" /> : null}
                Validar Acceso
              </button>
            </form>
          </motion.div>

          {/* Acceso manual por búsqueda */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">🔍 Registro manual</p>
            <div className="relative">
              <div className="relative">
                <input
                  type="text" value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar miembro por nombre..."
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 pr-8 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                />
                {buscando
                  ? <Loader2 size={13} className="animate-spin absolute right-3 top-3 text-neutral-500" />
                  : <Search size={13} className="absolute right-3 top-3 text-neutral-600" />
                }
              </div>
              {sugerencias.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-[#0D1526] border border-white/10 rounded-xl mt-1 overflow-hidden shadow-xl">
                  {sugerencias.map((m) => (
                    <button key={m.id_usuario} type="button" onClick={() => handleManual(m)} disabled={procesando}
                      className="w-full px-4 py-2.5 text-left hover:bg-white/5 transition-colors disabled:opacity-50">
                      <p className="text-white text-sm font-medium">{m.nombre}</p>
                      <p className="text-neutral-500 text-xs">{m.documento ?? m.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Estado torniquete */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">🚪 Torniquete</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00D084] animate-pulse" />
              <div>
                <p className="text-[#00D084] font-bold text-sm">Operativo</p>
                <p className="text-neutral-600 text-xs">Conectado · API v2.1</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stream de accesos */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Stream de Accesos</p>
              <div className="flex items-center gap-3">
                {accesosState.loading && <Loader2 size={13} className="animate-spin text-neutral-500" />}
                <span className="flex items-center gap-1.5 text-xs text-[#00D084]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
                  En vivo
                </span>
              </div>
            </div>

            <div className="divide-y divide-white/4 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {accesos.map((a: AccesoDetalle) => (
                  <motion.div
                    key={a.id_acceso}
                    initial={{ opacity: 0, x: -16, backgroundColor: "rgba(0,208,132,0.1)" }}
                    animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 0.4 }}
                    className="px-5 py-3 flex items-center gap-4"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      a.estado_acceso === "permitido" ? "bg-[#00D084] text-[#070D18]" : "bg-[#EF4444] text-white"
                    )}>
                      {a.estado_acceso === "permitido" ? "✓" : "✗"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{a.nombre_usuario ?? "—"}</p>
                      <p className="text-neutral-600 text-xs">{a.plan_usuario ?? "Sin plan"} · {a.tipo_acceso}</p>
                      {a.razon_denegacion && (
                        <p className="text-[#EF4444] text-[10px] font-semibold">{a.razon_denegacion}</p>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-neutral-400 text-xs tabular-nums">
                        {new Date(a.fecha_hora_entrada).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <span className={cn("text-[10px] font-bold",
                        a.estado_acceso === "permitido" ? "text-[#00D084]" : "text-[#EF4444]"
                      )}>
                        {a.fecha_hora_salida ? "Salida" : a.estado_acceso}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!accesosState.loading && accesos.length === 0 && (
                <p className="text-center text-neutral-500 text-sm py-10">Sin accesos registrados hoy</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast de feedback */}
      <AnimatePresence>
        {ultimo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className={cn(
              "fixed bottom-6 left-1/2 -translate-x-1/2 font-bold px-6 py-4 rounded-2xl shadow-2xl text-center min-w-[240px]",
              ultimo.permitido ? "bg-[#00D084] text-[#070D18]" : "bg-[#EF4444] text-white"
            )}
          >
            <p className="text-2xl mb-1">{ultimo.permitido ? "✓" : "✗"}</p>
            <p className="font-black">{ultimo.nombre}</p>
            <p className="text-sm opacity-80 mt-0.5">
              {ultimo.permitido ? "Acceso PERMITIDO" : `Acceso DENEGADO${ultimo.razon ? ` · ${ultimo.razon}` : ""}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
