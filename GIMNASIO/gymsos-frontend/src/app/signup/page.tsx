"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, Building2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { fadeIn, staggerContainer, easings } from "@/lib/motion"

// Campos requeridos en la tabla `usuarios` (Fase 5 BD):
//   id_usuario (UUID, auto desde auth.users)
//   email      (de auth.users)
//   nombre     NOT NULL
//   id_gimnasio NOT NULL  ← resuelto con codigo_acceso
//   rol        default 'miembro'
//   estado     default 'activo'

type Genero = "M" | "F" | "Otro"

interface GymInfo {
  id_gimnasio: string
  nombre: string
  ciudad: string | null
}

export default function SignupPage() {
  const router = useRouter()

  // Campos del formulario
  const [nombre,          setNombre]          = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [codigoGim,       setCodigoGim]       = useState("")
  const [telefono,        setTelefono]        = useState("")
  const [genero,          setGenero]          = useState<Genero | "">("")

  // Estado del gym validado
  const [gym,             setGym]             = useState<GymInfo | null>(null)
  const [checkingCode,    setCheckingCode]    = useState(false)
  const [codeError,       setCodeError]       = useState("")

  // Estado general
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [submitting,      setSubmitting]      = useState(false)
  const [error,           setError]           = useState("")
  const [success,         setSuccess]         = useState(false)
  const [needsConfirm,    setNeedsConfirm]    = useState(false)

  // ── Validar código de gimnasio (on blur) ──────────────────────────────────
  async function validateCode() {
    const code = codigoGim.trim().toUpperCase()
    if (!code) { setGym(null); setCodeError(""); return }

    setCheckingCode(true)
    setCodeError("")
    setGym(null)

    const { data, error: err } = await supabase
      .from("gimnasios")
      .select("id_gimnasio, nombre, ciudad")
      .eq("codigo_acceso", code)
      .eq("estado", "activo")
      .single()

    setCheckingCode(false)

    if (err || !data) {
      setCodeError("Código inválido. Solicita el código a tu gimnasio.")
    } else {
      setGym(data)
    }
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!gym) {
      setError("Debes validar el código de tu gimnasio.")
      return
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.")
      return
    }

    setSubmitting(true)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          // Estos metadatos los procesa el trigger handle_new_user (migración 005)
          // creando automáticamente la fila en la tabla `usuarios`.
          data: {
            nombre:      nombre.trim(),
            id_gimnasio: gym.id_gimnasio,
            rol:         "miembro",
            telefono:    telefono.trim() || null,
            genero:      genero || null,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered") ||
            authError.message.includes("already been registered")) {
          setError("Ya existe una cuenta con ese email. ¿Quieres iniciar sesión?")
        } else {
          setError(authError.message)
        }
        return
      }

      if (!data.user) {
        setError("No se pudo crear la cuenta. Intenta de nuevo.")
        return
      }

      setSuccess(true)

      if (data.session) {
        // Email confirmation deshabilitado en Supabase → sesión inmediata
        setNeedsConfirm(false)
        setTimeout(() => router.push("/login"), 2500)
      } else {
        // Email confirmation habilitado → usuario debe verificar correo
        setNeedsConfirm(true)
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-base)" }}
      >
        <motion.div
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.heroOut }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(0,208,132,0.1)" }}
          >
            <CheckCircle2 size={32} style={{ color: "var(--accent)" }} />
          </div>

          <h2
            className="text-2xl font-bold tracking-tight mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {needsConfirm ? "¡Casi listo!" : "¡Cuenta creada!"}
          </h2>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-tertiary)" }}>
            {needsConfirm
              ? <>
                  Revisa tu correo <strong style={{ color: "var(--text-secondary)" }}>{email}</strong>{" "}
                  y haz clic en el enlace de confirmación. Luego podrás iniciar sesión.
                </>
              : "Tu cuenta fue creada y vinculada correctamente. Redirigiendo al login…"
            }
          </p>

          <Link href="/login">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold"
              style={{ background: "var(--accent)", color: "#09090B" }}
            >
              Ir al Login
              <ArrowRight size={14} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Formulario principal ───────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Panel izquierdo (branding) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 line-grid opacity-100 pointer-events-none" />
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,208,132,0.06) 0%, transparent 70%)" }}
        />

        {/* Logo */}
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

        {/* Headline */}
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
            Únete a GYMsos
          </motion.p>

          <motion.h1
            variants={fadeIn}
            className="font-black leading-[1.02] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.6rem, 5vw, 4.5rem)", color: "var(--text-primary)" }}
          >
            Tu entrenamiento,{" "}
            <span style={{ color: "var(--accent)" }}>inteligente</span>{" "}
            desde el día uno.
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="text-base leading-relaxed max-w-sm"
            style={{ color: "var(--text-tertiary)" }}
          >
            Acceso QR, seguimiento de progreso, clases, gamificación y análisis
            con IA — todo desde una sola cuenta.
          </motion.p>

          <motion.div variants={fadeIn} className="mt-10 flex gap-8">
            {[
              { value: "< 1 min", label: "para registrarte" },
              { value: "100%",    label: "datos seguros" },
              { value: "Multi-tenant", label: "aislamiento real" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-lg font-black tabular-nums" style={{ color: "var(--text-primary)" }}>
                  {s.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative z-10">
          <span className="text-xs" style={{ color: "var(--text-disabled)" }}>
            GYMsos v2.0 · 2026
          </span>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ── */}
      <div
        className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto"
        style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border-faint)" }}
      >
        <motion.div
          className="w-full max-w-[420px] py-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.heroOut }}
        >
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
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

          <h2
            className="text-2xl font-bold tracking-tight mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Crear cuenta
          </h2>
          <p className="text-sm mb-7" style={{ color: "var(--text-tertiary)" }}>
            Completa el formulario para unirte a tu gimnasio.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Código de gimnasio (lo primero — determina el tenant) ── */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Código de gimnasio <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={codigoGim}
                  onChange={(e) => {
                    setCodigoGim(e.target.value.toUpperCase())
                    setGym(null)
                    setCodeError("")
                  }}
                  onBlur={validateCode}
                  placeholder="Ej: GYMFIT"
                  required
                  maxLength={20}
                  className="input-base uppercase tracking-widest"
                  autoComplete="off"
                />
                {checkingCode && (
                  <Loader2
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                )}
              </div>

              {/* Resultado de validación del código */}
              <AnimatePresence>
                {gym && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-1.5"
                  >
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        background: "rgba(0,208,132,0.06)",
                        border: "1px solid rgba(0,208,132,0.18)",
                      }}
                    >
                      <Building2 size={12} style={{ color: "var(--accent)" }} />
                      <p className="text-xs" style={{ color: "var(--accent)" }}>
                        {gym.nombre}{gym.ciudad ? ` · ${gym.ciudad}` : ""}
                      </p>
                    </div>
                  </motion.div>
                )}
                {codeError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-1.5"
                  >
                    <p className="text-xs" style={{ color: "var(--red)" }}>{codeError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-[11px] mt-1" style={{ color: "var(--text-disabled)" }}>
                Tu administrador o gerente te proporcionó este código.
              </p>
            </div>

            <div className="h-px" style={{ background: "var(--border-faint)" }} />

            {/* ── Nombre completo ── */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Nombre completo <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez García"
                required
                minLength={2}
                maxLength={100}
                className="input-base"
                autoComplete="name"
              />
            </div>

            {/* ── Email ── */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Correo electrónico <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="input-base"
                autoComplete="email"
              />
            </div>

            {/* ── Password ── */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Contraseña <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={8}
                  className="input-base pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* ── Confirmar password ── */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Confirmar contraseña <span style={{ color: "var(--red)" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  className={cn(
                    "input-base pr-10",
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/40"
                      : "",
                  )}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  aria-label="Mostrar/ocultar confirmación"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] mt-1" style={{ color: "var(--red)" }}>
                  Las contraseñas no coinciden
                </p>
              )}
            </div>

            {/* ── Opcionales ── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+51 987 654 321"
                  maxLength={20}
                  className="input-base"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Género
                </label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as Genero | "")}
                  className="input-base"
                  style={{ appearance: "none" }}
                >
                  <option value="">Sin especificar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* ── Error global ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div
                    className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg"
                    style={{
                      background: "rgba(239,68,68,0.06)",
                      border: "1px solid rgba(239,68,68,0.18)",
                    }}
                  >
                    <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
                    <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Submit ── */}
            <motion.button
              type="submit"
              disabled={submitting || !gym || !nombre || !email || !password || !confirmPassword}
              whileTap={!submitting ? { scale: 0.98 } : {}}
              className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: "var(--accent)",
                color: "#09090B",
                opacity: (submitting || !gym || !nombre || !email || !password || !confirmPassword) ? 0.5 : 1,
                cursor: (submitting || !gym || !nombre || !email || !password || !confirmPassword)
                  ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? <Loader2 size={15} className="animate-spin" />
                : <>Crear cuenta <ArrowRight size={14} /></>
              }
            </motion.button>
          </form>

          {/* ── Footer ── */}
          <p className="mt-6 text-center text-[11px]" style={{ color: "var(--text-disabled)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              Iniciar sesión
            </Link>
          </p>

          <p className="mt-3 text-center text-[10px] px-4" style={{ color: "var(--text-disabled)" }}>
            Al crear una cuenta aceptas los términos de uso de GYMsos.
            Tu cuenta quedará vinculada al gimnasio seleccionado.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
