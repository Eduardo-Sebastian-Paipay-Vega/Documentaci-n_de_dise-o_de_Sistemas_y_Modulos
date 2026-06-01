"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { type Rol, ROL_ROUTES } from "@/lib/auth"
import { fadeIn, staggerContainer, easings } from "@/lib/motion"
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Building2, Users, X } from "lucide-react"
import type { LoginResult } from "@/components/providers/auth-provider"

// ── Modal: camino a elegir cuando la cuenta existe pero no tiene gym asignado ──
function ChoosePathModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors"
          style={{ color: "var(--text-disabled)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-disabled)")}
        >
          <X size={16} />
        </button>

        <h3 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          ¿Cómo quieres continuar?
        </h3>
        <p className="text-xs mb-5" style={{ color: "var(--text-tertiary)" }}>
          Tu cuenta existe pero aún no está vinculada a un gimnasio.
        </p>

        <div className="flex flex-col gap-3">
          <a
            href="/onboarding"
            className="flex items-start gap-3 p-4 rounded-xl transition-all"
            style={{
              background: "rgba(0,208,132,0.05)",
              border: "1px solid rgba(0,208,132,0.2)",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,208,132,0.1)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(0,208,132,0.05)")}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "rgba(0,208,132,0.15)" }}
            >
              <Building2 size={15} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Soy dueño de un gimnasio
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Registra tu negocio y obtén tu código de acceso
              </p>
            </div>
          </a>

          <a
            href="/signup"
            className="flex items-start gap-3 p-4 rounded-xl transition-all"
            style={{
              background: "var(--bg-overlay)",
              border: "1px solid var(--border-subtle)",
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)")}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)")}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}
            >
              <Users size={15} style={{ color: "var(--text-secondary)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                Soy miembro o trabajador
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                Tengo un código de acceso de mi gimnasio
              </p>
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState("")
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null)

  useEffect(() => {
    if (!loading && user) router.replace(ROL_ROUTES[user.rol])
  }, [user, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    setError("")
    setLoginResult(null)
    try {
      const result = await login(email, password)
      if (!result.ok) {
        setLoginResult(result)
        if (!result.action) {
          setError(result.error ?? "Credenciales incorrectas")
        }
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return null

  const showChooseModal  = loginResult?.action === "choose_path"
  const showWrongSystem  = loginResult?.action === "wrong_system"

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Modal: elegir camino cuando cuenta sin gym */}
      <AnimatePresence>
        {showChooseModal && (
          <ChoosePathModal onClose={() => setLoginResult(null)} />
        )}
      </AnimatePresence>
      {/* Left — branding panel */}
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

        {/* Top — logo */}
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

        {/* Center — headline */}
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
            Gestión completa por roles, acceso QR, predicción de churn,
            gamificación y más — en un solo lugar.
          </motion.p>

          {/* Stats row */}
          <motion.div variants={fadeIn} className="mt-10 flex gap-8">
            {[
              { value: "2.5M+", label: "Miembros activos" },
              { value: "500+",  label: "Gimnasios" },
              { value: "89%",   label: "Retención AI" },
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

        {/* Bottom — version */}
        <div className="relative z-10">
          <span className="text-xs" style={{ color: "var(--text-disabled)" }}>
            GYMsos v2.0 · 2026
          </span>
        </div>
      </div>

      {/* Right — login form */}
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
            Iniciar sesión
          </h2>
          <p className="text-sm mb-7" style={{ color: "var(--text-tertiary)" }}>
            Ingresa tus credenciales para acceder
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
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
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="••••••••"
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

            {/* Error: cuenta de otro sistema */}
            <AnimatePresence>
              {showWrongSystem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: easings.sharp }}
                  className="overflow-hidden"
                >
                  <div
                    className="rounded-xl p-3.5"
                    style={{
                      background: "rgba(234,179,8,0.06)",
                      border: "1px solid rgba(234,179,8,0.22)",
                    }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: "#ca8a04" }}>
                      Cuenta habilitada para otro módulo
                    </p>
                    <p className="text-[11px] leading-relaxed" style={{ color: "#a16207" }}>
                      Esta cuenta pertenece a otro sistema de la plataforma (por ejemplo ONG u otro módulo).
                      Si crees que es un error, contacta al administrador.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error genérico */}
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
            {"¿Sin cuenta? "}
            <Link
              href="/signup"
              className="transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              Crear cuenta
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
