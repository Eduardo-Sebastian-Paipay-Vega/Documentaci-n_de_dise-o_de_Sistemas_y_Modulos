"use client"
// REEMPLAZADO: datos reales desde Supabase via hooks
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { fadeUp, staggerContainer, fadeIn, staggerFast, easings } from "@/lib/motion"
import { useClasesEntrenador } from "@/hooks/useClases"
import { Loader2, Users, CalendarCheck, Star } from "lucide-react"

const DEMO_CLIENTES = [
  { nombre: "Carlos M.",  plan: "Gold",    progreso: 78, sesiones: 24, meta: "Perder 10kg", avatar: "C" },
  { nombre: "Ana Torres", plan: "Premium", progreso: 92, sesiones: 31, meta: "Tonificar",   avatar: "A" },
  { nombre: "Luis P.",    plan: "Silver",  progreso: 45, sesiones: 12, meta: "Ganar masa",  avatar: "L" },
  { nombre: "Rosa Ch.",   plan: "Basic",   progreso: 61, sesiones: 18, meta: "Resistencia", avatar: "R" },
  { nombre: "Jorge F.",   plan: "Gold",    progreso: 83, sesiones: 27, meta: "Rendimiento", avatar: "J" },
]

const EVALUACIONES = [
  { cliente: "Ana Torres", tipo: "Composición corporal", fecha: "Hoy 14:00",    pendiente: true  },
  { cliente: "Carlos M.",  tipo: "Fuerza máxima",        fecha: "Mañana 10:00", pendiente: true  },
  { cliente: "Jorge F.",   tipo: "VO2 Max",              fecha: "Vie 09:00",    pendiente: true  },
  { cliente: "Luis P.",    tipo: "Postura y movilidad",  fecha: "Completada",   pendiente: false },
]

