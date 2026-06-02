"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye, EyeOff, ArrowRight, Loader2, AlertCircle, CheckCircle2, Building2,
  UserCog, ChevronDown,
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
//
// Campos opcionales para staff (migración 016):
//   staff_code → trigger handle_new_user CASO B asigna rol RBAC automáticamente

type Genero = "M" | "F" | "Otro"

// Roles disponibles para usuarios con staff_code
const STAFF_ROLES = [
  { value: "recepcionista",  label: "Recepcionista" },
  { value: "entrenador",     label: "Entrenador" },
  { value: "nutricionista",  label: "Nutricionista" },
  { value: "gerente",        label: "Administrador" },
] as const

type StaffRol = (typeof STAFF_ROLES)[number]["value"]

interface GymInfo {
  id_gimnasio: string
  nombre:      string
  ciudad:      string | null
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

  // Staff code
  const [staffCode,     setStaffCode]     = useState("")
  const [showStaff,     setShowStaff]     = useState(false)
  const [staffRol,      setStaffRol]      = useState<StaffRol>("recepcionista")

  // Estado del gym validado
  const [gym,           setGym]           = useState<GymInfo | null>(null)
  const [checkingCode,  setCheckingCode]  = useState(false)
  const [codeError,     setCodeError]     = useState("")

  // Estado general
  const [showPass,      setShowPass]      = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState("")
  const [success,       setSuccess]       = useState(false)
  const [needsConfirm,  setNeedsConfirm]  = useState(false)

  // ── Leer URL params al montar ─────────────────────────────────────────────
  useEffect(() => {
    const params       = new URLSearchParams(window.location.search)
    const gymParam     = params.get("gym")
    const codeParam    = params.get("staff_code")

    if (codeParam) {
      setStaffCode(codeParam.toUpperCase())
      setShowStaff(true)
    }
    if (gymParam) {
      const code = gymParam.toUpperCase()
      setCodigoGim(code)
      // Auto-validar el código del gym desde la URL
      validateCodeByValue(code)
    }
  // Ejecutar solo una vez al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Validar código de gimnasio por valor ─────────────────────────────────
  // Separado del handler de blur para poder llamarlo con un valor directo (URL params)
  async function validateCodeByValue(code: string) {
    if (!code) { setGym(null); setCodeError(""); return }

    setCheckingCode(true)
    setCodeError("")
    setGym(null)

    const { data: codeRow, error: err } = await supabase
      .from("codigos_acceso")
      .select("id_gimnasio, gimnasios(nombre, ciudad, estado)")
      .eq("codigo", code)
      .eq("activo", true)
      .single()

    setCheckingCode(false)

    const gymData = codeRow?.gimnasios as { nombre: string; ciudad: string; estado: string } | undefined

    if (err || !codeRow || gymData?.estado !== "activo") {
      setCodeError("Código inválido. Solicita el código a tu gimnasio.")
    } else {
      setGym({
        id_gimnasio: codeRow.id_gimnasio,
        nombre:      gymData?.nombre ?? "",
        ciudad:      gymData?.ciudad ?? null,
      })
    }
  }

  // ── Validar código de gimnasio (on blur) ─────────────────────────────────
  async function validateCode() {
    await validateCodeByValue(codigoGim.trim().toUpperCase())
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
    if (showStaff && staffCode && staffCode.length < 4) {
      setError("El código de staff no parece válido. Verifica con tu administrador.")
      return
    }

    setSubmitting(true)

    try {
      const trimmedStaffCode = staffCode.trim().toUpperCase()

      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          // Estos metadatos los procesa el trigger handle_new_user (migración 005 / 016)
          // creando automáticamente la fila en `usuarios` y asignando roles RBAC si hay staff_code.
          data: {
            nombre:      nombre.trim(),
            id_gimnasio: gym.id_gimnasio,
            rol:         showStaff && trimmedStaffCode ? staffRol : "miembro",
            telefono:    telefono.trim() || null,
            genero:      genero || null,
            // Solo se incluye si el usuario activó el campo de staff
            ...(showStaff && trimmedStaffCode
              ? { staff_code: trimmedStaffCode }
              : {}),
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
        setNeedsConfirm(false)
        setTimeout(() => router.push("/login"), 2500)
      } else {
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
              { value: "< 1 min",     label: "para registrarte" },
              { value: "100%",        label: "datos seguros" },
              { value: "Multi-tenant",label: "aislamiento real" },
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

            {/* ── Código de gimnasio ── */}
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
                        border:     "1px solid rgba(0,208,132,0.18)",
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
                    confirmPassword && confirmPassword !== password ? "border-red-500/40" : "",
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

            {/* ── Opcionales: teléfono + género ── */}
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

            {/* ── Staff code section ── */}
            <div>
              <button
                type="button"
                onClick={() => setShowStaff(!showStaff)}
                className="flex items-center gap-2 w-full py-2.5 px-3 rounded-lg transition-colors text-left"
                style={{
                  background: showStaff ? "rgba(0,208,132,0.06)" : "var(--bg-muted)",
                  border:     `1px solid ${showStaff ? "rgba(0,208,132,0.18)" : "var(--border-subtle)"}`,
                  color:      showStaff ? "var(--accent)" : "var(--text-secondary)",
                }}
              >
                <UserCog size={13} />
                <span className="text-xs font-medium flex-1">
                  ¿Eres parte del personal del gimnasio?
                </span>
                <motion.div
                  animate={{ rotate: showStaff ? 180 : 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <ChevronDown size={13} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showStaff && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 space-y-3">
                      {/* Staff code input */}
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                          Código de staff
                        </label>
                        <input
                          type="text"
                          value={staffCode}
                          onChange={(e) => setStaffCode(e.target.value.toUpperCase())}
                          placeholder="Ej: ABX-7K2M"
                          maxLength={24}
                          className="input-base uppercase tracking-widest"
                          autoComplete="off"
                        />
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-disabled)" }}>
                          El administrador te envió este código de invitación.
                        </p>
                      </div>

                      {/* Staff role */}
                      <div>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                          Tu cargo
                        </label>
                        <div className="relative">
                          <select
                            value={staffRol}
                            onChange={(e) => setStaffRol(e.target.value as StaffRol)}
                            className="input-base"
                            style={{ appearance: "none", paddingRight: "32px" }}
                          >
                            {STAFF_ROLES.map(r => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                          <ChevronDown
                            size={13}
                            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "var(--text-tertiary)" }}
                          />
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: "var(--text-disabled)" }}>
                          Debe coincidir con el cargo que el administrador te asignó.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                      border:     "1px solid rgba(239,68,68,0.18)",
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
                color:      "#09090B",
                opacity:    (submitting || !gym || !nombre || !email || !password || !confirmPassword) ? 0.5 : 1,
                cursor:     (submitting || !gym || !nombre || !email || !password || !confirmPassword)
                  ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? <Loader2 size={15} className="animate-spin" />
                : <>{showStaff && staffCode ? "Unirme al staff" : "Crear cuenta"} <ArrowRight size={14} /></>
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
