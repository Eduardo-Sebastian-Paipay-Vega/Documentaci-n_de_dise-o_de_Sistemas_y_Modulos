"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-011: Reportes automáticos — diario, semanal, mensual, morosidad, KPIs
// En producción: SELECT ... FROM pagos, membresias, accesos, asistencias
// con filtro de id_gimnasio = get_user_gym()

const INGRESOS_MENSUAL = [
  { mes:"Jun", valor:28400 }, { mes:"Jul", valor:31200 }, { mes:"Ago", valor:29800 },
  { mes:"Sep", valor:34500 }, { mes:"Oct", valor:33100 }, { mes:"Nov", valor:38900 },
  { mes:"Dic", valor:36200 }, { mes:"Ene", valor:41800 }, { mes:"Feb", valor:44200 },
  { mes:"Mar", valor:39700 }, { mes:"Abr", valor:46300 }, { mes:"May", valor:51400 },
]

const ASISTENCIA_SEMANAL = [
  { dia:"Lun", valor:178 }, { dia:"Mar", valor:145 }, { dia:"Mié", valor:192 },
  { dia:"Jue", valor:163 }, { dia:"Vie", valor:201 }, { dia:"Sáb", valor:134 },
  { dia:"Dom", valor:89  },
]

const KPIs = [
  { label:"Ingresos Mayo",       valor:"S/ 51,400",  cambio:"+11%",  dir:"up",   icon:"💰" },
  { label:"Miembros Activos",    valor:"1,247",       cambio:"+4.3%", dir:"up",   icon:"👥" },
  { label:"Tasa de Churn",       valor:"2.1%",        cambio:"-0.5%", dir:"down", icon:"📉" },
  { label:"Clases por Semana",   valor:"47",          cambio:"+3",    dir:"up",   icon:"📅" },
  { label:"NPS Score",           valor:"72",          cambio:"+4pts", dir:"up",   icon:"⭐" },
  { label:"Tasa Ocupación",      valor:"78%",         cambio:"+5%",   dir:"up",   icon:"📊" },
]

const MOROSOS = [
  { nombre:"Carmen Torres",  plan:"Gold Premium", dias:21, monto:"S/ 149.90" },
  { nombre:"Roberto Sánchez",plan:"Silver",       dias:15, monto:"S/ 109.90" },
  { nombre:"Diana Cruz",     plan:"Basic",        dias:8,  monto:"S/ 79.90"  },
]

type TipoReporte = "ingresos" | "asistencia" | "kpis" | "morosidad"

