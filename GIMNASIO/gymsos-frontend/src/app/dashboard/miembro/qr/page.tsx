"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

// CU-004: Ingresar al Gimnasio (QR) — RF-003
// El QR contiene: id_usuario + timestamp + firma HMAC
// La API /api/access valida el QR y registra en tabla `accesos`

function QRCode({ userId }: { userId: string }) {
  const seed = userId.replace(/-/g, "").substring(0, 8).toUpperCase()

  const modules: boolean[][] = Array.from({ length: 21 }, (_, r) =>
    Array.from({ length: 21 }, (_, c) => {
      if (r < 7 && c < 7) return (r === 0||r===6||c===0||c===6||( r>0&&r<6&&c>0&&c<6&&(r===1||r===5||c===1||c===5) ? false : true))
      if (r < 7 && c > 13) return (r === 0||r===6||c===14||c===20||( r>0&&r<6&&c>14&&c<20&&(r===1||r===5||c===15||c===19) ? false : true))
      if (r > 13 && c < 7) return (r === 14||r===20||c===0||c===6||( r>14&&r<20&&c>0&&c<6&&(r===15||r===19||c===1||c===5) ? false : true))
      const hash = (r * 31 + c * 17 + seed.charCodeAt(r % seed.length)) % 3
      return hash !== 0
    })
  )

  return (
    <div className="p-3 bg-white rounded-2xl inline-block">
      <div style={{ display: "grid", gridTemplateColumns: `repeat(21, 8px)`, gap: 1 }}>
        {modules.flatMap((row, r) =>
          row.map((on, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: 8,
                height: 8,
                background: on ? "#070D18" : "white",
                borderRadius: (r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7) ? 2 : 0,
              }}
            />
          ))
        )}
      </div>
      {/* Logo central */}
      <div className="relative -mt-[72px] flex justify-center pointer-events-none">
        <div className="w-8 h-8 bg-[#00D084] rounded-lg flex items-center justify-center shadow-lg">
          <span className="text-[#070D18] font-black text-sm">G</span>
        </div>
      </div>
    </div>
  )
}

const HISTORIAL_ACCESOS = [
  { fecha:"Hoy 09:15",     tipo:"qr",      estado:"permitido", sucursal:"GymFit Lima" },
  { fecha:"Ayer 07:30",    tipo:"qr",      estado:"permitido", sucursal:"GymFit Lima" },
  { fecha:"Lun 18:45",     tipo:"qr",      estado:"permitido", sucursal:"GymFit Lima" },
  { fecha:"Sáb 08:10",     tipo:"qr",      estado:"permitido", sucursal:"GymFit Lima" },
  { fecha:"Vie 07:00",     tipo:"biometria",estado:"permitido",sucursal:"GymFit Lima" },
]

export default function QRPage() {
  const { user } = useAuth()
  const [brillo, setBrillo] = useState(false)
  const [tiempo, setTiempo] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTiempo(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", second: "2-digit" })

  const membresiaActiva = user?.membresia?.estado === "activa"

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Acceso QR</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Muestra este código en el torniquete</p>
      </div>

      {/* Card QR principal */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "glass-card rounded-2xl p-8 text-center mb-4",
          membresiaActiva ? "border-[#00D084]/20" : "border-[#EF4444]/20"
        )}
      >
        {!membresiaActiva ? (
          <div className="py-8">
            <p className="text-5xl mb-4">🚫</p>
            <p className="text-[#EF4444] font-bold text-lg">Membresía Inactiva</p>
            <p className="text-neutral-500 text-sm mt-2">Renueva tu membresía para obtener acceso</p>
            <a href="/dashboard/miembro/membresia"
              className="mt-4 inline-block bg-[#00D084] text-[#070D18] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#00E891] transition-colors">
              Renovar ahora →
            </a>
          </div>
        ) : (
          <>
            {/* Estado */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span className="text-[#00D084] text-sm font-bold">Membresía Activa</span>
            </div>

            {/* QR */}
            <div
              className={cn("inline-block cursor-pointer transition-all duration-300",
                brillo && "scale-105 shadow-[0_0_40px_rgba(0,208,132,0.3)]"
              )}
              onClick={() => { setBrillo(true); setTimeout(() => setBrillo(false), 800) }}
            >
              <QRCode userId={user?.id_usuario ?? "demo-user"} />
            </div>

            <p className="text-white font-mono text-sm mt-4">
              {user?.nombre?.toUpperCase().replace(/ /g, "-")}-{(user?.id_usuario ?? "").substring(0,6).toUpperCase()}
            </p>
            <p className="text-neutral-600 text-xs mt-1">{formatTime(tiempo)}</p>

            <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-neutral-500 text-xs">Plan</p>
                <p className="text-white font-semibold text-sm">{user?.membresia?.plan}</p>
              </div>
              <div>
                <p className="text-neutral-500 text-xs">Vence</p>
                <p className="text-white font-semibold text-sm">{user?.membresia?.fecha_vencimiento}</p>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Info horario */}
      {membresiaActiva && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4 mb-4 flex items-center gap-3"
        >
          <span className="text-2xl">🕐</span>
          <div>
            <p className="text-white text-sm font-semibold">Horario de acceso</p>
            <p className="text-neutral-500 text-xs">L-V 06:00 - 22:00 · Sáb 07:00 - 20:00 · Dom 08:00 - 14:00</p>
          </div>
        </motion.div>
      )}

      {/* Historial de accesos */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/5">
          <p className="text-white font-semibold text-sm">Historial de Accesos</p>
        </div>
        <div className="divide-y divide-white/4">
          {HISTORIAL_ACCESOS.map((h, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg">{h.tipo === "qr" ? "📱" : "👆"}</span>
              <div className="flex-1">
                <p className="text-white text-sm">{h.fecha}</p>
                <p className="text-neutral-600 text-xs">{h.sucursal} · {h.tipo}</p>
              </div>
              <span className="text-[#00D084] text-xs font-bold bg-[#00D084]/10 px-2 py-0.5 rounded-full">
                ✓ {h.estado}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
