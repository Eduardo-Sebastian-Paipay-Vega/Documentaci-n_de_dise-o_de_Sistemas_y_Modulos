"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { type Rol, ROL_ROUTES, USUARIOS_DEMO_CREDS, ROL_LABELS } from "@/lib/auth"
import { fadeIn, staggerContainer, easings } from "@/lib/motion"
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react"

// Acceso rápido — cuentas reales en Supabase, útil para demos y testing
const ROL_DESC: Partial<Record<Rol, string>> = {
  gerente:       “KPIs · Reportes · Configuración”,
  recepcionista: “Registro · Pagos · Acceso”,
  entrenador:    “Clases · Clientes · Evaluaciones”,
  miembro:       “QR · Clases · Progreso”,
  cliente:       “Portal personal de entrenamiento”,
  nutricionista: “Planes · Evaluaciones · Recetas”,
}

const ROL_ACCENT: Record<Rol, string> = {
  gerente:       "var(--accent)",
  recepcionista: "#3B82F6",
  entrenador:    "#F97316",
  miembro:       "#8B5CF6",
  cliente:       "#22C55E",
  nutricionista: "#10B981",
}

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState("")
  const [activeRole, setActiveRole] = useState<Rol | null>(null)
  const [showSolicitud, setShowSolicitud] = useState(false)

  useEffect(() => {
    if (!loading && user) router.replace(ROL_ROUTES[user.rol])
  }, [user, loading, router])

  function selectRole(rol: Rol) {
    const c = USUARIOS_DEMO_CREDS.find((u) => u.rol === rol)
    if (!c) return
    setEmail(c.email)
    setPassword(c.password)
    setActiveRole(rol)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    setError("")
    try {
      const result = await login(email, password)
      if (!result.ok) {
        setError(result.error ?? "Credenciales incorrectas")
      }
    } catch {
      setError("Error de conexiÃ³n. Verifica tu internet e intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-base)" }}
    >
      {/* â”€â”€ Left â€” branding panel â”€â”€ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        {/* Structural grid */}
        <div className="absolute inset-0 line-grid opacity-100 pointer-events-none" />

        {/* Single restrained glow */}
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,208,132,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Top â€” logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "var(--accent)" }}
          >
            <span className="text-[#09090B] font-black text-xs">G</span>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            GYM<span style={{ color: "var(--accent)" }}>sos</span>
          </span>
        </div>

        {/* Center â€” headline */}
        <motion.div
          className="relative z-10 max-w-md"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p
            variants={fadeIn}
            className="text-xs font-medium tracking-[0.25em] uppercase mb-5"
            style={{ color: "var(--text-tertiary)" }}
          >
            Sistema Operativo del Fitness
          </motion.p>

          <motion.h1
            variants={fadeIn}
            className="font-black leading-[1.02] tracking-tight mb-6"
            style={{
              fontSize: "clamp(2.6rem, 5vw, 4.5rem)",
              color: "var(--text-primary)",
            }}
          >
            El sistema que{" "}
            <span style={{ color: "var(--accent)" }}>tu gimnasio</span>{" "}
            necesitaba.
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-base leading-relaxed max-w-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            GestiÃ³n completa por roles, acceso QR, predicciÃ³n de churn,
            gamificaciÃ³n y mÃ¡s â€” en un solo lugar.
          </motion.p>

          {/* Stats row */}
          <motion.div variants={fadeIn} className="mt-10 flex gap-8">
            {[
              { value: "2.5M+", label: "Miembros activos" },
              { value: "500+",  label: "Gimnasios" },
              { value: "89%",   label: "RetenciÃ³n AI" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-black tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom â€” version */}
        <div className="relative z-10">
          <span className="text-xs" style={{ color: "var(--text-disabled)" }}>
            GYMsos v2.0 Â· 2026
          </span>
        </div>
      </div>

      {/* â”€â”€ Right â€” login form â”€â”€ */}
      <div
        className="flex-1 flex items-center justify-center px-6 py-12"
        style={{
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-faint)",
        }}
      >
        <motion.div
          className="w-full max-w-[400px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.heroOut }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <span className="text-[#09090B] font-black text-xs">G</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              GYM<span style={{ color: "var(--accent)" }}>sos</span>
            </span>
          </div>

          {/* Heading */}
          <h2
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Iniciar sesiÃ³n
          </h2>
          <p className="text-sm mb-7" style={{ color: "var(--text-tertiary)" }}>
            Selecciona tu rol o ingresa tus credenciales
          </p>

          {/* Role selector */}
          <div className="mb-6">
            <p className="text-[11px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "var(--text-tertiary)" }}>
              Acceso rápido
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {USUARIOS_DEMO_CREDS.map(({ rol }) => {
                const isActive = activeRole === rol
                const accent   = ROL_ACCENT[rol]
                return (
                  <motion.button
                    key={rol}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => selectRole(rol)}
                    className="flex flex-col items-start px-3 py-2.5 rounded-lg text-left transition-all duration-150"
                    style={{
                      background: isActive ? `${accent}10` : "var(--bg-overlay)",
                      border: `1px solid ${isActive ? `${accent}30` : "var(--border-subtle)"}`,
                      color: isActive ? "var(--text-primary)" : "var(--text-tertiary)",
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.borderColor = "var(--border-default)"
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.borderColor = "var(--border-subtle)"
                    }}
                  >
                    <span className="text-xs font-semibold">{ROL_LABELS[rol]}</span>
                    <span
                      className="text-[10px] mt-0.5 leading-snug"
                      style={{ color: isActive ? accent : "var(--text-disabled)" }}
                    >
                      {ROL_DESC[rol]}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--border-faint)" }} />
            <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>o continÃºa con email</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-faint)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Correo electrÃ³nico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setActiveRole(null) }}
                placeholder="correo@ejemplo.com"
                required
                className="input-base"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                ContraseÃ±a
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                  required
                  className="input-base pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: easings.sharp }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.18)",
                    }}
                  >
                    <AlertCircle size={14} className="shrink-0" style={{ color: "var(--red)" }} />
                    <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || !email || !password}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              className={cn(
                "w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all",
              )}
              style={{
                background: "var(--accent)",
                color: "#09090B",
                opacity: (!email || !password) ? 0.5 : 1,
                cursor: (!email || !password) ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  Acceder
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px]" style={{ color: "var(--text-disabled)" }}>
            Â¿Sin cuenta?{" "}
            <button
              onClick={() => setShowSolicitud(!showSolicitud)}
              className="transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              Solicitar acceso
            </button>
          </p>

          <AnimatePresence>
            {showSolicitud && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <div
                  className="px-4 py-3 rounded-lg text-center"
                  style={{
                    background: "rgba(0,208,132,0.06)",
                    border: "1px solid rgba(0,208,132,0.18)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                    Las cuentas son creadas por el administrador del gimnasio.
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                    Contacta a tu gerente o escribe a{" "}
                    <a
                      href="mailto:eduardo.paipay.27@unsch.edu.pe"
                      className="transition-colors"
                      style={{ color: "var(--accent)" }}
                    >
                      soporte@gymsos.io
                    </a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

