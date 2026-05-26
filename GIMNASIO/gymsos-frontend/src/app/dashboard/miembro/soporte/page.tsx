"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { fadeIn, staggerContainer } from "@/lib/motion"
import { MessageCircle, CreditCard, QrCode, HelpCircle, CheckCircle2 } from "lucide-react"

const TEMAS = [
  { id: "membresia",  icon: CreditCard,     label: "Problema con membresía",    desc: "Pagos, renovación o cambio de plan" },
  { id: "acceso",     icon: QrCode,         label: "Problema con acceso QR",    desc: "El QR no funciona o tuve problema en torniquete" },
  { id: "clases",     icon: MessageCircle,  label: "Problema con clases",       desc: "Reserva, cancelación o asistencia" },
  { id: "otro",       icon: HelpCircle,     label: "Otra consulta",             desc: "Preguntas generales o sugerencias" },
]

const FAQS = [
  { pregunta: "¿Cómo renuevo mi membresía?",       respuesta: "Ve a 'Mi Membresía' y haz clic en 'Renovar Membresía'. Puedes pagar con tarjeta o en recepción." },
  { pregunta: "¿Qué hago si mi QR no funciona?",    respuesta: "Asegúrate de que tu membresía esté activa. Si sigue fallando, acércate a recepción o crea un ticket aquí." },
  { pregunta: "¿Puedo cambiar de plan?",             respuesta: "Sí. Desde 'Mi Membresía' puedes ver los planes disponibles y solicitar el cambio en recepción." },
  { pregunta: "¿Cómo reservo una clase?",            respuesta: "En la sección 'Clases' encuentras el horario. Haz clic en la clase y confirma tu reserva." },
]

export default function MiembroSoportePage() {
  const { user } = useAuth()
  const [temaSeleccionado, setTemaSeleccionado] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null)

  function handleEnviar(e: React.FormEvent) {
    e.preventDefault()
    if (!temaSeleccionado || !mensaje.trim()) return
    setEnviado(true)
  }

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[800px]">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mb-6">
        <motion.div variants={fadeIn}>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Soporte
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            ¿Tienes un problema? Estamos aquí para ayudarte.
          </p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Formulario de soporte */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {!enviado ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
                Crear ticket
              </p>

              {/* Selección de tema */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {TEMAS.map((t) => {
                  const Icon = t.icon
                  const active = temaSeleccionado === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTemaSeleccionado(t.id)}
                      className="p-3 rounded-xl text-left transition-all"
                      style={{
                        background: active ? "rgba(0,208,132,0.08)" : "var(--bg-surface)",
                        border: `1px solid ${active ? "rgba(0,208,132,0.3)" : "var(--border-faint)"}`,
                      }}
                    >
                      <Icon size={14} style={{ color: active ? "var(--accent)" : "var(--text-tertiary)" }} />
                      <p className="text-xs font-medium mt-1.5" style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>
                        {t.label}
                      </p>
                      <p className="text-[10px] mt-0.5 leading-snug" style={{ color: "var(--text-disabled)" }}>
                        {t.desc}
                      </p>
                    </button>
                  )
                })}
              </div>

              {/* Mensaje */}
              <form onSubmit={handleEnviar} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Describe tu problema
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={e => setMensaje(e.target.value)}
                    placeholder="Explica con detalle lo que sucedió..."
                    rows={4}
                    required
                    className="input-base w-full resize-none"
                    style={{ minHeight: 100 }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!temaSeleccionado || !mensaje.trim()}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: "var(--accent)",
                    color: "#09090B",
                    opacity: !temaSeleccionado || !mensaje.trim() ? 0.45 : 1,
                    cursor: !temaSeleccionado || !mensaje.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  Enviar ticket
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-8 px-4 rounded-2xl"
              style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.18)" }}
            >
              <CheckCircle2 size={36} style={{ color: "var(--accent)" }} />
              <p className="text-base font-semibold mt-3" style={{ color: "var(--text-primary)" }}>
                Ticket enviado
              </p>
              <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                Nuestro equipo te contactará pronto. También puedes preguntar directamente en recepción.
              </p>
              <button
                onClick={() => { setEnviado(false); setMensaje(""); setTemaSeleccionado("") }}
                className="mt-5 text-xs"
                style={{ color: "var(--accent)" }}
              >
                Enviar otro ticket
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* FAQs */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-tertiary)" }}>
            Preguntas frecuentes
          </p>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border-faint)" }}
              >
                <button
                  className="w-full px-4 py-3 text-left transition-colors"
                  onClick={() => setFaqAbierta(faqAbierta === i ? null : i)}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-overlay)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{faq.pregunta}</p>
                </button>
                {faqAbierta === i && (
                  <div className="px-4 pb-3" style={{ borderTop: "1px solid var(--border-faint)" }}>
                    <p className="text-xs leading-relaxed pt-2" style={{ color: "var(--text-tertiary)" }}>
                      {faq.respuesta}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contacto directo */}
          <div
            className="mt-4 px-4 py-3 rounded-xl"
            style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-faint)" }}
          >
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>Contacto directo</p>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Recepción: Lun–Vie 06:00–22:00 · Sáb 07:00–20:00
            </p>
            <a
              href="mailto:soporte@gymsos.io"
              className="text-[11px] mt-0.5 block"
              style={{ color: "var(--accent)" }}
            >
              soporte@gymsos.io
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
