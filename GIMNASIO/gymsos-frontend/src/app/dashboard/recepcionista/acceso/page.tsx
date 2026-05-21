"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-003, RF-017: Control de Acceso + Registro en tabla `accesos`
// INSERT INTO accesos (id_usuario, id_gimnasio, tipo_acceso, estado_acceso)
// La validación verifica: membresía activa + horario permitido + no suspendido

// Simula el stream en tiempo real de accesos QR (en prod: Supabase realtime)
type Acceso = {
  id: string
  nombre: string
  plan: string
  hora: string
  tipo: "qr" | "manual"
  estado: "permitido" | "denegado"
  razon?: string
}

const ACCESOS_INICIALES: Acceso[] = [
  { id:"a001", nombre:"Juan Quispe",   plan:"Gold Premium", hora:"09:15", tipo:"qr",     estado:"permitido" },
  { id:"a002", nombre:"Ana Flores",    plan:"Silver",       hora:"09:08", tipo:"qr",     estado:"permitido" },
  { id:"a003", nombre:"Carmen Torres", plan:"Gold Premium", hora:"09:02", tipo:"qr",     estado:"denegado",  razon:"Membresía vencida" },
  { id:"a004", nombre:"Luis Mamani",   plan:"Enterprise",   hora:"08:55", tipo:"qr",     estado:"permitido" },
  { id:"a005", nombre:"Rosa Chávez",   plan:"Silver",       hora:"08:47", tipo:"manual",  estado:"permitido" },
  { id:"a006", nombre:"Desconocido",   plan:"—",            hora:"08:32", tipo:"qr",     estado:"denegado",  razon:"QR no reconocido" },
]

export default function AccesoPage() {
  const [accesos, setAccesos] = useState<Acceso[]>(ACCESOS_INICIALES)
  const [qrInput, setQrInput] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [accesoProcesado, setAccesoProcesado] = useState<Acceso | null>(null)

  const tiempo = new Date()
  const formatTime = (d: Date) => d.toLocaleTimeString("es-PE", { hour:"2-digit", minute:"2-digit", second:"2-digit" })
  const [reloj, setReloj] = useState(formatTime(tiempo))

  useEffect(() => {
    const t = setInterval(() => setReloj(formatTime(new Date())), 1000)
    return () => clearInterval(t)
  }, [])

  function procesarAccesoManual(e: React.FormEvent) {
    e.preventDefault()
    if (!busqueda.trim()) return

    const nuevoAcceso: Acceso = {
      id:     `a${Date.now()}`,
      nombre: busqueda,
      plan:   "Silver",
      hora:   reloj.substring(0, 5),
      tipo:   "manual",
      estado: "permitido",
    }
    setAccesos(prev => [nuevoAcceso, ...prev])
    setAccesoProcesado(nuevoAcceso)
    setBusqueda("")
    setTimeout(() => setAccesoProcesado(null), 3000)
  }

  function procesarQR(e: React.FormEvent) {
    e.preventDefault()
    if (!qrInput.trim()) return

    const esValido = qrInput.includes("GYMSOS") || qrInput.length > 6
    const nuevoAcceso: Acceso = {
      id:     `a${Date.now()}`,
      nombre: esValido ? "Miembro verificado" : "QR inválido",
      plan:   esValido ? "Gold Premium" : "—",
      hora:   reloj.substring(0, 5),
      tipo:   "qr",
      estado: esValido ? "permitido" : "denegado",
      razon:  esValido ? undefined : "QR no reconocido o expirado",
    }
    setAccesos(prev => [nuevoAcceso, ...prev])
    setAccesoProcesado(nuevoAcceso)
    setQrInput("")
    setTimeout(() => setAccesoProcesado(null), 3000)
  }

  const hoyPermitidos = accesos.filter(a => a.estado === "permitido").length
  const hoyDenegados  = accesos.filter(a => a.estado === "denegado").length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Control de Acceso</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Monitor en tiempo real · RF-003</p>
          </div>
          <div className="text-right">
            <p className="text-[#00D084] font-mono font-black text-2xl">{reloj}</p>
            <p className="text-neutral-600 text-xs">Hora actual</p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label:"Accesos hoy",  valor:hoyPermitidos, color:"#00D084", icon:"✅" },
            { label:"Denegados",    valor:hoyDenegados,  color:"#EF4444", icon:"🚫" },
            { label:"Dentro ahora", valor:47,            color:"#3B82F6", icon:"👥" },
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
          {/* Lector QR manual */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-white font-semibold mb-3 flex items-center gap-2">
              📱 Ingresar código QR
            </p>
            <form onSubmit={procesarQR}>
              <input
                type="text"
                value={qrInput}
                onChange={e => setQrInput(e.target.value)}
                placeholder="Escanea o escribe el código..."
                autoFocus
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors mb-2"
              />
              <button type="submit"
                className="w-full py-2.5 rounded-xl bg-[#00D084] text-[#070D18] font-bold text-sm hover:bg-[#00E891] transition-colors">
                Validar Acceso
              </button>
            </form>
          </motion.div>

          {/* Acceso manual por nombre */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="glass-card rounded-2xl p-5">
            <p className="text-white font-semibold mb-3">🔍 Registro manual</p>
            <form onSubmit={procesarAccesoManual}>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar miembro por nombre..."
                className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors mb-2"
              />
              <button type="submit"
                className="w-full py-2.5 rounded-xl glass-card text-neutral-300 font-semibold text-sm hover:text-white transition-colors">
                Registrar Entrada
              </button>
            </form>
          </motion.div>

          {/* Estado del torniquete */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
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
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="glass-card rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-semibold text-sm">Stream de Accesos</p>
              <span className="flex items-center gap-1.5 text-xs text-[#00D084]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
                En vivo
              </span>
            </div>

            <div className="divide-y divide-white/4 max-h-[500px] overflow-y-auto">
              <AnimatePresence>
                {accesos.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, x: -16, backgroundColor: "rgba(0,208,132,0.1)" }}
                    animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,0,0,0)" }}
                    transition={{ duration: 0.4 }}
                    className="px-5 py-3 flex items-center gap-4"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      a.estado === "permitido" ? "bg-[#00D084] text-[#070D18]" : "bg-[#EF4444] text-white"
                    )}>
                      {a.estado === "permitido" ? "✓" : "✗"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">{a.nombre}</p>
                      <p className="text-neutral-600 text-xs">{a.plan} · {a.tipo}</p>
                      {a.razon && <p className="text-[#EF4444] text-[10px] font-semibold">{a.razon}</p>}
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-neutral-400 text-xs">{a.hora}</p>
                      <span className={cn("text-[10px] font-bold",
                        a.estado === "permitido" ? "text-[#00D084]" : "text-[#EF4444]"
                      )}>
                        {a.estado}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feedback de acceso procesado */}
      <AnimatePresence>
        {accesoProcesado && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className={cn(
              "fixed bottom-6 left-1/2 -translate-x-1/2 font-bold px-6 py-4 rounded-2xl shadow-2xl text-center min-w-[240px]",
              accesoProcesado.estado === "permitido"
                ? "bg-[#00D084] text-[#070D18]"
                : "bg-[#EF4444] text-white"
            )}
          >
            <p className="text-2xl mb-1">{accesoProcesado.estado === "permitido" ? "✓" : "✗"}</p>
            <p className="font-black">{accesoProcesado.nombre}</p>
            <p className="text-sm opacity-80 mt-0.5">
              {accesoProcesado.estado === "permitido" ? "Acceso PERMITIDO" : `Acceso DENEGADO · ${accesoProcesado.razon}`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
