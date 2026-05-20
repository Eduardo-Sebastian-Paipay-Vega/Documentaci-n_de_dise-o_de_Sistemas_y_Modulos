"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/motion"

const accesosRecientes = [
  { nombre: "Ana Torres",   hora: "08:47", plan: "Premium", tipo: "entrada", avatar: "A" },
  { nombre: "Carlos M.",    hora: "08:31", plan: "Gold",    tipo: "entrada", avatar: "C" },
  { nombre: "Jorge F.",     hora: "08:12", plan: "Gold",    tipo: "salida",  avatar: "J" },
  { nombre: "Rosa Ch.",     hora: "07:58", plan: "Basic",   tipo: "entrada", avatar: "R" },
  { nombre: "Luis P.",      hora: "07:45", plan: "Silver",  tipo: "salida",  avatar: "L" },
  { nombre: "María V.",     hora: "07:30", plan: "Premium", tipo: "entrada", avatar: "M" },
]

const colasoporte = [
  { nombre: "Pedro R.",  asunto: "No puedo acceder con mi QR",     prioridad: "alta",   tiempo: "5 min" },
  { nombre: "Lucía M.",  asunto: "Quiero cambiar mi plan",         prioridad: "media",  tiempo: "12 min" },
  { nombre: "Diego T.",  asunto: "Cobro duplicado en mi cuenta",   prioridad: "alta",   tiempo: "18 min" },
  { nombre: "Carla S.",  asunto: "Consulta sobre horarios",        prioridad: "baja",   tiempo: "25 min" },
]

const pagosPendientes = [
  { nombre: "Roberto L.",  monto: 89,  plan: "Silver",  vence: "Hoy",       avatar: "R" },
  { nombre: "Sandra P.",   monto: 129, plan: "Gold",    vence: "Mañana",    avatar: "S" },
  { nombre: "Marcos D.",   monto: 49,  plan: "Basic",   vence: "En 3 días", avatar: "M" },
]

const PRIORIDAD_CONFIG = {
  alta:  { bg: "bg-[#EF4444]/15", text: "text-[#EF4444]",  dot: "bg-[#EF4444]"  },
  media: { bg: "bg-[#FF6B35]/15", text: "text-[#FF6B35]",  dot: "bg-[#FF6B35]"  },
  baja:  { bg: "bg-[#3B82F6]/15", text: "text-[#3B82F6]",  dot: "bg-[#3B82F6]"  },
}

