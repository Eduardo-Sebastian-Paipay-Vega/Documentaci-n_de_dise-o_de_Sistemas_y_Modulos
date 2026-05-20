"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"
import { type Rol, ROL_LABELS, ROL_ICONS, ROL_ROUTES } from "@/lib/auth"
import { fadeUp, staggerContainer } from "@/lib/motion"

// Demo credentials per role (shown as hints in the UI)
const DEMO_CREDS: Record<Rol, { email: string; password: string; descripcion: string }> = {
  gerente:       { email: "gerente@gymsos.io",    password: "gerente123",    descripcion: "KPIs · Reportes · Miembros" },
  miembro:       { email: "miembro@gymsos.io",    password: "miembro123",    descripcion: "QR · Clases · Progreso" },
  entrenador:    { email: "entrenador@gymsos.io", password: "entrenador123", descripcion: "Clases · Clientes · Evaluaciones" },
  recepcionista: { email: "recepcion@gymsos.io",  password: "recepcion123",  descripcion: "Registro · Pagos · Acceso" },
}

const ROLES: Rol[] = ["gerente", "miembro", "entrenador", "recepcionista"]

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const router = useRouter()

  const [email, setEmail]         = useState("")
  const [password, setPassword]   = useState("")
  const [showPass, setShowPass]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState("")
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null)

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && user) {
      router.replace(ROL_ROUTES[user.rol])
    }
  }, [user, loading, router])

  function fillDemo(rol: Rol) {
    const creds = DEMO_CREDS[rol]
    setEmail(creds.email)
    setPassword(creds.password)
    setSelectedRole(rol)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    setError("")
    const result = await login(email, password)
    if (!result.ok) {
      setError(result.error ?? "Error de autenticación")
      setSubmitting(false)
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#070D18] flex">
      {/* ── Left panel — Branding (hidden mobile) ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-14">
        {/* Background depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1526] to-[#070D18]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#00D084]/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#FF6B35]/8 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 dot-grid opacity-20" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00D084] flex items-center justify-center">
              <span className="text-[#070D18] font-black text-base">G</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              GYM<span className="text-[#00D084]">sos</span>
            </span>
          </div>
        </div>

        {/* Center content */}
        <motion.div
          className="relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeUp} className="text-xs uppercase tracking-[0.3em] text-[#00D084] font-semibold mb-4">
            Sistema Operativo del Fitness
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-[clamp(2.8rem,5vw,5rem)] font-black leading-[0.9] text-white tracking-tight"
          >
            Bienvenido
            <br />
            <span className="gradient-text-green">de regreso.</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-6 text-neutral-400 text-lg max-w-sm leading-relaxed">
            Accede a tu panel según tu rol. Cada sesión es única, segura y personalizada.
          </motion.p>

          {/* Role cards preview */}
          <motion.div variants={fadeUp} className="mt-10 grid grid-cols-2 gap-3 max-w-sm">
            {ROLES.map((rol) => (
              <div
                key={rol}
                className={cn(
                  "glass-card rounded-xl p-3.5 flex items-center gap-2.5 transition-all duration-200 cursor-pointer",
                  selectedRole === rol && "glass-card-green border-[#00D084]/25",
                )}
                onClick={() => fillDemo(rol)}
              >
                <span className="text-xl">{ROL_ICONS[rol]}</span>
                <div>
                  <p className="text-white text-xs font-semibold">{ROL_LABELS[rol]}</p>
                  <p className="text-neutral-600 text-[10px]">{DEMO_CREDS[rol].descripcion}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: "2.5M+", label: "Miembros" },
            { value: "500+", label: "Gimnasios" },
            { value: "89%",  label: "Retención AI" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-white font-black text-2xl gradient-text-green">{s.value}</p>
              <p className="text-neutral-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 bg-[#070D18]" />

        <motion.div
          className="relative z-10 w-full max-w-[420px]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#00D084] flex items-center justify-center">
              <span className="text-[#070D18] font-black text-sm">G</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              GYM<span className="text-[#00D084]">sos</span>
            </span>
          </div>

          <h2 className="text-3xl font-black text-white mb-1">Iniciar sesión</h2>
          <p className="text-neutral-500 text-sm mb-8">
            Ingresa tus credenciales para acceder a tu panel
          </p>

          {/* Quick role selector (mobile + desktop) */}
          <div className="mb-6">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-3">
              Acceso rápido — elige tu rol demo
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((rol) => (
                <motion.button
                  key={rol}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => fillDemo(rol)}
                  className={cn(
                    "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all duration-200 text-sm",
                    selectedRole === rol
                      ? "bg-[#00D084]/10 border-[#00D084]/35 text-white"
                      : "glass-card text-neutral-400 hover:border-white/15 hover:text-neutral-200",
                  )}
                >
                  <span>{ROL_ICONS[rol]}</span>
                  <span className="font-medium">{ROL_LABELS[rol]}</span>
                  {selectedRole === rol && (
                    <span className="ml-auto text-[#00D084] text-xs">✓</span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-neutral-600 text-xs">o ingresa manualmente</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setSelectedRole(null) }}
                placeholder="tu@email.com"
                required
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/50 focus:bg-white/7 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-neutral-500 font-medium uppercase tracking-wider block mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError("") }}
                  placeholder="••••••••"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 pr-12 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-[#00D084]/50 focus:bg-white/7 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 text-xs transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? "ocultar" : "mostrar"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 accent-[#00D084]" />
                <span className="text-neutral-500 text-sm">Recordarme</span>
              </label>
              <button type="button" className="text-[#00D084] text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-4 py-3 flex items-center gap-2"
                >
                  <span className="text-[#EF4444] text-base">⚠</span>
                  <p className="text-[#EF4444] text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={submitting || !email || !password}
              whileHover={!submitting ? { scale: 1.01 } : {}}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-base transition-all duration-200",
                "bg-[#00D084] text-[#070D18] shadow-[0_0_30px_rgba(0,208,132,0.25)]",
                "hover:bg-[#00E891]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
              )}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#070D18]/30 border-t-[#070D18] rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                "INGRESAR →"
              )}
            </motion.button>
          </form>

          {/* Hint box */}
          {selectedRole && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 glass-card-green rounded-xl px-4 py-3"
            >
              <p className="text-[#00D084] text-xs font-semibold mb-0.5">
                {ROL_ICONS[selectedRole]} Acceso demo — {ROL_LABELS[selectedRole]}
              </p>
              <p className="text-neutral-400 text-xs font-mono">{DEMO_CREDS[selectedRole].email}</p>
            </motion.div>
          )}

          <p className="mt-8 text-center text-neutral-600 text-xs">
            ¿No tienes cuenta?{" "}
            <button className="text-[#00D084] hover:underline font-medium">
              Solicitar acceso
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
