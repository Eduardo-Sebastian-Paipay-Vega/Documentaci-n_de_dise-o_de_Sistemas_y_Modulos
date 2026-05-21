"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { staggerContainer, fadeUp } from "@/lib/motion"

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-2xl">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp}>
          <h1 className="text-white font-black text-2xl">Configuración</h1>
          <p className="text-neutral-500 text-sm mt-0.5">Ajustes del gimnasio y cuenta</p>
        </motion.div>
      </motion.div>

      {/* Secciones */}
      <div className="space-y-4">
        {/* Datos del Gimnasio */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="glass-card rounded-2xl p-6">
          <p className="text-white font-semibold mb-4">🏋️ Datos del Gimnasio</p>
          <form onSubmit={handleSave} className="space-y-3">
            {[
              { label:"Nombre del gimnasio", value:"GymFit Lima",    type:"text" },
              { label:"Dirección",           value:"Av. Javier Prado Este 1234, San Isidro", type:"text" },
              { label:"Ciudad",              value:"Lima",            type:"text" },
              { label:"Teléfono",            value:"+51 01 234 5678", type:"tel" },
              { label:"Email de contacto",   value:"info@gymfit.pe",  type:"email" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <input type={f.type} defaultValue={f.value}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none focus:border-[#00D084]/40 transition-colors" />
              </div>
            ))}
            <button type="submit"
              className="mt-2 w-full py-2.5 rounded-xl bg-[#00D084] text-[#070D18] font-bold text-sm hover:bg-[#00E891] transition-colors">
              {saved ? "✓ Guardado" : "Guardar Cambios"}
            </button>
          </form>
        </motion.div>

        {/* Horarios */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="glass-card rounded-2xl p-6">
          <p className="text-white font-semibold mb-4">🕐 Horarios de Atención</p>
          <div className="space-y-3">
            {[
              { dia:"Lunes a Viernes", hora:"06:00 - 22:00" },
              { dia:"Sábados",         hora:"07:00 - 20:00" },
              { dia:"Domingos",        hora:"08:00 - 14:00" },
            ].map(h => (
              <div key={h.dia} className="flex items-center justify-between">
                <span className="text-neutral-400 text-sm">{h.dia}</span>
                <span className="text-white font-mono text-sm">{h.hora}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Plan de suscripción */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white font-semibold">💎 Plan GYMsos</p>
            <span className="bg-[#00D084]/15 text-[#00D084] text-xs font-bold px-3 py-1 rounded-full">Grande</span>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ["Miembros incluidos", "Hasta 5,000"],
              ["Sucursales",         "Hasta 5"],
              ["Soporte",            "Prioritario 24/7"],
              ["IA Churn Prediction","✓ Incluido"],
              ["Gamificación",       "✓ Incluido"],
              ["Marketplace",        "✓ Incluido"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-neutral-500">{k}</span>
                <span className="text-white">{v}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notificaciones */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="glass-card rounded-2xl p-6">
          <p className="text-white font-semibold mb-4">🔔 Notificaciones Automáticas</p>
          <div className="space-y-3">
            {[
              { label:"Alerta de churn (score > 70%)",    active:true  },
              { label:"Reporte diario por email",          active:true  },
              { label:"Vencimiento de membresías (7 días)",active:true  },
              { label:"Morosidad (5+ días sin pagar)",     active:false },
              { label:"Alertas de capacidad (>90% lleno)", active:true  },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between">
                <span className="text-neutral-300 text-sm">{n.label}</span>
                <div className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${n.active ? "bg-[#00D084]" : "bg-white/15"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${n.active ? "left-5" : "left-0.5"}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
