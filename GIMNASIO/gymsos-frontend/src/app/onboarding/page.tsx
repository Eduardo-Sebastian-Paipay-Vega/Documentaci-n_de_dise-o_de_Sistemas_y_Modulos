"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Loader2,
  AlertCircle, CheckCircle2, Building2, User, Dumbbell,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { easings } from "@/lib/motion"

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3

const PLANES = [
  { value: "pequeno",    label: "Pequeño",    desc: "Hasta 100 miembros",   precio: "S/. 99/mes"  },
  { value: "mediano",    label: "Mediano",    desc: "Hasta 500 miembros",   precio: "S/. 199/mes" },
  { value: "grande",     label: "Grande",     desc: "Hasta 2000 miembros",  precio: "S/. 349/mes" },
  { value: "enterprise", label: "Enterprise", desc: "Sin límite · Multi-sede", precio: "A consultar" },
]

// ── Indicador de pasos ────────────────────────────────────────────────────────
function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Tu cuenta",    icon: User },
    { n: 2, label: "Tu gimnasio",  icon: Building2 },
    { n: 3, label: "Listo",        icon: CheckCircle2 },
  ]
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const Icon = s.icon
        const done    = step > s.n
        const current = step === s.n
        return (
          <div key={s.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                style={{
                  background: done || current ? "var(--accent)" : "var(--bg-overlay)",
                  color: done || current ? "#09090B" : "var(--text-disabled)",
                  border: `1px solid ${done || current ? "var(--accent)" : "var(--border-subtle)"}`,
                }}
              >
                <Icon size={14} />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: current ? "var(--accent)" : "var(--text-disabled)" }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-16 h-px mb-5 mx-1 transition-all duration-300"
                style={{ background: step > s.n ? "var(--accent)" : "var(--border-faint)" }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1: cuenta personal
  const [nombre,          setNombre]          = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)

  // Step 2: datos del gimnasio
  const [gymNombre,  setGymNombre]  = useState("")
  const [gymCiudad,  setGymCiudad]  = useState("")
  const [gymPlan,    setGymPlan]    = useState("mediano")

  // Estado global
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState("")
  const [gymCode,    setGymCode]    = useState("")
  const [needsEmail, setNeedsEmail] = useState(false)

  // ── Validar step 1 ──────────────────────────────────────────────────────────
  function validateStep1(): string {
    if (!nombre.trim())  return "Ingresa tu nombre completo."
    if (!email.trim())   return "Ingresa tu correo electrónico."
    if (password.length < 8) return "La contraseña debe tener mínimo 8 caracteres."
    if (password !== confirmPassword) return "Las contraseñas no coinciden."
    return ""
  }

  function goToStep2() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError("")
    setStep(2)
  }

  // ── Submit final (step 2) ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gymNombre.trim()) { setError("Ingresa el nombre de tu gimnasio."); return }

    setSubmitting(true)
    setError("")

    try {
      // signUp con metadatos — el trigger handle_new_user detecta gym_nombre
      // y crea automáticamente el gym + perfil gerente en PostgreSQL
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            nombre:     nombre.trim(),
            rol:        "gerente",
            gym_nombre: gymNombre.trim(),
            gym_ciudad: gymCiudad.trim() || "Lima",
            gym_plan:   gymPlan,
          },
        },
      })

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Ya existe una cuenta con ese email.")
        } else {
          setError(authError.message)
        }
        return
      }

      if (!data.user) {
        setError("No se pudo crear la cuenta. Intenta de nuevo.")
        return
      }

      if (data.session) {
        // Auto-confirmado: el trigger ya corrió, buscar el código generado
        await fetchGymCode(data.user.id)
      } else {
        // Email confirmation pendiente — el código se genera cuando confirme
        setNeedsEmail(true)
        setStep(3)
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  async function fetchGymCode(userId: string) {
    // Esperar brevemente para que el trigger termine
    await new Promise(r => setTimeout(r, 800))
    const { data } = await supabase
      .from("gimnasios")
      .select("codigo_acceso, nombre")
      .eq("id_gimnasio",
        (await supabase
          .from("usuarios")
          .select("id_gimnasio")
          .eq("id_usuario", userId)
          .single()
        ).data?.id_gimnasio ?? ""
      )
      .single()

    setGymCode(data?.codigo_acceso ?? "—")
    setStep(3)
  }

  // ── Step 3: pantalla de éxito ───────────────────────────────────────────────
  if (step === 3) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-base)" }}
      >
        <motion.div
          className="max-w-lg w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.heroOut }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}
          >
            <Dumbbell size={36} style={{ color: "var(--accent)" }} />
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
            {needsEmail ? "¡Casi listo!" : "¡Gimnasio creado!"}
          </h2>

          {needsEmail ? (
            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-tertiary)" }}>
              Revisa tu correo <strong style={{ color: "var(--text-secondary)" }}>{email}</strong> y
              confirma tu cuenta. Una vez que confirmes, inicia sesión y tu gimnasio estará activo.
            </p>
          ) : (
            <>
              <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
                Tu gimnasio <strong style={{ color: "var(--text-secondary)" }}>{gymNombre}</strong> está
                listo. Comparte el código de acceso con tu equipo para que puedan registrarse.
              </p>

              {/* Código de acceso */}
              <div
                className="mx-auto mb-6 px-6 py-4 rounded-xl inline-block"
                style={{
                  background: "rgba(0,208,132,0.06)",
                  border: "1px solid rgba(0,208,132,0.25)",
                }}
              >
                <p className="text-xs font-medium uppercase tracking-widest mb-1"
                   style={{ color: "var(--text-tertiary)" }}>
                  Código de acceso del gimnasio
                </p>
                <p className="text-3xl font-black tracking-[0.3em]" style={{ color: "var(--accent)" }}>
                  {gymCode}
                </p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-disabled)" }}>
                  Tus empleados lo usarán en /signup para unirse
                </p>
              </div>
            </>
          )}

          <Link href="/login">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold"
              style={{ background: "var(--accent)", color: "#09090B" }}
            >
              Ir al Login
              <ArrowRight size={15} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Formulario principal ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-[46%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 line-grid opacity-100 pointer-events-none" />
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(0,208,132,0.06) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "var(--accent)" }}>
            <span className="text-[#09090B] font-black text-xs">G</span>
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            GYM<span style={{ color: "var(--accent)" }}>sos</span>
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="text-xs font-medium tracking-[0.25em] uppercase mb-5"
             style={{ color: "var(--text-tertiary)" }}>
            Para dueños y gerentes
          </p>
          <h1
            className="font-black leading-[1.02] tracking-tight mb-6"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 4rem)", color: "var(--text-primary)" }}
          >
            Tu gimnasio en{" "}
            <span style={{ color: "var(--accent)" }}>5 minutos.</span>
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{ color: "var(--text-tertiary)" }}>
            Registra tu negocio, obtén tu código de acceso y empieza a gestionar miembros,
            clases y pagos desde el primer día.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {[
              "Gestión completa por roles",
              "Dashboard con KPIs en tiempo real",
              "Acceso QR para tus miembros",
              "Predicción de churn con IA",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: "rgba(0,208,132,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                </div>
                <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <span className="text-xs" style={{ color: "var(--text-disabled)" }}>GYMsos v2.0 · 2026</span>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div
        className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto"
        style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border-faint)" }}
      >
        <motion.div
          className="w-full max-w-[440px] py-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.heroOut }}
        >
          {/* Logo mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-md flex items-center justify-center"
                 style={{ background: "var(--accent)" }}>
              <span className="text-[#09090B] font-black text-xs">G</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              GYM<span style={{ color: "var(--accent)" }}>sos</span>
            </span>
          </div>

          <StepIndicator step={step} />

          <AnimatePresence mode="wait">
            {/* ── Step 1: Cuenta personal ─────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold tracking-tight mb-1"
                    style={{ color: "var(--text-primary)" }}>
                  Crea tu cuenta
                </h2>
                <p className="text-sm mb-7" style={{ color: "var(--text-tertiary)" }}>
                  Serás el administrador principal del gimnasio.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                           style={{ color: "var(--text-secondary)" }}>
                      Nombre completo <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => { setNombre(e.target.value); setError("") }}
                      placeholder="Carlos Ramos García"
                      required minLength={2} maxLength={100}
                      className="input-base"
                      autoComplete="name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                           style={{ color: "var(--text-secondary)" }}>
                      Correo electrónico <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError("") }}
                      placeholder="gerente@migym.com"
                      required className="input-base"
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                           style={{ color: "var(--text-secondary)" }}>
                      Contraseña <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError("") }}
                        placeholder="Mínimo 8 caracteres"
                        required minLength={8}
                        className="input-base pr-10"
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: "var(--text-tertiary)" }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                           style={{ color: "var(--text-secondary)" }}>
                      Confirmar contraseña <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => { setConfirmPassword(e.target.value); setError("") }}
                        placeholder="Repite tu contraseña"
                        required
                        className={cn("input-base pr-10",
                          confirmPassword && confirmPassword !== password ? "border-red-500/40" : "")}
                        autoComplete="new-password"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              style={{ color: "var(--text-tertiary)" }}>
                        {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== password && (
                      <p className="text-[11px] mt-1" style={{ color: "var(--red)" }}>
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
                             style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                          <AlertCircle size={14} style={{ color: "var(--red)" }} />
                          <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="button"
                    onClick={goToStep2}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: "var(--accent)", color: "#09090B" }}
                  >
                    Siguiente — Configura tu gimnasio
                    <ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Datos del gimnasio ──────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold tracking-tight mb-1"
                    style={{ color: "var(--text-primary)" }}>
                  Tu gimnasio
                </h2>
                <p className="text-sm mb-7" style={{ color: "var(--text-tertiary)" }}>
                  Configura los datos básicos. Podrás editar todo después.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                           style={{ color: "var(--text-secondary)" }}>
                      Nombre del gimnasio <span style={{ color: "var(--red)" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={gymNombre}
                      onChange={e => { setGymNombre(e.target.value); setError("") }}
                      placeholder="CrossFit Lima Norte"
                      required maxLength={150}
                      className="input-base"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-1.5"
                           style={{ color: "var(--text-secondary)" }}>
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={gymCiudad}
                      onChange={e => setGymCiudad(e.target.value)}
                      placeholder="Lima"
                      maxLength={100}
                      className="input-base"
                    />
                  </div>

                  {/* Selector de plan */}
                  <div>
                    <label className="block text-xs font-medium mb-2"
                           style={{ color: "var(--text-secondary)" }}>
                      Plan de suscripción
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLANES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setGymPlan(p.value)}
                          className="flex flex-col items-start p-3 rounded-lg text-left transition-all"
                          style={{
                            background: gymPlan === p.value ? "rgba(0,208,132,0.08)" : "var(--bg-overlay)",
                            border: `1px solid ${gymPlan === p.value ? "rgba(0,208,132,0.3)" : "var(--border-subtle)"}`,
                          }}
                        >
                          <span className="text-xs font-semibold" style={{
                            color: gymPlan === p.value ? "var(--accent)" : "var(--text-primary)"
                          }}>
                            {p.label}
                          </span>
                          <span className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>
                            {p.desc}
                          </span>
                          <span className="text-[10px] mt-1 font-medium" style={{
                            color: gymPlan === p.value ? "var(--accent)" : "var(--text-tertiary)"
                          }}>
                            {p.precio}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
                             style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                          <AlertCircle size={14} style={{ color: "var(--red)" }} />
                          <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError("") }}
                      className="h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      style={{
                        background: "var(--bg-overlay)",
                        border: "1px solid var(--border-subtle)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <ArrowLeft size={14} />
                      Atrás
                    </button>

                    <motion.button
                      type="submit"
                      disabled={submitting || !gymNombre}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                      className="flex-1 h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: "var(--accent)",
                        color: "#09090B",
                        opacity: submitting || !gymNombre ? 0.5 : 1,
                        cursor: submitting || !gymNombre ? "not-allowed" : "pointer",
                      }}
                    >
                      {submitting
                        ? <Loader2 size={15} className="animate-spin" />
                        : <><Building2 size={14} /> Crear gimnasio</>
                      }
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="mt-8 text-center text-[11px]" style={{ color: "var(--text-disabled)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}>
              Iniciar sesión
            </Link>
            {" · "}
            <Link href="/signup" className="transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}>
              Soy miembro
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
