"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

const clases = [
  { nombre: "Spinning Extremo", hora: "07:30", entrenador: "Coach Ana",  sala: "Sala A", cupos: 3,  confirmada: true  },
  { nombre: "Yoga Flow",        hora: "10:00", entrenador: "María V.",   sala: "Sala B", cupos: 8,  confirmada: false },
  { nombre: "HIIT Total",       hora: "18:30", entrenador: "Coach J.",   sala: "Sala C", cupos: 1,  confirmada: false },
]

const progreso = [
  { semana: "S1", valor: 3 }, { semana: "S2", valor: 5 }, { semana: "S3", valor: 2 },
  { semana: "S4", valor: 6 }, { semana: "S5", valor: 4 }, { semana: "S6", valor: 7 },
  { semana: "S7", valor: 5 }, { semana: "S8", valor: 8 },
]

const MAX_SESIONES = 8

export default function MiembroDashboard() {
  const { user } = useAuth()
  const [qrVisible, setQrVisible] = useState(false)

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeUp} className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Bienvenido,</p>
            <h1 className="text-white font-black text-2xl">{user?.nombre} 👋</h1>
            {user?.membresia && (
              <div className="mt-2 inline-flex items-center gap-2 bg-[#00D084]/10 border border-[#00D084]/25 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D084] animate-pulse" />
                <span className="text-[#00D084] text-xs font-semibold">
                  {user.membresia.plan} · vence {user.membresia.fecha_vencimiento}
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-neutral-600 text-xs">Sesiones este mes</p>
            <p className="text-white font-black text-3xl gradient-text-green">8</p>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* QR Access card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-white font-semibold mb-4 flex items-center gap-2">
            📱 <span>Acceso QR</span>
          </p>
          <div
            className="aspect-square max-w-[160px] mx-auto rounded-2xl bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setQrVisible(!qrVisible)}
          >
            {/* SVG QR simulado */}
            <svg viewBox="0 0 120 120" className="w-full h-full p-3">
              <rect x="10" y="10" width="30" height="30" rx="3" fill="#070D18" />
              <rect x="14" y="14" width="22" height="22" rx="2" fill="white" />
              <rect x="18" y="18" width="14" height="14" rx="1" fill="#070D18" />
              <rect x="80" y="10" width="30" height="30" rx="3" fill="#070D18" />
              <rect x="84" y="14" width="22" height="22" rx="2" fill="white" />
              <rect x="88" y="18" width="14" height="14" rx="1" fill="#070D18" />
              <rect x="10" y="80" width="30" height="30" rx="3" fill="#070D18" />
              <rect x="14" y="84" width="22" height="22" rx="2" fill="white" />
              <rect x="18" y="88" width="14" height="14" rx="1" fill="#070D18" />
              {/* Data modules */}
              {[50,56,62,68,74].map(x => [50,56,62,68,74].map(y => (
                Math.random() > 0.5 ?
                  <rect key={`${x}${y}`} x={x} y={y} width="4" height="4" fill="#070D18" /> : null
              )))}
              <rect x="48" y="48" width="24" height="24" rx="4" fill="#00D084" />
              <text x="60" y="64" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">G</text>
            </svg>
          </div>
          <p className="text-center text-neutral-600 text-xs mt-3">ID: JQ-2026-001</p>
          <p className="text-center text-[#00D084] text-xs mt-1">Válido hoy · 06:00 - 22:00</p>
        </motion.div>

        {/* Progress chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-white font-semibold mb-1 flex items-center gap-2">
            📊 <span>Mi Progreso</span>
          </p>
          <p className="text-neutral-600 text-xs mb-4">Sesiones por semana</p>
          <div className="flex items-end gap-2 h-24">
            {progreso.map((d, i) => (
              <div key={d.semana} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  className={cn("w-full rounded-t-sm", d.semana === "S8" ? "bg-[#00D084]" : "bg-white/20")}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.valor / MAX_SESIONES) * 96}px` }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.5 }}
                  style={{ alignSelf: "flex-end" }}
                />
                <span className="text-[9px] text-neutral-600">{d.semana}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-xs">Racha actual</p>
              <p className="text-white font-bold">🔥 5 días</p>
            </div>
            <div className="text-right">
              <p className="text-neutral-500 text-xs">Objetivo semanal</p>
              <p className="text-white font-bold">4 / 5 sesiones</p>
            </div>
          </div>
        </motion.div>

        {/* Membership card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #00D084 0%, #00A86B 100%)" }}
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <p className="text-[#070D18]/70 text-xs font-semibold uppercase tracking-wider">GYMsos</p>
            <p className="text-[#070D18] font-black text-xl mt-1">{user?.membresia?.plan ?? "Plan Free"}</p>
            <div className="mt-6 space-y-1">
              <p className="text-[#070D18]/80 text-xs">Titular</p>
              <p className="text-[#070D18] font-bold">{user?.nombre}</p>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[#070D18]/60 text-[10px]">Vence</p>
                <p className="text-[#070D18] font-bold text-sm">{user?.membresia?.fecha_vencimiento ?? "—"}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#070D18]/20 flex items-center justify-center">
                <span className="text-[#070D18] font-black text-xs">G</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming classes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold">📅 Próximas Clases</p>
          <button className="text-[#00D084] text-xs font-semibold hover:underline">Ver todas →</button>
        </div>
        <div className="space-y-3">
          {clases.map((c) => (
            <div
              key={c.nombre}
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 border transition-all",
                c.confirmada
                  ? "bg-[#00D084]/8 border-[#00D084]/20"
                  : "bg-white/3 border-white/6 hover:border-white/12",
              )}
            >
              <div className="text-center shrink-0 w-12">
                <p className="text-white font-bold text-sm">{c.hora}</p>
                <p className="text-neutral-600 text-[10px]">hoy</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{c.nombre}</p>
                <p className="text-neutral-500 text-xs">{c.entrenador} · {c.sala}</p>
              </div>
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full shrink-0",
                c.cupos <= 2 ? "bg-[#FF6B35]/15 text-[#FF6B35]" : "bg-[#00D084]/15 text-[#00D084]"
              )}>
                {c.cupos} {c.cupos === 1 ? "lugar" : "lugares"}
              </span>
              {c.confirmada ? (
                <span className="text-[#00D084] text-xs font-semibold shrink-0">✓ Confirmada</span>
              ) : (
                <button className="shrink-0 bg-white text-[#070D18] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
                  Inscribirse
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
