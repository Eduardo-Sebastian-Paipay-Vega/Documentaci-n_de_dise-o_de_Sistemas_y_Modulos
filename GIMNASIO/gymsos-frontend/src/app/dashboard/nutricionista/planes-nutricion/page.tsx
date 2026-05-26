"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { fadeIn, staggerContainer, staggerFast } from "@/lib/motion"
import { Plus, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const PLANES = [
  {
    nombre: "Hipocalórico — Pérdida de peso",
    tipo: "hipocalorico",
    calorias: 1600,
    proteinas: 120,
    carbohidratos: 160,
    grasas: 45,
    pacientes: 14,
    descripcion: "Déficit calórico moderado preservando masa muscular. Ideal para IMC > 27.",
    comidas: [
      { momento: "Desayuno",       kcal: 320, ejemplo: "Avena con plátano + té verde" },
      { momento: "Media mañana",   kcal: 150, ejemplo: "Manzana + 10 almendras" },
      { momento: "Almuerzo",       kcal: 480, ejemplo: "Pechuga a la plancha + quinoa + ensalada" },
      { momento: "Merienda",       kcal: 200, ejemplo: "Yogur griego natural + fresas" },
      { momento: "Cena",           kcal: 350, ejemplo: "Pescado al vapor + verduras salteadas" },
      { momento: "Antes de dormir",kcal: 100, ejemplo: "Infusión de manzanilla" },
    ],
  },
  {
    nombre: "Hiperproteico — Ganancia muscular",
    tipo: "hiperproteico",
    calorias: 2800,
    proteinas: 210,
    carbohidratos: 280,
    grasas: 70,
    pacientes: 9,
    descripcion: "Alto en proteínas para síntesis muscular. Combinar con programa de fuerza.",
    comidas: [
      { momento: "Desayuno",       kcal: 600, ejemplo: "Tortilla 4 huevos + avena + plátano" },
      { momento: "Media mañana",   kcal: 400, ejemplo: "Batido proteico + frutos secos" },
      { momento: "Almuerzo",       kcal: 700, ejemplo: "Pollo 250g + arroz integral + brócoli" },
      { momento: "Post-entreno",   kcal: 350, ejemplo: "Shake proteico + creatina" },
      { momento: "Cena",           kcal: 600, ejemplo: "Carne magra + papa + ensalada" },
      { momento: "Antes de dormir",kcal: 150, ejemplo: "Caseína o queso cottage" },
    ],
  },
  {
    nombre: "Equilibrado — Mantenimiento",
    tipo: "equilibrado",
    calorias: 2200,
    proteinas: 140,
    carbohidratos: 250,
    grasas: 65,
    pacientes: 11,
    descripcion: "Balance entre macronutrientes para mantener peso y energía óptima.",
    comidas: [
      { momento: "Desayuno",     kcal: 450, ejemplo: "Pan integral + palta + huevo + jugo" },
      { momento: "Media mañana", kcal: 200, ejemplo: "Fruta de temporada + yogur" },
      { momento: "Almuerzo",     kcal: 650, ejemplo: "Menú equilibrado con proteína, carbohidrato y vegetal" },
      { momento: "Merienda",     kcal: 250, ejemplo: "Granola + leche" },
      { momento: "Cena",         kcal: 500, ejemplo: "Sopa + segundo ligero" },
      { momento: "Extra",        kcal: 150, ejemplo: "Snack saludable si hay actividad física" },
    ],
  },
  {
    nombre: "Deportivo — Rendimiento atlético",
    tipo: "deportivo",
    calorias: 3200,
    proteinas: 180,
    carbohidratos: 380,
    grasas: 80,
    pacientes: 4,
    descripcion: "Optimizado para rendimiento en competencias. Periodización nutricional.",
    comidas: [
      { momento: "Pre-entreno AM",  kcal: 500, ejemplo: "Avena + miel + plátano + electrolitos" },
      { momento: "Durante",         kcal: 200, ejemplo: "Gel energético + agua" },
      { momento: "Post-entreno",    kcal: 600, ejemplo: "Batido recuperador + carbohidratos simples" },
      { momento: "Almuerzo",        kcal: 800, ejemplo: "Pasta integral + pollo + aceite de oliva" },
      { momento: "Merienda",        kcal: 400, ejemplo: "Sándwich de pavo + fruta" },
      { momento: "Cena",            kcal: 700, ejemplo: "Proteína animal + carbohidrato complejo + omega-3" },
    ],
  },
]

const TIPO_COLOR: Record<string, string> = {
  hipocalorico: "#3B82F6",
  hiperproteico: "#F97316",
  equilibrado:   "#10B981",
  deportivo:     "#8B5CF6",
}

export default function NutricionistaPlanesPage() {
  const [expandido, setExpandido] = useState<string | null>(null)
  const [modalNuevo, setModalNuevo] = useState(false)

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1000px]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeIn} className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Planes Nutricionales
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {PLANES.length} planes activos · {PLANES.reduce((s, p) => s + p.pacientes, 0)} pacientes asignados
            </p>
          </div>
          <motion.button
            variants={fadeIn}
            onClick={() => setModalNuevo(true)}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: "#10B981", color: "#09090B" }}
          >
            <Plus size={14} />
            Nuevo plan
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Planes */}
      <motion.div
        className="space-y-3"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {PLANES.map((plan) => {
          const color  = TIPO_COLOR[plan.tipo]
          const abierto = expandido === plan.tipo
          return (
            <motion.div
              key={plan.tipo}
              variants={fadeIn}
              className="surface rounded-xl overflow-hidden"
            >
              {/* Header del plan */}
              <button
                className="w-full px-5 py-4 flex items-center gap-4 text-left transition-colors"
                onClick={() => setExpandido(abierto ? null : plan.tipo)}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-overlay)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {plan.nombre}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {plan.descripcion}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {plan.calorias} kcal
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      {plan.pacientes} pacientes
                    </p>
                  </div>
                  {abierto ? <ChevronUp size={14} style={{ color: "var(--text-tertiary)" }} /> : <ChevronDown size={14} style={{ color: "var(--text-tertiary)" }} />}
                </div>
              </button>

              {/* Detalle expandible */}
              {abierto && (
                <div style={{ borderTop: "1px solid var(--border-faint)" }}>
                  {/* Macros */}
                  <div className="px-5 py-4 grid grid-cols-4 gap-3" style={{ borderBottom: "1px solid var(--border-faint)" }}>
                    {[
                      { label: "Calorías",      valor: `${plan.calorias}`, unidad: "kcal" },
                      { label: "Proteínas",      valor: `${plan.proteinas}`, unidad: "g" },
                      { label: "Carbohidratos",  valor: `${plan.carbohidratos}`, unidad: "g" },
                      { label: "Grasas",         valor: `${plan.grasas}`, unidad: "g" },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className="text-lg font-black tabular-nums" style={{ color }}>
                          {m.valor}<span className="text-xs font-normal" style={{ color: "var(--text-tertiary)" }}>{m.unidad}</span>
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>{m.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Distribución de comidas */}
                  <div className="px-5 py-4">
                    <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-secondary)" }}>
                      Distribución de comidas
                    </p>
                    <div className="space-y-2">
                      {plan.comidas.map((c) => (
                        <div key={c.momento} className="flex items-center gap-3">
                          <span className="text-[11px] font-medium w-28 shrink-0" style={{ color: "var(--text-tertiary)" }}>
                            {c.momento}
                          </span>
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(c.kcal / plan.calorias) * 100}%`, background: color }}
                            />
                          </div>
                          <span className="text-[11px] tabular-nums w-14 text-right shrink-0" style={{ color: "var(--text-secondary)" }}>
                            {c.kcal} kcal
                          </span>
                          <span className="text-[10px] flex-1 truncate hidden md:block" style={{ color: "var(--text-disabled)" }}>
                            {c.ejemplo}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Modal nuevo plan (placeholder) */}
      {modalNuevo && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setModalNuevo(false)}
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-2xl"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
          >
            <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Nuevo plan nutricional</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-tertiary)" }}>
              Funcionalidad de creación de planes disponible próximamente con integración a base de datos.
            </p>
            <button
              onClick={() => setModalNuevo(false)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: "#10B981", color: "#09090B" }}
            >
              Entendido
            </button>
          </motion.div>
        </div>
      )}
    </div>
  )
}
