"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { staggerContainer, fadeUp } from "@/lib/motion"

// RF-019: Sistema de tickets de soporte
// En prod: INSERT INTO tickets (id_usuario, id_gimnasio, titulo, descripcion, prioridad, estado)
// SELECT * FROM tickets WHERE id_gimnasio = get_user_gym() ORDER BY fecha_creacion DESC

type Ticket = {
  id: string
  titulo: string
  usuario: string
  categoria: "equipo" | "sistema" | "membresia" | "otro"
  prioridad: "alta" | "media" | "baja"
  estado: "abierto" | "en_proceso" | "resuelto"
  hora: string
  descripcion: string
}

const TICKETS_INICIALES: Ticket[] = [
  { id:"t001", titulo:"Torniquete no responde a QR",  usuario:"Carlos Díaz",    categoria:"equipo",    prioridad:"alta",  estado:"en_proceso", hora:"09:30", descripcion:"El torniquete principal no valida los QR desde las 9am. Varios miembros bloqueados." },
  { id:"t002", titulo:"Error al renovar membresía",  usuario:"Rosa Chávez",    categoria:"membresia", prioridad:"media", estado:"abierto",    hora:"08:45", descripcion:"Al intentar renovar el plan Gold aparece error 422 en el sistema." },
  { id:"t003", titulo:"Pesa falta de mantenimiento", usuario:"Luis Torres",    categoria:"equipo",    prioridad:"baja",  estado:"resuelto",   hora:"Ayer",  descripcion:"La pesa de 20kg tiene el recubrimiento dañado. Riesgo menor." },
  { id:"t004", titulo:"App no carga para miembro",   usuario:"Ana Flores",     categoria:"sistema",   prioridad:"alta",  estado:"abierto",    hora:"08:12", descripcion:"Miembro reporta que la app mobile no carga desde ayer. Probado en iOS y Android." },
  { id:"t005", titulo:"Solicitud de cambio de plan", usuario:"Pablo Fuentes",  categoria:"membresia", prioridad:"baja",  estado:"resuelto",   hora:"Ayer",  descripcion:"Cambio de Silver a Gold Premium completado." },
]

const CATEGORIA_COLOR: Record<string, string> = {
  equipo: "#F59E0B", sistema: "#3B82F6", membresia: "#00D084", otro: "#8B5CF6"
}
const PRIORIDAD_COLOR: Record<string, string> = {
  alta: "#EF4444", media: "#F59E0B", baja: "#6B7280"
}

