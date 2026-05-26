"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/components/providers/auth-provider"
import { fadeIn, staggerContainer, staggerFast } from "@/lib/motion"
import { CreditCard, CalendarDays, QrCode, TrendingUp, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const QUICK_ACCESS = [
  { icon: QrCode,        label: "Acceso QR",     desc: "Mostrar código en torniquete", href: "/dashboard/cliente/qr",         color: "#22C55E" },
  { icon: CalendarDays,  label: "Mis Clases",    desc: "Reservar o ver clases",        href: "/dashboard/cliente/clases",     color: "#22C55E" },
  { icon: CreditCard,    label: "Mi Membresía",  desc: "Estado y renovación",          href: "/dashboard/cliente/membresia",  color: "#22C55E" },
  { icon: TrendingUp,    label: "Mi Progreso",   desc: "Estadísticas y logros",        href: "/dashboard/cliente/progreso",   color: "#22C55E" },
]

const PROXIMAS_CLASES = [
  { nombre: "Spinning Avanzado",   instructor: "Ana Torres",    hora: "07:00", dia: "Hoy",     plazas: 3 },
  { nombre: "Yoga & Meditación",   instructor: "Ana Torres",    hora: "09:30", dia: "Hoy",     plazas: 8 },
  { nombre: "CrossFit Funcional",  instructor: "Marco Díaz",    hora: "18:00", dia: "Hoy",     plazas: 2 },
  { nombre: "Pilates Core",        instructor: "Sofía Ramos",   hora: "07:00", dia: "Mañana",  plazas: 5 },
]

export default function ClienteDashboard() {
  const { user } = useAuth()
  const router   = useRouter()

  const mem            = user?.membresia
  const diasRestantes  = mem ? Math.ceil((new Date(mem.fecha_vencimiento).getTime() - Date.now()) / 86400000) : 0
  const urgente        = diasRestantes > 0 && diasRestantes <= 7

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1000px]">

      {/* ─── Header ─── */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-8">
        <motion.div variants={fadeIn}>
          <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>
            {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Hola, {user?.nombre?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {user?.nombre_gimnasio ?? "GymFit Lima"} · {mem?.plan ?? "Sin plan activo"}
          </p>
        </motion.div>
      </motion.div>

      {/* ─── Membresía activa ─── */}
      {mem && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            "rounded-2xl p-5 mb-6 flex items-center justify-between gap-4",
            urgente
              ? "border border-red-500/20"
              : "border border-emerald-500/15"
          )}
          style={{
            background: urgente
              ? "rgba(239,68,68,0.05)"
              : "rgba(34,197,94,0.05)",
          }}
        >
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: urgente ? "var(--red)" : "#22C55E" }}>
              {urgente ? `⚠ Membresía vence en ${diasRestantes} días` : "✓ Membresía activa"}
            </p>
            <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{mem.plan}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Vence: {new Date(mem.fecha_vencimiento).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {urgente && (
            <button
              onClick={() => router.push("/dashboard/cliente/membresia")}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: "#22C55E", color: "#09090B" }}
            >
              Renovar ahora
            </button>
          )}
        </motion.div>
      )}

      {/* ─── Accesos rápidos ─── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {QUICK_ACCESS.map((a) => {
          const Icon = a.icon
          return (
            <motion.button
              key={a.label}
              variants={fadeIn}
              onClick={() => router.push(a.href)}
              whileTap={{ scale: 0.97 }}
              className="surface-interactive rounded-xl p-4 flex flex-col items-start gap-2 text-left"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.1)" }}
              >
                <Icon size={15} style={{ color: "#22C55E" }} />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{a.label}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{a.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* ─── Próximas clases ─── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="surface rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Clases disponibles hoy</p>
          <button
            onClick={() => router.push("/dashboard/cliente/clases")}
            className="text-xs flex items-center gap-1"
            style={{ color: "#22C55E" }}
          >
            Ver todas <ChevronRight size={12} />
          </button>
        </div>
        <div className="space-y-1.5">
          {PROXIMAS_CLASES.map((c, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{ background: "var(--bg-overlay)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}
              >
                {c.dia === "Hoy" ? "H" : "M"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{c.nombre}</p>
                <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>{c.instructor}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-mono" style={{ color: "var(--text-tertiary)" }}>{c.hora}</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: c.plazas <= 3 ? "rgba(239,68,68,0.08)" : "var(--accent-dim)",
                    color: c.plazas <= 3 ? "var(--red)" : "var(--accent)",
                  }}
                >
                  {c.plazas} plazas
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
