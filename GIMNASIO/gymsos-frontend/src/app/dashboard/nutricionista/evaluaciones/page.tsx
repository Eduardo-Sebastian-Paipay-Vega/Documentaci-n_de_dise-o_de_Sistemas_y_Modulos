"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { fadeIn, staggerContainer, staggerFast } from "@/lib/motion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const EVALUACIONES = [
  {
    paciente: "Carlos Mamani Quispe",
    fecha: "2026-05-26",
    tipo: "control",
    peso: 82.5,
    talla: 173,
    imc: 27.6,
    grasaCorp: 24.2,
    masaMuscular: 38.1,
    cintura: 92,
    cadera: 104,
    objetivo: "Pérdida de peso",
    nota: "Reducción de 1.2kg desde última evaluación. Continuar plan hipocalórico.",
    estado: "completado",
  },
  {
    paciente: "Ana Flores Condori",
    fecha: "2026-05-26",
    tipo: "control",
    peso: 58.0,
    talla: 162,
    imc: 22.1,
    grasaCorp: 21.5,
    masaMuscular: 28.4,
    cintura: 70,
    cadera: 94,
    objetivo: "Mantenimiento",
    nota: "Composición corporal estable. Excelente adherencia al plan.",
    estado: "completado",
  },
  {
    paciente: "Luis Ccapa Huanca",
    fecha: "2026-05-26",
    tipo: "inicial",
    peso: 95.3,
    talla: 172,
    imc: 32.2,
    grasaCorp: 31.8,
    masaMuscular: 35.6,
    cintura: 106,
    cadera: 112,
    objetivo: "Pérdida de peso",
    nota: "Evaluación inicial. Riesgo metabólico moderado. Iniciar plan hipocalórico gradual.",
    estado: "en-curso",
  },
  {
    paciente: "María Quispe Apaza",
    fecha: "2026-05-26",
    tipo: "control",
    peso: 63.2,
    talla: 159,
    imc: 25.0,
    grasaCorp: 26.1,
    masaMuscular: 27.9,
    cintura: 78,
    cadera: 98,
    objetivo: "Ganancia muscular",
    nota: "Aumento de 0.8kg de masa muscular. Ajustar proteínas a 2.2g/kg.",
    estado: "pendiente",
  },
  {
    paciente: "Jorge Huamán Torres",
    fecha: "2026-05-26",
    tipo: "rendimiento",
    peso: 74.1,
    talla: 177,
    imc: 23.7,
    grasaCorp: 13.4,
    masaMuscular: 43.2,
    cintura: 80,
    cadera: 96,
    objetivo: "Rendimiento atlético",
    nota: "Composición ideal para su deporte. Revisar periodización antes de competencia.",
    estado: "pendiente",
  },
]

const TIPO_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  inicial:     { label: "Inicial",     color: "#3B82F6",  bg: "rgba(59,130,246,0.08)"   },
  control:     { label: "Control",     color: "#10B981",  bg: "rgba(16,185,129,0.08)"   },
  rendimiento: { label: "Rendimiento", color: "#8B5CF6",  bg: "rgba(139,92,246,0.08)"   },
}

const ESTADO_STYLE: Record<string, { label: string; color: string }> = {
  completado: { label: "Completado", color: "#10B981" },
  "en-curso": { label: "En curso",   color: "#F97316" },
  pendiente:  { label: "Pendiente",  color: "var(--text-tertiary)" },
}

function imcColor(imc: number): string {
  if (imc < 18.5) return "#3B82F6"
  if (imc < 25)   return "#10B981"
  if (imc < 30)   return "#F97316"
  return "var(--red)"
}

export default function NutricionistaEvaluacionesPage() {
  const [seleccionada, setSeleccionada] = useState<(typeof EVALUACIONES)[0] | null>(null)

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1200px]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Evaluaciones
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Registro antropométrico y composición corporal
            </p>
          </div>
          <motion.button
            variants={fadeIn}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#10B981", color: "#09090B" }}
          >
            <Plus size={14} />
            Nueva evaluación
          </motion.button>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Lista de evaluaciones */}
        <motion.div
          className="lg:col-span-1 space-y-2"
          variants={staggerFast}
          initial="hidden"
          animate="visible"
        >
          {EVALUACIONES.map((ev) => {
            const tipo = TIPO_STYLE[ev.tipo]
            const est  = ESTADO_STYLE[ev.estado]
            const isSelected = seleccionada?.paciente === ev.paciente
            return (
              <motion.button
                key={ev.paciente}
                variants={fadeIn}
                onClick={() => setSeleccionada(isSelected ? null : ev)}
                className={cn("w-full text-left px-4 py-3 rounded-xl transition-all")}
                style={{
                  background: isSelected ? "rgba(16,185,129,0.08)" : "var(--bg-surface)",
                  border: `1px solid ${isSelected ? "rgba(16,185,129,0.3)" : "var(--border-faint)"}`,
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium text-left" style={{ color: "var(--text-primary)" }}>
                    {ev.paciente}
                  </p>
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: tipo.bg, color: tipo.color }}
                  >
                    {tipo.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    IMC <span style={{ color: imcColor(ev.imc) }}>{ev.imc}</span> · {ev.peso}kg
                  </p>
                  <span className="text-[10px] font-medium" style={{ color: est.color }}>
                    {est.label}
                  </span>
                </div>
              </motion.button>
            )
          })}
        </motion.div>

        {/* Detalle de evaluación */}
        <div className="lg:col-span-2">
          {seleccionada ? (
            <motion.div
              key={seleccionada.paciente}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="surface rounded-xl p-5 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    {seleccionada.paciente}
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(seleccionada.fecha).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                    {seleccionada.objetivo}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: TIPO_STYLE[seleccionada.tipo].bg, color: TIPO_STYLE[seleccionada.tipo].color }}
                >
                  Evaluación {TIPO_STYLE[seleccionada.tipo].label}
                </span>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Peso",          valor: `${seleccionada.peso}`, unidad: "kg",   color: "var(--text-primary)" },
                  { label: "IMC",           valor: `${seleccionada.imc}`,  unidad: "",      color: imcColor(seleccionada.imc) },
                  { label: "Grasa corporal",valor: `${seleccionada.grasaCorp}`, unidad: "%", color: "#F97316" },
                ].map(m => (
                  <div key={m.label} className="rounded-lg p-3 text-center" style={{ background: "var(--bg-overlay)" }}>
                    <p className="text-2xl font-black tabular-nums" style={{ color: m.color }}>
                      {m.valor}<span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>{m.unidad}</span>
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-disabled)" }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Métricas secundarias */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Masa muscular", valor: `${seleccionada.masaMuscular} kg` },
                  { label: "Talla",          valor: `${seleccionada.talla} cm` },
                  { label: "Cintura",        valor: `${seleccionada.cintura} cm` },
                  { label: "Cadera",         valor: `${seleccionada.cadera} cm` },
                ].map(m => (
                  <div key={m.label} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "var(--bg-overlay)" }}>
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{m.label}</span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-primary)" }}>{m.valor}</span>
                  </div>
                ))}
              </div>

              {/* Nota clínica */}
              <div className="rounded-lg p-3" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-[11px] font-semibold mb-1" style={{ color: "#10B981" }}>Nota clínica</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{seleccionada.nota}</p>
              </div>
            </motion.div>
          ) : (
            <div className="surface rounded-xl p-8 flex flex-col items-center justify-center h-full min-h-[300px]">
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
                Selecciona una evaluación para ver el detalle
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