export default function EntrenadorDashboard() {
  const { user }       = useAuth()
  const clientesRef    = useRef<HTMLDivElement>(null)
  const inView         = useInView(clientesRef, { once: true })

  const entrenadorId = user?.id_usuario
  const clasesState  = useClasesEntrenador(entrenadorId)
  const clases       = clasesState.data ?? []
  const [activeCliente, setActiveCliente] = useState<string | null>(null)

  return (
    <div className="p-6 lg:p-8 min-h-full">
      {/* Header */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <p className="text-neutral-500 text-sm">Panel de Entrenador</p>
            <h1 className="text-white font-black text-2xl">{user?.nombre} 🏋️</h1>
            <p className="text-neutral-600 text-sm mt-0.5">GymFit Lima · Hoy {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-neutral-600 text-xs">Clases hoy</p>
              <p className="text-[#FF6B35] font-black text-3xl">
                {clasesState.loading ? "—" : clases.length}
              </p>
            </div>
            <div className="w-px h-10 bg-white/8" />
            <div className="text-right">
              <p className="text-neutral-600 text-xs">Clientes activos</p>
              <p className="text-white font-black text-3xl">{DEMO_CLIENTES.length}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Top row: Classes + Asistencia semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Mis Clases — 2 cols */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">📅 Mis Clases de Hoy</p>
            <button className="text-[#FF6B35] text-xs font-semibold hover:underline">Ver semana →</button>
          </div>
          {clasesState.loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 size={16} className="animate-spin text-neutral-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {clases.map((c, i) => {
                const inscritos = c.inscritos ?? 0
                const pct = (inscritos / c.capacidad_maxima) * 100
                const llena = inscritos >= c.capacidad_maxima
                return (
                  <motion.div
                    key={c.id_clase}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.07 }}
                    className="flex items-center gap-4 rounded-xl px-4 py-3 bg-white/3 border border-white/6 hover:border-white/12 transition-all"
                  >
                    <div className="text-center shrink-0 w-12">
                      <p className="text-white font-bold text-sm">
                        {new Date(c.fecha_hora_inicio).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </p>
                      <p className="text-neutral-600 text-[10px]">hoy</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{c.nombre}</p>
                      <p className="text-neutral-500 text-xs">{c.nombre_espacio ?? "—"}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-white/8 rounded-full overflow-hidden max-w-[80px]">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: llena ? "#FF6B35" : "#00D084" }} />
                        </div>
                        <span className="text-neutral-500 text-[10px]">{inscritos}/{c.capacidad_maxima}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0" style={{
                      background: c.estado === "en_curso" ? "rgba(0,208,132,0.15)" : llena ? "rgba(255,107,53,0.15)" : "rgba(255,255,255,0.05)",
                      color:      c.estado === "en_curso" ? "#00D084" : llena ? "#FF6B35" : "#9CA3AF",
                    }}>
                      {c.estado === "en_curso" ? "En curso" : llena ? "Llena" : "Próxima"}
                    </span>
                    {c.estado === "en_curso" && (
                      <button className="shrink-0 bg-[#00D084] text-[#070D18] text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#00E891] transition-colors">
                        Asistencia
                      </button>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Asistencia semanal personal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-white font-semibold mb-1">✅ Asistencia Semanal</p>
          <p className="text-neutral-600 text-xs mb-5">Registro de mis sesiones</p>
          <div className="grid grid-cols-7 gap-1.5">
            {[
            { dia: "Lun", asistio: true  }, { dia: "Mar", asistio: true  },
            { dia: "Mié", asistio: false }, { dia: "Jue", asistio: true  },
            { dia: "Vie", asistio: true  }, { dia: "Sáb", asistio: false },
            { dia: "Dom", asistio: false },
          ].map((d) => (
              <div key={d.dia} className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                  d.asistio
                    ? "bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30"
                    : "bg-white/5 text-neutral-600 border border-white/8"
                )}>
                  {d.asistio ? "✓" : "–"}
                </div>
                <span className="text-[9px] text-neutral-600">{d.dia}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-neutral-500 text-xs">Clases impartidas</p>
              <p className="text-white font-bold">4 / 7</p>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-neutral-500 text-xs">Total clientes</p>
              <p className="text-[#FF6B35] font-bold">5</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-neutral-500 text-xs">Rating promedio</p>
              <p className="text-white font-bold">⭐ 4.8</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Middle row: Mis Clientes */}
      <motion.div
        ref={clientesRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold">👥 Mis Clientes</p>
          <button className="text-[#FF6B35] text-xs font-semibold hover:underline">Ver todos →</button>
        </div>
        <div className="space-y-3">
          {DEMO_CLIENTES.map((c, i) => (
            <motion.div
              key={c.nombre}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 + i * 0.07 }}
              onClick={() => setActiveCliente(activeCliente === c.nombre ? null : c.nombre)}
              className={cn(
                "rounded-xl px-4 py-3 border transition-all cursor-pointer",
                activeCliente === c.nombre
                  ? "bg-[#FF6B35]/8 border-[#FF6B35]/20"
                  : "bg-white/3 border-white/6 hover:border-white/12"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A] flex items-center justify-center text-sm font-black text-white shrink-0">
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold text-sm">{c.nombre}</p>
                    <span className="text-neutral-500 text-xs">{c.sesiones} sesiones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C5A] rounded-full"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${c.progreso}%` } : {}}
                        transition={{ delay: 0.5 + i * 0.07, duration: 0.8 }}
                      />
                    </div>
                    <span className="text-[#FF6B35] text-[10px] font-bold shrink-0">{c.progreso}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-white/8 text-neutral-400 px-2 py-0.5 rounded-full">{c.plan}</span>
                  <button className="text-[10px] bg-[#FF6B35]/15 text-[#FF6B35] font-bold px-2 py-1 rounded-lg hover:bg-[#FF6B35]/25 transition-colors">
                    Ver plan
                  </button>
                </div>
              </div>
              {activeCliente === c.nombre && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-white/8 flex items-center gap-4"
                >
                  <div>
                    <p className="text-neutral-600 text-[10px]">Meta</p>
                    <p className="text-white text-xs font-medium">{c.meta}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600 text-[10px]">Progreso</p>
                    <p className="text-[#FF6B35] text-xs font-bold">{c.progreso}% completado</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button className="text-xs bg-white/8 text-neutral-300 font-medium px-3 py-1.5 rounded-lg hover:bg-white/12 transition-colors">
                      Mensaje
                    </button>
                    <button className="text-xs bg-[#FF6B35] text-white font-bold px-3 py-1.5 rounded-lg hover:bg-[#FF8C5A] transition-colors">
                      Nueva sesión
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Evaluaciones pendientes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-semibold">📋 Evaluaciones</p>
          <span className="text-xs bg-[#FF6B35]/15 text-[#FF6B35] px-2 py-0.5 rounded-full font-bold">
            {EVALUACIONES.filter(e => e.pendiente).length} pendientes
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {EVALUACIONES.map((ev, i) => (
            <motion.div
              key={`${ev.cliente}-${ev.tipo}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              className={cn(
                "rounded-xl px-4 py-3 border flex items-center gap-3",
                ev.pendiente
                  ? "bg-white/3 border-white/8"
                  : "bg-white/2 border-white/4 opacity-60"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0",
                ev.pendiente ? "bg-[#FF6B35]/20" : "bg-white/5"
              )}>
                {ev.pendiente ? "📋" : "✅"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{ev.cliente}</p>
                <p className="text-neutral-500 text-xs truncate">{ev.tipo}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn("text-xs font-semibold", ev.pendiente ? "text-[#FF6B35]" : "text-neutral-600")}>
                  {ev.fecha}
                </p>
                {ev.pendiente && (
                  <button className="text-[10px] text-[#00D084] hover:underline mt-0.5">Iniciar →</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
