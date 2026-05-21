"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-018: Gestión de Promociones y Ofertas
// Tabla: promociones (id_promocion, codigo, tipo_descuento, valor_descuento,
//        fecha_inicio, fecha_fin, limite_uso, usos_realizados, estado)

const PROMOCIONES = [
  { id:"p001", codigo:"GYMSOS25",   tipo:"porcentaje", valor:25, descripcion:"25% descuento nuevos miembros", inicio:"2026-05-01", fin:"2026-05-31", limite:100, usos:67,  estado:"activa"   },
  { id:"p002", codigo:"VERANO50",   tipo:"monto_fijo", valor:50, descripcion:"S/50 off en plan Gold Premium", inicio:"2026-05-15", fin:"2026-06-15", limite:50,  usos:23,  estado:"activa"   },
  { id:"p003", codigo:"AMIGOS10",   tipo:"porcentaje", valor:10, descripcion:"10% por referidos",             inicio:"2026-04-01", fin:"2026-04-30", limite:200, usos:200, estado:"finalizada" },
  { id:"p004", codigo:"EMPRESA30",  tipo:"porcentaje", valor:30, descripcion:"30% empresas corporativas",    inicio:"2026-06-01", fin:"2026-06-30", limite:30,  usos:0,   estado:"activa"   },
  { id:"p005", codigo:"BLACKFRI",   tipo:"monto_fijo", valor:80, descripcion:"Viernes negro — plan anual",   inicio:"2025-11-28", fin:"2025-11-30", limite:75,  usos:75,  estado:"finalizada" },
]

export default function PromocionesPage() {
  const [modalNueva, setModalNueva] = useState(false)
  const [filtro, setFiltro] = useState<"todas"|"activa"|"finalizada">("todas")

  const filtradas = PROMOCIONES.filter(p => filtro === "todas" || p.estado === filtro)

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Promociones y Descuentos</h1>
            <p className="text-neutral-500 text-sm mt-0.5">RF-018 · Gestión de códigos y ofertas</p>
          </div>
          <button
            onClick={() => setModalNueva(true)}
            className="bg-[#00D084] text-[#070D18] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#00E891] transition-colors"
          >
            + Nueva Promoción
          </button>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label:"Activas", valor:PROMOCIONES.filter(p=>p.estado==="activa").length,    color:"#00D084" },
            { label:"Usos total", valor:PROMOCIONES.reduce((a,p)=>a+p.usos,0),            color:"#F59E0B" },
            { label:"Finalizadas",valor:PROMOCIONES.filter(p=>p.estado==="finalizada").length, color:"#6B7280" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <p className="font-black text-2xl" style={{ color: s.color }}>{s.valor}</p>
              <p className="text-neutral-500 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {(["todas","activa","finalizada"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
              filtro === f ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Lista de promociones */}
      <div className="space-y-3">
        {filtradas.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <code className="text-[#00D084] font-black text-base bg-[#00D084]/10 px-3 py-1 rounded-lg tracking-wider">
                    {p.codigo}
                  </code>
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full",
                    p.estado === "activa" ? "bg-[#00D084]/15 text-[#00D084]" : "bg-neutral-700 text-neutral-400"
                  )}>
                    {p.estado}
                  </span>
                  <span className="text-xs glass-card px-2 py-0.5 rounded-full text-neutral-400">
                    {p.tipo === "porcentaje" ? `${p.valor}% off` : `S/ ${p.valor} off`}
                  </span>
                </div>
                <p className="text-white text-sm">{p.descripcion}</p>
                <p className="text-neutral-600 text-xs mt-1">
                  {p.inicio} → {p.fin}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-white font-bold">{p.usos}/{p.limite}</p>
                <p className="text-neutral-600 text-xs">usos</p>
                <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden mt-1.5 ml-auto">
                  <div
                    className="h-full rounded-full bg-[#00D084]"
                    style={{ width: `${(p.usos/p.limite)*100}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button className="text-xs px-2.5 py-1 glass-card rounded-lg text-neutral-300 hover:text-white transition-all">
                  Editar
                </button>
                {p.estado === "activa" && (
                  <button className="text-xs px-2.5 py-1 bg-[#EF4444]/15 text-[#EF4444] rounded-lg hover:bg-[#EF4444]/25 transition-all">
                    Pausar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Nueva Promoción */}
      <AnimatePresence>
        {modalNueva && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setModalNueva(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Nueva Promoción</h3>
                <button onClick={() => setModalNueva(false)} className="text-neutral-500 hover:text-white text-xl">×</button>
              </div>
              <form className="space-y-3" onSubmit={e => { e.preventDefault(); setModalNueva(false) }}>
                {[
                  { label:"Código promocional", placeholder:"Ej: SUMMER26", type:"text" },
                  { label:"Descripción",         placeholder:"Descripción breve",  type:"text" },
                  { label:"Valor del descuento", placeholder:"25",                 type:"number" },
                  { label:"Límite de usos",      placeholder:"100",                type:"number" },
                  { label:"Fecha inicio",        placeholder:"",                   type:"date" },
                  { label:"Fecha fin",           placeholder:"",                   type:"date" },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Tipo descuento</label>
                  <select className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40">
                    <option value="porcentaje" className="bg-[#0D1526]">Porcentaje (%)</option>
                    <option value="monto_fijo" className="bg-[#0D1526]">Monto fijo (S/)</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setModalNueva(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">Crear</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
