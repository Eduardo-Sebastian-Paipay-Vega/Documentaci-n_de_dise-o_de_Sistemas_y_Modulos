"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { fadeIn, staggerContainer } from "@/lib/motion"
import { Search, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const PACIENTES = [
  { nombre: "Carlos Mamani Quispe",   edad: 34, genero: "M", objetivo: "Pérdida de peso",    imc: 27.4, plan: "Hipocalórico",    estado: "activo",  siguiente: "Hoy 09:00",    tendencia: "baja" },
  { nombre: "Ana Flores Condori",     edad: 28, genero: "F", objetivo: "Mantenimiento",       imc: 22.1, plan: "Equilibrado",     estado: "activo",  siguiente: "Hoy 10:30",    tendencia: "estable" },
  { nombre: "Luis Ccapa Huanca",      edad: 42, genero: "M", objetivo: "Pérdida de peso",    imc: 30.2, plan: "Hipocalórico",    estado: "activo",  siguiente: "Hoy 12:00",    tendencia: "baja" },
  { nombre: "María Quispe Apaza",     edad: 25, genero: "F", objetivo: "Ganancia muscular",   imc: 24.8, plan: "Hiperproteico",   estado: "activo",  siguiente: "Hoy 15:00",    tendencia: "sube" },
  { nombre: "Jorge Huamán Torres",    edad: 31, genero: "M", objetivo: "Rendimiento atlético",imc: 23.5, plan: "Deportivo",       estado: "activo",  siguiente: "Hoy 16:30",    tendencia: "sube" },
  { nombre: "Roberto Apaza Limachi",  edad: 38, genero: "M", objetivo: "Pérdida de peso",    imc: 32.1, plan: "Sin plan",        estado: "alerta",  siguiente: "Sin agendar",  tendencia: "sube" },
  { nombre: "Lucía Mamani Flores",    edad: 29, genero: "F", objetivo: "Mantenimiento",       imc: 23.9, plan: "Equilibrado",     estado: "por-vencer", siguiente: "Mañana",   tendencia: "estable" },
  { nombre: "Rosa Chipana Ticona",    edad: 45, genero: "F", objetivo: "Salud integral",      imc: 26.7, plan: "Mediterráneo",    estado: "inactivo", siguiente: "Sin agendar", tendencia: "estable" },
]

const OBJETIVO_COLOR: Record<string, string> = {
  "Pérdida de peso":     "#3B82F6",
  "Mantenimiento":       "var(--accent)",
  "Ganancia muscular":   "#F97316",
  "Rendimiento atlético":"#8B5CF6",
  "Salud integral":      "#10B981",
}

const ESTADO_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  activo:      { label: "Activo",      color: "#10B981",        bg: "rgba(16,185,129,0.08)" },
  alerta:      { label: "Sin plan",    color: "var(--red)",     bg: "rgba(239,68,68,0.08)"  },
  "por-vencer":{ label: "Por vencer",  color: "#F97316",        bg: "rgba(249,115,22,0.08)" },
  inactivo:    { label: "Inactivo",    color: "var(--text-tertiary)", bg: "var(--bg-overlay)" },
}

function imcCategoria(imc: number): { label: string; color: string } {
  if (imc < 18.5) return { label: "Bajo peso",   color: "#3B82F6" }
  if (imc < 25)   return { label: "Normal",       color: "#10B981" }
  if (imc < 30)   return { label: "Sobrepeso",    color: "#F97316" }
  return               { label: "Obesidad",       color: "var(--red)" }
}

export default function NutricionistaMiembrosPage() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")

  const filtrados = PACIENTES.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado
    return matchBusqueda && matchEstado
  })

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1200px]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Mis Pacientes
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {PACIENTES.length} pacientes registrados · {PACIENTES.filter(p => p.estado === "activo").length} activos
          </p>
        </motion.div>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Buscar paciente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-base pl-8 w-full"
          />
        </div>
        <div className="flex gap-1.5">
          {["todos", "activo", "alerta", "por-vencer", "inactivo"].map(f => (
            <button
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize",
                filtroEstado === f
                  ? "text-[#09090B]"
                  : ""
              )}
              style={filtroEstado === f
                ? { background: "#10B981", color: "#09090B" }
                : { background: "var(--bg-overlay)", color: "var(--text-tertiary)" }
              }
            >
              {f === "todos" ? "Todos" : ESTADO_STYLE[f]?.label ?? f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="surface rounded-xl overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-faint)" }}>
              {["Paciente", "Objetivo", "IMC", "Plan actual", "Próxima consulta", "Estado"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p, i) => {
              const imc = imcCategoria(p.imc)
              const est = ESTADO_STYLE[p.estado]
              const objColor = OBJETIVO_COLOR[p.objetivo] ?? "var(--text-secondary)"
              return (
                <tr
                  key={p.nombre}
                  className="transition-colors"
                  style={{ borderBottom: i < filtrados.length - 1 ? "1px solid var(--border-faint)" : undefined }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-overlay)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}
                      >
                        {p.nombre[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.nombre}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                          {p.edad} años · {p.genero === "M" ? "Masculino" : "Femenino"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium" style={{ color: objColor }}>{p.objetivo}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{p.imc}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{ background: `${imc.color}12`, color: imc.color }}>
                        {imc.label}
                      </span>
                      {p.tendencia === "baja"   && <TrendingDown size={12} style={{ color: "#10B981" }} />}
                      {p.tendencia === "sube"   && <TrendingUp   size={12} style={{ color: "var(--red)" }} />}
                      {p.tendencia === "estable"&& <Minus        size={12} style={{ color: "var(--text-disabled)" }} />}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs" style={{ color: p.plan === "Sin plan" ? "var(--red)" : "var(--text-secondary)" }}>
                      {p.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "var(--text-tertiary)" }}>{p.siguiente}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: est.bg, color: est.color }}
                    >
                      {est.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No se encontraron pacientes.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
