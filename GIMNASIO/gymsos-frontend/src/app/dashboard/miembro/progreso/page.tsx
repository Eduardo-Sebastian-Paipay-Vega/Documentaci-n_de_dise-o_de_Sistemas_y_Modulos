"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { staggerContainer, fadeUp } from "@/lib/motion"

// CU-006: Ver Estadísticas Personales — RF-006, RF-021 (Gamificación XP)
// SELECT COUNT(*) FROM accesos WHERE id_usuario = auth.uid()
// SELECT * FROM gamification_levels WHERE id_usuario = auth.uid()
// SELECT * FROM gamification_xp WHERE id_usuario = auth.uid() ORDER BY fecha_evento DESC

const SESIONES_SEMANA = [
  { semana:"S1", valor:3 }, { semana:"S2", valor:5 }, { semana:"S3", valor:2 },
  { semana:"S4", valor:6 }, { semana:"S5", valor:4 }, { semana:"S6", valor:7 },
  { semana:"S7", valor:5 }, { semana:"S8", valor:8 },
]

const XP_HISTORIAL = [
  { tipo:"Sesión completada",    xp:100, fecha:"Hoy 09:20",   icon:"💪" },
  { tipo:"Clase de Yoga asistida",xp:75,  fecha:"Ayer 07:35",  icon:"🧘" },
  { tipo:"Nueva PR — Sentadilla", xp:500, fecha:"Lun 18:50",   icon:"🏆" },
  { tipo:"Sesión completada",    xp:100, fecha:"Lun 18:45",   icon:"💪" },
  { tipo:"Reto de clan ganado",  xp:250, fecha:"Sáb 10:00",   icon:"⚔️" },
  { tipo:"Racha de 7 días",      xp:200, fecha:"Vie 07:05",   icon:"🔥" },
]

const LOGROS = [
  { nombre:"Primer Mes",  icon:"🥇", desc:"Completa 30 días",     progreso:100, desbloqueado:true  },
  { nombre:"Centurión",   icon:"💯", desc:"100 visitas al gym",   progreso:82,  desbloqueado:false },
  { nombre:"Madrugador",  icon:"🌅", desc:"10 sesiones antes 7am",progreso:60,  desbloqueado:false },
  { nombre:"Clan Master",  icon:"⚔️", desc:"Lidera un clan",      progreso:100, desbloqueado:true  },
  { nombre:"Nivel 50",    icon:"⭐", desc:"Alcanza el nivel 50",  progreso:50,  desbloqueado:false },
  { nombre:"Power Week",  icon:"🔥", desc:"7 sesiones en 7 días", progreso:100, desbloqueado:true  },
]

const MAX_SESIONES = 8

export default function ProgresoPage() {
  const { user } = useAuth()
  const chartRef = useRef<HTMLDivElement>(null)
  const inView   = useInView(chartRef, { once: true })

  // Datos de gamificación (en prod vendrían de gamification_levels)
  const xpTotal     = 3_250
  const nivel       = 32
  const xpProximo   = 500
  const xpActualNivel = 250

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Mi Progreso</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Estadísticas personales y gamificación</p>
        </motion.div>
      </motion.div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon:"💪", label:"Sesiones mes",    valor:"24",    sub:"↑ 4 vs mes anterior" },
          { icon:"🔥", label:"Racha actual",    valor:"5 días",sub:"Mejor racha: 12 días" },
          { icon:"⭐", label:"Nivel GYMsos",    valor:`Nv. ${nivel}`,sub:`${xpTotal.toLocaleString()} XP total` },
          { icon:"🏆", label:"Logros",          valor:"3/6",   sub:"Desbloqueados" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-2xl p-4"
          >
            <span className="text-2xl">{s.icon}</span>
            <p className="text-white font-black text-xl mt-2 gradient-text-green">{s.valor}</p>
            <p className="text-neutral-500 text-xs">{s.label}</p>
            <p className="text-neutral-700 text-[10px] mt-0.5">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Gráfico sesiones */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
          ref={chartRef}
        >
          <p className="text-white font-semibold mb-1">Sesiones por Semana</p>
          <p className="text-neutral-600 text-xs mb-5">Últimas 8 semanas</p>
          <div className="flex items-end gap-3 h-32">
            {SESIONES_SEMANA.map((d, i) => (
              <div key={d.semana} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs text-neutral-500">{d.valor}</span>
                <motion.div
                  className={d.semana === "S8" ? "w-full rounded-t-lg bg-[#00D084]" : "w-full rounded-t-lg bg-white/20"}
                  initial={{ height: 0 }}
                  animate={inView ? { height: `${(d.valor / MAX_SESIONES) * 120}px` } : { height: 0 }}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ alignSelf: "flex-end" }}
                />
                <span className="text-[10px] text-neutral-600">{d.semana}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* XP / Nivel */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-white font-semibold mb-4">🎮 Nivel GYMsos</p>
          <div className="text-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#00D084] to-[#00A86B] flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(0,208,132,0.3)]">
              <span className="text-[#070D18] font-black text-2xl">{nivel}</span>
            </div>
            <p className="text-[#00D084] font-bold">Nivel {nivel}</p>
            <p className="text-neutral-600 text-xs">GYMsos Warrior</p>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-500">Progreso al Nv. {nivel + 1}</span>
              <span className="text-[#00D084]">{xpActualNivel}/{xpProximo} XP</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00D084] to-[#00E891] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(xpActualNivel / xpProximo) * 100}%` }}
                transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          <p className="text-center text-neutral-600 text-xs">{xpTotal.toLocaleString()} XP total acumulado</p>
        </motion.div>
      </div>

      {/* Logros */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 mb-4"
      >
        <p className="text-white font-semibold mb-4">🏅 Logros</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LOGROS.map((l) => (
            <div
              key={l.nombre}
              className={`rounded-xl p-4 text-center border ${l.desbloqueado ? "border-[#00D084]/25 bg-[#00D084]/8" : "border-white/6 bg-white/2 opacity-60"}`}
            >
              <p className="text-2xl mb-1">{l.icon}</p>
              <p className={`text-sm font-bold ${l.desbloqueado ? "text-white" : "text-neutral-500"}`}>{l.nombre}</p>
              <p className="text-neutral-600 text-[10px] mt-0.5">{l.desc}</p>
              {!l.desbloqueado && (
                <div className="mt-2 h-1 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D084] rounded-full" style={{ width: `${l.progreso}%` }} />
                </div>
              )}
              {l.desbloqueado && <p className="text-[#00D084] text-[10px] font-bold mt-1">✓ Desbloqueado</p>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Historial XP */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl overflow-hidden"
      >
        <div className="p-4 border-b border-white/5">
          <p className="text-white font-semibold text-sm">Últimos eventos XP</p>
        </div>
        <div className="divide-y divide-white/4">
          {XP_HISTORIAL.map((x, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <span className="text-lg">{x.icon}</span>
              <div className="flex-1">
                <p className="text-white text-sm">{x.tipo}</p>
                <p className="text-neutral-600 text-xs">{x.fecha}</p>
              </div>
              <span className="text-[#00D084] font-black text-sm">+{x.xp} XP</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