export default function RecepcionistaDashboard() {
  const { user } = useAuth()
  const [registroOpen, setRegistroOpen] = useState(false)
  const [pagoNombre, setPagoNombre] = useState("")
  const [qrPulse, setQrPulse] = useState(true)

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Panel de Recepción</p>
            <h1 className="text-white font-black text-2xl">{user?.nombre} 🗂️</h1>
            <p className="text-neutral-600 text-sm mt-0.5">
              {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })} ·
              <span className="text-[#3B82F6] ml-1">Turno mañana</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-neutral-600 text-xs">Accesos hoy</p>
              <p className="text-white font-black text-3xl">42</p>
            </div>
            <div className="w-px h-10 bg-white/8" />
            <div className="text-right">
              <p className="text-neutral-600 text-xs">En el gym ahora</p>
              <p className="text-[#3B82F6] font-black text-3xl">18</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Registros hoy",    value: "3",    icon: "➕", color: "#00D084" },
          { label: "Pagos procesados", value: "7",    icon: "💰", color: "#3B82F6" },
          { label: "Cola soporte",     value: "4",    icon: "💬", color: "#FF6B35" },
          { label: "Alertas QR",       value: "1",    icon: "🚪", color: "#EF4444" },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-4"
          >
            <span className="text-xl">{kpi.icon}</span>
            <p className="text-white font-black text-2xl mt-2" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="text-neutral-500 text-xs mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Registro acceso en vivo — QR scanner simulation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold text-sm">🚪 Reg. Acceso</p>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", qrPulse ? "bg-[#00D084] animate-pulse" : "bg-neutral-600")} />
              <span className="text-[10px] text-neutral-500">Live</span>
            </div>
          </div>

          {/* QR scanner area */}
          <div
            className="aspect-square max-w-[160px] mx-auto rounded-2xl border-2 border-dashed border-white/15 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#3B82F6]/40 transition-all group"
            onClick={() => setQrPulse(!qrPulse)}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">📱</span>
            <p className="text-neutral-600 text-[10px] text-center px-3">Escanear QR del miembro</p>
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-neutral-500 text-[10px] uppercase tracking-wider">Últimos accesos</p>
            {accesosRecientes.slice(0, 3).map((a) => (
              <div key={`${a.nombre}-${a.hora}`} className="flex items-center gap-2.5">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                  a.tipo === "entrada" ? "bg-[#00D084]/20 text-[#00D084]" : "bg-[#EF4444]/20 text-[#EF4444]"
                )}>
                  {a.tipo === "entrada" ? "↓" : "↑"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{a.nombre}</p>
                  <p className="text-neutral-600 text-[9px]">{a.plan}</p>
                </div>
                <span className="text-neutral-600 text-[10px] shrink-0">{a.hora}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Registro de miembro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold text-sm">➕ Registrar Miembro</p>
            <button
              onClick={() => setRegistroOpen(!registroOpen)}
              className="text-xs bg-[#3B82F6]/15 text-[#3B82F6] font-bold px-2.5 py-1 rounded-lg hover:bg-[#3B82F6]/25 transition-colors"
            >
              {registroOpen ? "Cerrar" : "Nuevo"}
            </button>
          </div>

          <AnimatePresence>
            {registroOpen ? (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
                onSubmit={(e) => e.preventDefault()}
              >
                {[
                  { label: "Nombre completo", placeholder: "Juan García" },
                  { label: "DNI / Documento",  placeholder: "12345678" },
                  { label: "Email",            placeholder: "juan@email.com" },
                  { label: "Teléfono",         placeholder: "+51 9XXXXXXXX" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <input
                      type="text"
                      placeholder={f.placeholder}
                      className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-white text-xs placeholder-neutral-700 focus:outline-none focus:border-[#3B82F6]/50 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1">Plan</label>
                  <select className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-white text-xs focus:outline-none focus:border-[#3B82F6]/50 transition-all">
                    <option value="basic"   className="bg-[#070D18]">Basic — $49/mes</option>
                    <option value="silver"  className="bg-[#070D18]">Silver — $89/mes</option>
                    <option value="gold"    className="bg-[#070D18]">Gold — $129/mes</option>
                    <option value="premium" className="bg-[#070D18]">Premium — $189/mes</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full h-9 bg-[#3B82F6] text-white font-bold text-sm rounded-lg hover:bg-[#2563EB] transition-colors"
                >
                  Crear cuenta →
                </button>
              </motion.form>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-32 gap-2 text-center"
              >
                <span className="text-3xl">👤</span>
                <p className="text-neutral-600 text-xs">Haz clic en "Nuevo" para<br />registrar un miembro</p>
                <p className="text-neutral-700 text-[10px]">3 registros hoy</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Procesar pago */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-white font-semibold text-sm mb-4">💰 Procesar Pago</p>
          <div className="mb-4">
            <label className="text-[10px] text-neutral-500 uppercase tracking-wider block mb-1.5">Buscar miembro</label>
            <input
              type="text"
              value={pagoNombre}
              onChange={(e) => setPagoNombre(e.target.value)}
              placeholder="Nombre o DNI..."
              className="w-full h-9 bg-white/5 border border-white/10 rounded-lg px-3 text-white text-xs placeholder-neutral-700 focus:outline-none focus:border-[#3B82F6]/50 transition-all"
            />
          </div>
          <p className="text-neutral-500 text-[10px] uppercase tracking-wider mb-2">Pagos pendientes</p>
          <div className="space-y-2">
            {pagosPendientes.map((p) => (
              <div key={p.nombre} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/3 border border-white/6 hover:border-white/12 transition-all">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3B82F6]/30 to-[#3B82F6]/10 flex items-center justify-center text-[10px] font-black text-[#3B82F6] shrink-0">
                  {p.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{p.nombre}</p>
                  <p className="text-neutral-600 text-[9px]">{p.plan} · vence {p.vence}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-xs">${p.monto}</p>
                  <button className="text-[#3B82F6] text-[9px] hover:underline">Cobrar</button>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 h-9 bg-[#3B82F6] text-white font-bold text-sm rounded-lg hover:bg-[#2563EB] transition-colors">
            Registrar pago manual
          </button>
        </motion.div>
      </div>

      {/* Accesos recientes (full width) + Cola soporte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Accesos recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">🚪 Accesos Recientes</p>
            <button className="text-[#3B82F6] text-xs font-semibold hover:underline">Ver historial →</button>
          </div>
          <div className="space-y-2.5">
            {accesosRecientes.map((a, i) => (
              <motion.div
                key={`${a.nombre}-${a.hora}-full`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                  a.tipo === "entrada" ? "bg-[#00D084]/15 text-[#00D084]" : "bg-[#EF4444]/15 text-[#EF4444]"
                )}>
                  {a.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium">{a.nombre}</p>
                  <p className="text-neutral-600 text-[10px]">{a.plan}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-neutral-400 text-xs">{a.hora}</p>
                  <p className={cn("text-[10px] font-semibold", a.tipo === "entrada" ? "text-[#00D084]" : "text-[#EF4444]")}>
                    {a.tipo === "entrada" ? "↓ Entrada" : "↑ Salida"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Cola de soporte */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">💬 Cola de Soporte</p>
            <span className="text-xs bg-[#FF6B35]/15 text-[#FF6B35] px-2 py-0.5 rounded-full font-bold">
              {colasoporte.length} en espera
            </span>
          </div>
          <div className="space-y-3">
            {colasoporte.map((t, i) => {
              const cfg = PRIORIDAD_CONFIG[t.prioridad as keyof typeof PRIORIDAD_CONFIG]
              return (
                <motion.div
                  key={t.nombre}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.07 }}
                  className="rounded-xl px-4 py-3 bg-white/3 border border-white/6 hover:border-white/12 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", cfg.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-white text-sm font-medium">{t.nombre}</p>
                        <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", cfg.bg, cfg.text)}>
                          {t.prioridad}
                        </span>
                      </div>
                      <p className="text-neutral-500 text-xs">{t.asunto}</p>
                      <p className="text-neutral-700 text-[10px] mt-1">Esperando {t.tiempo}</p>
                    </div>
                    <button className="shrink-0 text-xs bg-[#3B82F6]/15 text-[#3B82F6] font-bold px-2.5 py-1 rounded-lg hover:bg-[#3B82F6]/25 transition-colors">
                      Atender
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
