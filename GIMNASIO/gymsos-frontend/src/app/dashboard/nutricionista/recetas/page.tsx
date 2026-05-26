"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { fadeIn, staggerContainer, staggerFast } from "@/lib/motion"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const RECETAS = [
  {
    nombre: "Bowl de quinoa con pollo y vegetales",
    categoria: "almuerzo",
    objetivo: "hiperproteico",
    kcal: 520,
    proteinas: 42,
    carbos: 48,
    grasas: 14,
    tiempo: 25,
    ingredientes: ["200g pechuga de pollo", "80g quinoa cocida", "Espinacas", "Tomate cherry", "Palta ¼", "Limón, sal, pimienta"],
    preparacion: "Cocinar el pollo a la plancha con sal y pimienta. Cocer la quinoa. Montar el bowl con todos los ingredientes y aliñar con limón.",
  },
  {
    nombre: "Porridge de avena proteico",
    categoria: "desayuno",
    objetivo: "hiperproteico",
    kcal: 380,
    proteinas: 28,
    carbos: 52,
    grasas: 8,
    tiempo: 10,
    ingredientes: ["80g avena en hojuelas", "1 scoop proteína vainilla", "200ml leche descremada", "1 plátano", "Canela"],
    preparacion: "Cocer la avena con leche. Retirar del fuego, añadir proteína y mezclar bien. Servir con plátano en rodajas y canela.",
  },
  {
    nombre: "Ensalada mediterránea de atún",
    categoria: "cena",
    objetivo: "equilibrado",
    kcal: 310,
    proteinas: 31,
    carbos: 18,
    grasas: 12,
    tiempo: 10,
    ingredientes: ["1 lata atún en agua", "Lechuga", "Tomate", "Pepino", "Aceituna 10 unid", "Aceite de oliva 1 cda", "Limón"],
    preparacion: "Mezclar todos los vegetales. Agregar el atún escurrido. Aliñar con aceite de oliva y limón.",
  },
  {
    nombre: "Batido verde detox",
    categoria: "merienda",
    objetivo: "hipocalorico",
    kcal: 145,
    proteinas: 5,
    carbos: 28,
    grasas: 2,
    tiempo: 5,
    ingredientes: ["1 manzana verde", "½ pepino", "Espinacas 30g", "Jengibre 1cm", "Agua de coco 200ml", "Hielo"],
    preparacion: "Licuar todos los ingredientes hasta obtener consistencia homogénea. Servir inmediatamente.",
  },
  {
    nombre: "Tortilla de claras con vegetales",
    categoria: "desayuno",
    objetivo: "hipocalorico",
    kcal: 210,
    proteinas: 24,
    carbos: 8,
    grasas: 9,
    tiempo: 12,
    ingredientes: ["5 claras de huevo", "1 huevo entero", "Pimiento rojo", "Champiñones", "Espinacas", "Sal, pimienta, cúrcuma"],
    preparacion: "Saltear los vegetales en sartén antiadherente. Añadir las claras y el huevo batidos. Cocinar a fuego medio hasta cuajar.",
  },
  {
    nombre: "Pasta integral con pesto de albahaca",
    categoria: "almuerzo",
    objetivo: "deportivo",
    kcal: 580,
    proteinas: 22,
    carbos: 82,
    grasas: 18,
    tiempo: 20,
    ingredientes: ["120g pasta integral", "Albahaca fresca 30g", "Piñones 20g", "Ajo 1 diente", "Aceite de oliva 2 cdas", "Parmesano 15g"],
    preparacion: "Cocer la pasta al dente. Procesar albahaca, piñones, ajo y aceite hasta pesto. Mezclar con la pasta caliente y añadir parmesano.",
  },
]

const OBJETIVO_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  hiperproteico: { label: "Alto en proteína", color: "#F97316",  bg: "rgba(249,115,22,0.08)"  },
  hipocalorico:  { label: "Bajo en calorías",  color: "#3B82F6",  bg: "rgba(59,130,246,0.08)"  },
  equilibrado:   { label: "Equilibrado",        color: "#10B981",  bg: "rgba(16,185,129,0.08)"  },
  deportivo:     { label: "Deportivo",           color: "#8B5CF6",  bg: "rgba(139,92,246,0.08)"  },
}

const CATEGORIA_COLOR: Record<string, string> = {
  desayuno: "#F59E0B",
  almuerzo: "#10B981",
  cena:     "#6366F1",
  merienda: "#EC4899",
}

export default function NutricionistaRecetasPage() {
  const [busqueda, setBusqueda] = useState("")
  const [filtroObjetivo, setFiltroObjetivo] = useState("todos")
  const [expandida, setExpandida] = useState<string | null>(null)

  const filtradas = RECETAS.filter(r => {
    const matchBusq = r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const matchObj  = filtroObjetivo === "todos" || r.objetivo === filtroObjetivo
    return matchBusq && matchObj
  })

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1000px]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Biblioteca de Recetas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {RECETAS.length} recetas optimizadas por objetivo nutricional
          </p>
        </motion.div>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={fadeIn} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            placeholder="Buscar receta..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="input-base pl-8 w-full"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["todos", "hiperproteico", "hipocalorico", "equilibrado", "deportivo"].map(f => (
            <button
              key={f}
              onClick={() => setFiltroObjetivo(f)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={filtroObjetivo === f
                ? { background: "#10B981", color: "#09090B" }
                : { background: "var(--bg-overlay)", color: "var(--text-tertiary)" }
              }
            >
              {f === "todos" ? "Todas" : OBJETIVO_STYLE[f]?.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Lista de recetas */}
      <motion.div
        className="space-y-3"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        {filtradas.map((receta) => {
          const obj = OBJETIVO_STYLE[receta.objetivo]
          const catColor = CATEGORIA_COLOR[receta.categoria] ?? "var(--text-tertiary)"
          const abierta = expandida === receta.nombre
          return (
            <motion.div
              key={receta.nombre}
              variants={fadeIn}
              className="surface rounded-xl overflow-hidden"
            >
              <button
                className="w-full px-5 py-4 flex items-center gap-4 text-left transition-colors"
                onClick={() => setExpandida(abierta ? null : receta.nombre)}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-overlay)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold capitalize" style={{ color: catColor }}>
                      {receta.categoria}
                    </span>
                    <span className="w-1 h-1 rounded-full" style={{ background: "var(--border-subtle)" }} />
                    <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      {receta.tiempo} min
                    </span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{receta.nombre}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full hidden sm:block"
                    style={{ background: obj.bg, color: obj.color }}
                  >
                    {obj.label}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
                      {receta.kcal} kcal
                    </p>
                    <p className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      P: {receta.proteinas}g · C: {receta.carbos}g · G: {receta.grasas}g
                    </p>
                  </div>
                </div>
              </button>

              {abierta && (
                <div
                  className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-4"
                  style={{ borderTop: "1px solid var(--border-faint)" }}
                >
                  <div className="pt-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Ingredientes</p>
                    <ul className="space-y-1">
                      {receta.ingredientes.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: "#10B981" }} />
                          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4">
                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>Preparación</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {receta.preparacion}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
        {filtradas.length === 0 && (
          <div className="surface rounded-xl py-12 text-center">
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>No se encontraron recetas.</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
