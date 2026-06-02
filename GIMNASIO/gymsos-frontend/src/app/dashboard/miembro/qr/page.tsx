"use client"

import { motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { useHistorialMiembro } from "@/hooks/useAccesos"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

function QRCode({ userId }: { userId: string }) {
  const seed = userId.replace(/-/g, "").substring(0, 8).toUpperCase()
  const modules: boolean[][] = Array.from({ length: 21 }, (_, r) =>
    Array.from({ length: 21 }, (_, c) => {
      const hash = (r * 31 + c * 17 + seed.charCodeAt(r % seed.length)) % 3
      return hash !== 0
    }),
  )

  return (
    <div className="p-3 bg-white rounded-2xl inline-block">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(21, 8px)", gap: 1 }}>
        {modules.flatMap((row, r) =>
          row.map((on, c) => (
            <div
              key={`${r}-${c}`}
              style={{ width: 8, height: 8, background: on ? "#070D18" : "white" }}
            />
          )),
        )}
      </div>
    </div>
  )
}

export default function QRPage() {
  const { user } = useAuth()
  const [brillo, setBrillo] = useState(false)
  const [tiempo, setTiempo] = useState(new Date())
  const historialState = useHistorialMiembro(user?.id_usuario)

  useEffect(() => {
    const timer = setInterval(() => setTiempo(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const membresiaActiva = user?.membresia?.estado === "activa"

  const historial = useMemo(() => {
    return (historialState.data ?? []).slice(0, 8)
  }, [historialState.data])

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white font-black text-2xl">Acceso QR</h1>
        <p className="text-neutral-500 text-sm mt-0.5">Muestra este codigo en el torniquete</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "glass-card rounded-2xl p-8 text-center mb-4",
          membresiaActiva ? "border-[#00D084]/20" : "border-[#EF4444]/20",
        )}
      >
        {!membresiaActiva ? (
          <div className="py-8">
            <p className="text-[#EF4444] font-bold text-lg">Membresia inactiva</p>
            <p className="text-neutral-500 text-sm mt-2">Renueva tu membresia para obtener acceso</p>
            <a
              href="/dashboard/miembro/membresia"
              className="mt-4 inline-block bg-[#00D084] text-[#070D18] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#00E891] transition-colors"
            >
              Renovar ahora
            </a>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00D084] animate-pulse" />
              <span className="text-[#00D084] text-sm font-bold">Membresia activa</span>
            </div>

            <div
              className={cn(
                "inline-block cursor-pointer transition-all duration-300",
                brillo && "scale-105 shadow-[0_0_40px_rgba(0,208,132,0.3)]",
              )}
              onClick={() => {
                setBrillo(true)
                setTimeout(() => setBrillo(false), 800)
              }}
            >
              <QRCode userId={user?.id_usuario ?? "demo-user"} />
            </div>

            <p className="text-white font-mono text-sm mt-4">
              {(user?.nombre ?? "usuario").toUpperCase().replace(/ /g, "-")}
            </p>
            <p className="text-neutral-600 text-xs mt-1">{tiempo.toLocaleTimeString("es-PE")}</p>
          </>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <p className="text-white font-semibold text-sm">Historial de accesos</p>
          {historialState.loading && <Loader2 size={14} className="animate-spin text-neutral-400" />}
        </div>

        <div className="divide-y divide-white/4">
          {!historialState.loading && historial.length === 0 ? (
            <p className="text-neutral-500 text-xs p-4">Sin registros recientes.</p>
          ) : (
            historial.map((h) => (
              <div key={h.id_acceso} className="px-4 py-3 flex items-center gap-3">
                <span className="text-lg">{h.tipo_acceso === "qr" ? "QR" : h.tipo_acceso === "manual" ? "M" : "B"}</span>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    {new Date(h.fecha_hora_entrada).toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-neutral-600 text-xs">{user?.nombre_gimnasio ?? "Gym"} · {h.tipo_acceso}</p>
                </div>
                <span className="text-[#00D084] text-xs font-bold bg-[#00D084]/10 px-2 py-0.5 rounded-full">
                  {h.estado_acceso}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
