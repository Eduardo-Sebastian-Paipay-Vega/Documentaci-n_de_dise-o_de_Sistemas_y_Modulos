"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// CU-002: Visualizar Membresía Activa — RF-001, RF-012
// En producción: SELECT m.*, p.nombre, p.precio_mensual, p.clases_incluidas
// FROM membresias m JOIN planes p ON m.id_plan = p.id_plan
// WHERE m.id_usuario = auth.uid() ORDER BY m.fecha_inicio DESC

const PLANES = [
  { nombre:"Basic",        precio:79.90,   clases:5,   color:"#6B7280", beneficios:["Acceso L-V 06-22h","5 clases/mes","Sin reservas de espacios"] },
  { nombre:"Silver",       precio:109.90,  clases:10,  color:"#9CA3AF", beneficios:["Acceso todos los días","10 clases/mes","Reservas online","1 evaluación/mes"] },
  { nombre:"Gold Premium", precio:149.90,  clases:-1,  color:"#F59E0B", beneficios:["Acceso 24/7","Clases ilimitadas","Reservas prioritarias","2 sesiones personales/mes","App gamificación"] },
  { nombre:"Enterprise",   precio:299.90,  clases:-1,  color:"#8B5CF6", beneficios:["Todo Gold +","Acceso multi-sucursal","Nutricionista incluido","Análisis biométrico","Mentor asignado"] },
]

const HISTORIAL = [
  { periodo:"Mayo 2026",  inicio:"2026-05-01", fin:"2026-05-31", plan:"Gold Premium", estado:"activa",   monto:149.90 },
  { periodo:"Abril 2026", inicio:"2026-04-01", fin:"2026-04-30", plan:"Gold Premium", estado:"vencida",  monto:149.90 },
  { periodo:"Marzo 2026", inicio:"2026-03-01", fin:"2026-03-31", plan:"Silver",       estado:"vencida",  monto:109.90 },
  { periodo:"Feb 2026",   inicio:"2026-02-01", fin:"2026-02-28", plan:"Silver",       estado:"vencida",  monto:109.90 },
]

export default function MembresiaPage() {
  const { user } = useAuth()
  const [modalRenovar, setModalRenovar] = useState(false)
  const [planSeleccionado, setPlanSeleccionado] = useState("Gold Premium")

  const mem = user?.membresia
  const diasRestantes = mem ? Math.ceil((new Date(mem.fecha_vencimiento).getTime() - Date.now()) / 86400000) : 0

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Mi Membresía</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Estado y detalles de tu plan activo</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Tarjeta membresía */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #00D084 0%, #00A86B 60%, #007A4D 100%)" }}
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/8 rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-[#070D18]/60 text-xs font-semibold uppercase tracking-wider">GYMsos Card</p>
                <p className="text-[#070D18] font-black text-2xl mt-1">{mem?.plan ?? "Sin plan activo"}</p>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-bold",
                mem?.estado === "activa" ? "bg-[#070D18]/15 text-[#070D18]" : "bg-[#EF4444]/20 text-[#EF4444]"
              )}>
                {mem?.estado === "activa" ? "✓ ACTIVA" : (mem?.estado?.toUpperCase() ?? "INACTIVA")}
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-[#070D18]/60 text-xs">Titular</p>
                <p className="text-[#070D18] font-bold text-lg">{user?.nombre}</p>
                <p className="text-[#070D18]/50 text-xs mt-0.5">{user?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-[#070D18]/60 text-xs">Vence</p>
                <p className="text-[#070D18] font-bold">{mem?.fecha_vencimiento ?? "—"}</p>
                {diasRestantes > 0 && (
                  <p className={cn("text-xs font-bold mt-0.5",
                    diasRestantes <= 7 ? "text-[#EF4444]" : "text-[#070D18]/70"
                  )}>
                    {diasRestantes <= 7 ? `⚠ ${diasRestantes} días restantes` : `${diasRestantes} días`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Acciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 flex flex-col justify-between"
        >
          <div>
            <p className="text-white font-semibold mb-4">Acciones rápidas</p>
            <div className="space-y-2">
              <button
                onClick={() => setModalRenovar(true)}
                className="w-full py-3 rounded-xl bg-[#00D084] text-[#070D18] font-bold text-sm hover:bg-[#00E891] transition-colors"
              >
                🔄 Renovar Membresía
              </button>
              <button className="w-full py-3 rounded-xl glass-card text-neutral-300 text-sm font-semibold hover:text-white transition-colors">
                📄 Descargar Comprobante
              </button>
              <button className="w-full py-3 rounded-xl glass-card text-neutral-300 text-sm font-semibold hover:text-white transition-colors">
                📧 Enviar por Email
              </button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-neutral-600 text-xs">Próxima renovación</p>
            <p className="text-white font-semibold text-sm mt-0.5">{mem?.fecha_vencimiento ?? "—"}</p>
          </div>
        </motion.div>
      </div>

      {/* Historial */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl overflow-hidden mb-6"
      >
        <div className="p-5 border-b border-white/5">
          <p className="text-white font-semibold">Historial de Membresías</p>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {["Período","Plan","Inicio","Vencimiento","Monto","Estado"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HISTORIAL.map((h, i) => (
              <tr key={h.periodo} className="border-b border-white/4">
                <td className="px-5 py-3 text-white text-sm font-medium">{h.periodo}</td>
                <td className="px-5 py-3 text-neutral-300 text-sm">{h.plan}</td>
                <td className="px-5 py-3 text-neutral-400 text-sm">{h.inicio}</td>
                <td className="px-5 py-3 text-neutral-400 text-sm">{h.fin}</td>
                <td className="px-5 py-3 text-white text-sm font-mono">S/ {h.monto}</td>
                <td className="px-5 py-3">
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                    h.estado === "activa" ? "bg-[#00D084]/15 text-[#00D084]" : "bg-white/8 text-neutral-500"
                  )}>
                    {h.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Modal Renovar */}
      {modalRenovar && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setModalRenovar(false)}>
          <motion.div
            initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-2xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Renovar / Cambiar Plan</h3>
              <button onClick={() => setModalRenovar(false)} className="text-neutral-500 hover:text-white text-xl">×</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {PLANES.map(p => (
                <button
                  key={p.nombre}
                  onClick={() => setPlanSeleccionado(p.nombre)}
                  className={cn(
                    "rounded-xl p-4 text-left border-2 transition-all",
                    planSeleccionado === p.nombre ? "border-[#00D084] bg-[#00D084]/8" : "border-white/8 bg-white/3 hover:border-white/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-bold text-sm">{p.nombre}</p>
                    {planSeleccionado === p.nombre && <span className="text-[#00D084] text-xs font-bold">✓</span>}
                  </div>
                  <p className="text-[#00D084] font-black text-xl">S/ {p.precio}<span className="text-xs text-neutral-500 font-normal">/mes</span></p>
                  <ul className="mt-2 space-y-0.5">
                    {p.beneficios.map(b => (
                      <li key={b} className="text-neutral-400 text-[11px] flex items-center gap-1">
                        <span className="text-[#00D084]">·</span> {b}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModalRenovar(false)}
                className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cancelar</button>
              <button className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                Pagar con Stripe →
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