export default function SoportePage() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS_INICIALES)
  const [filtro, setFiltro] = useState<"todos"|"abierto"|"en_proceso"|"resuelto">("todos")
  const [detalle, setDetalle] = useState<Ticket | null>(null)
  const [crearModal, setCrearModal] = useState(false)
  const [form, setForm] = useState({ titulo:"", usuario:"", categoria:"sistema" as Ticket["categoria"], prioridad:"media" as Ticket["prioridad"], descripcion:"" })

  const filtrados = filtro === "todos" ? tickets : tickets.filter(t => t.estado === filtro)

  function crearTicket(e: React.FormEvent) {
    e.preventDefault()
    const nuevo: Ticket = {
      id: `t${Date.now()}`,
      ...form,
      estado: "abierto",
      hora: new Date().toLocaleTimeString("es-PE", { hour:"2-digit", minute:"2-digit" }),
    }
    setTickets(prev => [nuevo, ...prev])
    setCrearModal(false)
    setForm({ titulo:"", usuario:"", categoria:"sistema", prioridad:"media", descripcion:"" })
  }

  function cambiarEstado(id: string, nuevoEstado: Ticket["estado"]) {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t))
    setDetalle(null)
  }

  const abiertos   = tickets.filter(t => t.estado === "abierto").length
  const enproceso  = tickets.filter(t => t.estado === "en_proceso").length
  const resueltos  = tickets.filter(t => t.estado === "resuelto").length

  return (
    <div className="p-6 lg:p-8 min-h-full">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeUp} className="flex items-center justify-between">
          <div>
            <h1 className="text-white font-black text-2xl">Soporte</h1>
            <p className="text-neutral-500 text-sm mt-0.5">RF-019 · Tickets de incidencias y soporte</p>
          </div>
          <motion.button
            variants={fadeUp}
            onClick={() => setCrearModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] font-bold text-sm hover:bg-[#00E891] transition-colors">
            + Nuevo Ticket
          </motion.button>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label:"Abiertos",    valor:abiertos,  color:"#EF4444" },
            { label:"En proceso",  valor:enproceso, color:"#F59E0B" },
            { label:"Resueltos",   valor:resueltos, color:"#00D084" },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3">
              <p className="font-black text-xl" style={{ color: s.color }}>{s.valor}</p>
              <p className="text-neutral-500 text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="flex gap-2 mt-4">
          {(["todos","abierto","en_proceso","resuelto"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
                filtro === f ? "bg-[#00D084] text-[#070D18]" : "glass-card text-neutral-400 hover:text-white"
              )}>
              {f === "todos" ? "Todos" : f === "en_proceso" ? "En proceso" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>
      </motion.div>

      <div className="space-y-3">
        {filtrados.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}
            className="glass-card rounded-2xl p-4 cursor-pointer hover:border-white/15 transition-all"
            onClick={() => setDetalle(t)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background:`${PRIORIDAD_COLOR[t.prioridad]}20`, color:PRIORIDAD_COLOR[t.prioridad] }}>
                    {t.prioridad}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize"
                    style={{ background:`${CATEGORIA_COLOR[t.categoria]}20`, color:CATEGORIA_COLOR[t.categoria] }}>
                    {t.categoria}
                  </span>
                </div>
                <p className="text-white font-semibold text-sm">{t.titulo}</p>
                <p className="text-neutral-500 text-xs mt-0.5">{t.usuario} · {t.hora}</p>
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                t.estado === "abierto"     ? "bg-[#EF4444]/15 text-[#EF4444]" :
                t.estado === "en_proceso"  ? "bg-[#F59E0B]/15 text-[#F59E0B]" :
                "bg-[#00D084]/15 text-[#00D084]"
              )}>
                {t.estado === "en_proceso" ? "En proceso" : t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
              </span>
            </div>
            <p className="text-neutral-600 text-xs mt-2 line-clamp-1">{t.descripcion}</p>
          </motion.div>
        ))}
      </div>

      {/* Modal detalle ticket */}
      <AnimatePresence>
        {detalle && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setDetalle(null)}
          >
            <motion.div
              initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background:`${PRIORIDAD_COLOR[detalle.prioridad]}20`, color:PRIORIDAD_COLOR[detalle.prioridad] }}>
                      {detalle.prioridad}
                    </span>
                    <span className="text-neutral-500 text-xs">{detalle.id}</span>
                  </div>
                  <h3 className="text-white font-bold text-lg">{detalle.titulo}</h3>
                  <p className="text-neutral-500 text-sm">{detalle.usuario} · {detalle.hora}</p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-4 mb-4">
                <p className="text-neutral-400 text-sm">{detalle.descripcion}</p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setDetalle(null)}
                  className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">
                  Cerrar
                </button>
                {detalle.estado === "abierto" && (
                  <button onClick={() => cambiarEstado(detalle.id, "en_proceso")}
                    className="flex-1 py-2.5 rounded-xl bg-[#F59E0B] text-[#070D18] text-sm font-bold hover:opacity-90 transition-opacity">
                    En proceso
                  </button>
                )}
                {detalle.estado !== "resuelto" && (
                  <button onClick={() => cambiarEstado(detalle.id, "resuelto")}
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                    ✓ Resolver
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal crear ticket */}
      <AnimatePresence>
        {crearModal && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
            onClick={() => setCrearModal(false)}
          >
            <motion.div
              initial={{ scale:0.95, y:16 }} animate={{ scale:1, y:0 }} exit={{ scale:0.95, y:16 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0D1526] border border-white/10 rounded-2xl p-6 w-full max-w-md"
            >
              <h3 className="text-white font-bold text-lg mb-4">Nuevo Ticket</h3>
              <form onSubmit={crearTicket} className="space-y-3">
                {[
                  { label:"Título", key:"titulo", type:"text", placeholder:"Describe el problema brevemente" },
                  { label:"Usuario / Miembro afectado", key:"usuario", type:"text", placeholder:"Nombre del miembro" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">{f.label}</label>
                    <input
                      type={f.type} required
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors"
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Categoría</label>
                    <select value={form.categoria} onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value as Ticket["categoria"] }))}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none">
                      <option value="equipo" className="bg-[#0D1526]">Equipo</option>
                      <option value="sistema" className="bg-[#0D1526]">Sistema</option>
                      <option value="membresia" className="bg-[#0D1526]">Membresía</option>
                      <option value="otro" className="bg-[#0D1526]">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Prioridad</label>
                    <select value={form.prioridad} onChange={e => setForm(prev => ({ ...prev, prioridad: e.target.value as Ticket["prioridad"] }))}
                      className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-white text-sm focus:outline-none">
                      <option value="alta" className="bg-[#0D1526]">Alta</option>
                      <option value="media" className="bg-[#0D1526]">Media</option>
                      <option value="baja" className="bg-[#0D1526]">Baja</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 uppercase tracking-wider block mb-1">Descripción</label>
                  <textarea
                    required rows={3}
                    value={form.descripcion}
                    onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                    placeholder="Describe el problema con detalle..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/40 transition-colors resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setCrearModal(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-neutral-300 text-sm font-semibold">Cancelar</button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#00D084] text-[#070D18] text-sm font-bold hover:bg-[#00E891] transition-colors">
                    Crear Ticket
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