export default function ReportesPage() {
  const [tipo, setTipo] = useState<TipoReporte>("ingresos")
  const [periodo, setPeriodo] = useState("mensual")
  const chartRef = useRef<HTMLDivElement>(null)
  const inView   = useInView(chartRef, { once: true })

  const maxIngreso = Math.max(...INGRESOS_MENSUAL.map(d => d.valor))
  const maxAsist   = Math.max(...ASISTENCIA_SEMANAL.map(d => d.valor))

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Reportes y Análisis</h1>
            <p className="text-neutral-500 text-sm mt-0.5">Datos en tiempo real · GymFit Lima</p>
          </div>
          <button className="bg-[#00D084] text-[#070D18] font-bold text-sm px-4 py-2 rounded-xl hover:bg-[#00E891] transition-colors flex items-center gap-2">
            ↓ Exportar PDF
          </button>
        </motion.div>

        {/* Selector de tipo */}
        <motion.div variants={fadeUp} className="flex gap-2 mt-5 flex-wrap">
          {[
            { v:"ingresos"   as TipoReporte, label:"💰 Ingresos" },
            { v:"asistencia" as TipoReporte, label:"📅 Asistencia" },
            { v:"kpis"       as TipoReporte, label:"📊 KPIs" },
            { v:"morosidad"  as TipoReporte, label:"⚠️ Morosidad" },
          ].map(({ v, label }) => (
            <button
              key={v}
              onClick={() => setTipo(v)}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                tipo === v ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
              )}
            >
              {label}
            </button>
          ))}

          <div className="ml-auto flex gap-2">
            {["diario","semanal","mensual"].map(p => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  periodo === p ? "bg-white/15 text-white" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Gráfico de Ingresos */}
      {tipo === "ingresos" && (
        <motion.div
          key="ingresos"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
          ref={chartRef}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-white font-semibold">Ingresos Mensuales</p>
            <span className="text-[#00D084] text-xs font-bold bg-[#00D084]/10 px-2.5 py-1 rounded-full">
              ↑ 81% YTD
            </span>
          </div>
          <p className="text-neutral-600 text-xs mb-6">Últimos 12 meses en soles (PEN)</p>

          <div className="flex items-end gap-2 h-52" ref={chartRef}>
            {INGRESOS_MENSUAL.map((d, i) => (
              <div key={d.mes} className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
                <div className="relative w-full flex flex-col items-center">
                  {/* Tooltip */}
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1F2937] text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-10">
                    S/ {d.valor.toLocaleString()}
                  </div>
                  <motion.div
                    className={cn("w-full rounded-t-md", d.mes === "May" ? "bg-[#00D084]" : "bg-white/15 group-hover:bg-white/25")}
                    initial={{ height: 0 }}
                    animate={inView ? { height: `${(d.valor / maxIngreso) * 200}px` } : { height: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    style={{ alignSelf: "flex-end" }}
                  />
                </div>
                <span className="text-[9px] text-neutral-600">{d.mes}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
            {[
              { label:"Total YTD",       valor:"S/ 425,500" },
              { label:"Promedio mensual",valor:"S/ 35,458"  },
              { label:"Mejor mes",       valor:"Mayo (S/ 51,400)" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-neutral-500 text-xs">{s.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{s.valor}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Gráfico de Asistencia */}
      {tipo === "asistencia" && (
        <motion.div
          key="asistencia"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <p className="text-white font-semibold mb-1">Asistencia por Día de la Semana</p>
          <p className="text-neutral-600 text-xs mb-6">Promedio de visitas al gimnasio</p>

          <div className="flex items-end gap-3 h-44">
            {ASISTENCIA_SEMANAL.map((d, i) => (
              <div key={d.dia} className="flex flex-col items-center gap-1 flex-1">
                <p className="text-white text-xs font-bold">{d.valor}</p>
                <motion.div
                  className={cn("w-full rounded-t-lg", d.dia === "Vie" ? "bg-[#00D084]" : "bg-white/20")}
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.valor / maxAsist) * 160}px` }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ alignSelf: "flex-end" }}
                />
                <span className="text-[10px] text-neutral-600">{d.dia}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/5 pt-5">
            {[
              { label:"Total semana",   valor:"1,102 visitas" },
              { label:"Día pico",       valor:"Viernes (201)" },
              { label:"Día más bajo",   valor:"Domingo (89)"  },
            ].map(s => (
              <div key={s.label}>
                <p className="text-neutral-500 text-xs">{s.label}</p>
                <p className="text-white font-bold text-sm mt-0.5">{s.valor}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* KPIs Grid */}
      {tipo === "kpis" && (
        <motion.div
          key="kpis"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {KPIs.map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{kpi.icon}</span>
                  <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full",
                    kpi.dir === "up" ? "bg-[#00D084]/15 text-[#00D084]" : "bg-[#EF4444]/15 text-[#EF4444]"
                  )}>
                    {kpi.cambio}
                  </span>
                </div>
                <p className="text-white font-black text-2xl">{kpi.valor}</p>
                <p className="text-neutral-500 text-xs mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Morosidad */}
      {tipo === "morosidad" && (
        <motion.div
          key="morosidad"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl overflow-hidden"
        >
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <p className="text-white font-semibold">Miembros con Pago Vencido</p>
            <span className="text-xs bg-[#EF4444]/15 text-[#EF4444] font-bold px-2.5 py-1 rounded-full">
              {MOROSOS.length} pendientes
            </span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                {["Miembro","Plan","Días vencido","Monto","Acciones"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOROSOS.map((m, i) => (
                <motion.tr
                  key={m.nombre}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border-b border-white/4"
                >
                  <td className="px-5 py-3.5 text-white font-medium text-sm">{m.nombre}</td>
                  <td className="px-5 py-3.5 text-neutral-400 text-sm">{m.plan}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("text-sm font-bold",
                      m.dias >= 15 ? "text-[#EF4444]" : "text-[#F59E0B]"
                    )}>
                      {m.dias} días
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-white text-sm font-mono">{m.monto}</td>
                  <td className="px-5 py-3.5">
                    <button className="text-xs bg-[#00D084]/15 text-[#00D084] font-bold px-3 py-1.5 rounded-lg hover:bg-[#00D084]/25 transition-all">
                      Enviar Recordatorio
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  )
}
