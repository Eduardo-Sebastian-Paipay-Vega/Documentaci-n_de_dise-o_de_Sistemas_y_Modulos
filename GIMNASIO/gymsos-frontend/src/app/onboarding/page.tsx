"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, AlertCircle,
  CheckCircle2, Building2, User, Upload, X,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { easings } from "@/lib/motion"

// ─────────────────────────────────────────────────────────────────────────────
// CAMPOS QUE MAPEAN A LA BD (gym schema — migración 008):
//
// gym.usuarios:
//   nombre*, email*, telefono, documento (DNI), fecha_nacimiento,
//   genero, foto_url, cargo, id_gimnasio*, rol*, estado*
//
// gym.gimnasios:
//   nombre*, ruc, ciudad, pais, direccion, telefono, email,
//   plan_suscripcion*, estado*, logo_url
// ─────────────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3

const PLANES = [
  { value: "pequeno",    label: "Pequeño",    desc: "Hasta 100 miembros",       precio: "S/. 99/mes"  },
  { value: "mediano",    label: "Mediano",    desc: "Hasta 500 miembros",       precio: "S/. 199/mes" },
  { value: "grande",     label: "Grande",     desc: "Hasta 2,000 miembros",     precio: "S/. 349/mes" },
  { value: "enterprise", label: "Enterprise", desc: "Sin límite · Multi-sede",  precio: "A consultar" },
]

// ── Indicador de progreso ─────────────────────────────────────────────────────
function StepBar({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {([1, 2] as const).map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
            style={{
              background: step >= n ? "var(--accent)" : "var(--bg-overlay)",
              color: step >= n ? "#09090B" : "var(--text-disabled)",
              border: `1px solid ${step >= n ? "var(--accent)" : "var(--border-subtle)"}`,
            }}
          >
            {step > n ? <CheckCircle2 size={13} /> : n}
          </div>
          <span className="text-xs font-medium" style={{ color: step === n ? "var(--text-primary)" : "var(--text-disabled)" }}>
            {n === 1 ? "Tu cuenta" : "Tu gimnasio"}
          </span>
          {n < 2 && (
            <div className="w-8 h-px mx-1" style={{ background: step > n ? "var(--accent)" : "var(--border-faint)" }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Componente de campo ──────────────────────────────────────────────────────
function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
        {label} {required && <span style={{ color: "var(--red)" }}>*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] mt-1" style={{ color: "var(--text-disabled)" }}>{hint}</p>}
    </div>
  )
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // ── Step 1: datos del dueño ──────────────────────────────────────────────
  const [nombre,          setNombre]          = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPass,     setConfirmPass]     = useState("")
  const [telefono,        setTelefono]        = useState("")
  const [documento,       setDocumento]       = useState("")  // DNI Perú: 8 dígitos
  const [fechaNac,        setFechaNac]        = useState("")
  const [genero,          setGenero]          = useState<"M"|"F"|"Otro"|"">("")
  const [cargo,           setCargo]           = useState("")
  const [fotoFile,        setFotoFile]        = useState<File | null>(null)
  const [fotoPreview,     setFotoPreview]     = useState<string>("")
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Step 2: datos del gimnasio ───────────────────────────────────────────
  const [gymNombre,    setGymNombre]    = useState("")
  const [gymRuc,       setGymRuc]       = useState("")
  const [gymDireccion, setGymDireccion] = useState("")
  const [gymCiudad,    setGymCiudad]    = useState("")
  const [gymPais,      setGymPais]      = useState("Perú")
  const [gymTelefono,  setGymTelefono]  = useState("")
  const [gymEmail,     setGymEmail]     = useState("")
  const [gymPlan,      setGymPlan]      = useState("mediano")

  // ── Estado global ────────────────────────────────────────────────────────
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState("")
  const [gymCode,     setGymCode]     = useState("")
  const [gymCreado,   setGymCreado]   = useState("")
  const [needsEmail,  setNeedsEmail]  = useState(false)

  // ── Foto preview ──────────────────────────────────────────────────────────
  const handleFotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError("La foto no puede superar 5 MB."); return }
    setFotoFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    setError("")
  }, [])

  // ── Validación step 1 ────────────────────────────────────────────────────
  function validateStep1(): string {
    if (!nombre.trim())  return "El nombre completo es obligatorio."
    if (!email.trim())   return "El correo electrónico es obligatorio."
    if (password.length < 8) return "La contraseña debe tener mínimo 8 caracteres."
    if (password !== confirmPass) return "Las contraseñas no coinciden."
    if (documento && !/^\d{8}$/.test(documento)) return "El DNI debe tener exactamente 8 dígitos."
    return ""
  }

  // ── Validación step 2 ────────────────────────────────────────────────────
  function validateStep2(): string {
    if (!gymNombre.trim()) return "El nombre del gimnasio es obligatorio."
    if (gymRuc && !/^\d{11}$/.test(gymRuc)) return "El RUC debe tener exactamente 11 dígitos."
    return ""
  }

  function goToStep2() {
    const err = validateStep1()
    if (err) { setError(err); return }
    setError("")
    setStep(2)
  }

  // ── Subir foto a Supabase Storage ─────────────────────────────────────────
  async function uploadFoto(userId: string): Promise<string | null> {
    if (!fotoFile) return null
    try {
      const ext  = fotoFile.name.split(".").pop() ?? "jpg"
      const path = `${userId}/avatar.${ext}`
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, fotoFile, { upsert: true })
      if (upErr) return null
      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      return data.publicUrl
    } catch {
      return null
    }
  }

  // ── Obtener código del gimnasio ───────────────────────────────────────────
  async function fetchGymCode(userId: string): Promise<void> {
    // Esperar que el trigger de PostgreSQL termine
    await new Promise(r => setTimeout(r, 1200))

    try {
      // 1. Obtener el id_gimnasio del perfil creado por el trigger
      const { data: perfil } = await supabase
        .from("usuarios")
        .select("id_gimnasio")
        .eq("id_usuario", userId)
        .single()

      if (!perfil?.id_gimnasio) {
        setGymCode("—")
        return
      }

      // 2. Buscar el código en gym.codigos_acceso (tabla separada con tenant isolation)
      const { data: codigo } = await supabase
        .from("codigos_acceso")
        .select("codigo")
        .eq("id_gimnasio", perfil.id_gimnasio)
        .eq("activo", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      setGymCode(codigo?.codigo ?? "—")
    } catch {
      setGymCode("—")
    }
  }

  // ── Submit final ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const err = validateStep2()
    if (err) { setError(err); return }
    setSubmitting(true)
    setError("")

    try {
      // signUp con TODOS los metadatos → el trigger handle_new_user
      // (migración 007 + 008) crea gym + codigos_acceso + perfil gerente
      const { data, error: authErr } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            // Datos del dueño (→ gym.usuarios)
            nombre:           nombre.trim(),
            telefono:         telefono.trim()    || null,
            documento:        documento.trim()   || null,
            fecha_nacimiento: fechaNac           || null,
            genero:           genero             || null,
            cargo:            cargo.trim()       || "Gerente General",
            rol:              "gerente",

            // Datos del gimnasio (→ gym.gimnasios + gym.codigos_acceso)
            gym_nombre:    gymNombre.trim(),
            gym_ruc:       gymRuc.trim()       || null,
            gym_ciudad:    gymCiudad.trim()    || "Lima",
            gym_pais:      gymPais.trim()      || "Perú",
            gym_direccion: gymDireccion.trim() || null,
            gym_telefono:  gymTelefono.trim()  || null,
            gym_email:     gymEmail.trim()     || null,
            gym_plan:      gymPlan,
          },
        },
      })

      if (authErr) {
        setError(
          authErr.message.includes("already registered")
            ? "Ya existe una cuenta con ese correo electrónico."
            : authErr.message
        )
        return
      }

      if (!data.user) {
        setError("No se pudo crear la cuenta. Intenta de nuevo.")
        return
      }

      setGymCreado(gymNombre.trim())

      if (data.session) {
        // Auto-confirmado: subir foto (si la eligió) y obtener código
        const fotoUrl = await uploadFoto(data.user.id)
        if (fotoUrl) {
          await supabase
            .from("usuarios")
            .update({ foto_url: fotoUrl })
            .eq("id_usuario", data.user.id)
        }
        await fetchGymCode(data.user.id)
        setNeedsEmail(false)
      } else {
        // Email confirmation pendiente
        setNeedsEmail(true)
      }

      setStep(3)
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  // ── Pantalla de éxito (Step 3) ────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12"
           style={{ background: "var(--bg-base)" }}>
        <motion.div
          className="max-w-lg w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easings.heroOut }}
        >
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
               style={{ background: "rgba(0,208,132,0.1)", border: "1px solid rgba(0,208,132,0.2)" }}>
            <CheckCircle2 size={36} style={{ color: "var(--accent)" }} />
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-2"
              style={{ color: "var(--text-primary)" }}>
            {needsEmail ? "¡Confirma tu correo!" : "¡Gimnasio creado!"}
          </h2>

          {needsEmail ? (
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-tertiary)" }}>
              Enviamos un correo a <strong style={{ color: "var(--text-secondary)" }}>{email}</strong>.
              Confírmalo y luego inicia sesión — tu gimnasio{" "}
              <strong style={{ color: "var(--accent)" }}>{gymCreado}</strong> ya está registrado.
            </p>
          ) : (
            <>
              <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
                <strong style={{ color: "var(--accent)" }}>{gymCreado}</strong> está activo.
                Comparte el código con tu equipo para que se registren en{" "}
                <span style={{ color: "var(--text-secondary)" }}>/signup</span>.
              </p>

              {/* Código de acceso */}
              <div className="mx-auto mb-8 px-8 py-5 rounded-2xl inline-block"
                   style={{ background: "rgba(0,208,132,0.06)", border: "1px solid rgba(0,208,132,0.25)" }}>
                <p className="text-xs font-medium uppercase tracking-widest mb-2"
                   style={{ color: "var(--text-tertiary)" }}>
                  Código de acceso del gimnasio
                </p>
                <p className="text-4xl font-black tracking-[0.3em]"
                   style={{ color: "var(--accent)" }}>
                  {gymCode}
                </p>
                <p className="text-[11px] mt-2" style={{ color: "var(--text-disabled)" }}>
                  Tu equipo lo ingresa en /signup para unirse
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
              Ir al Login <ArrowRight size={15} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Formulario (Steps 1 y 2) ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Panel izquierdo */}
      <div className="hidden lg:flex lg:w-[44%] relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 line-grid opacity-100 pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
             style={{ background: "radial-gradient(circle, rgba(0,208,132,0.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
               style={{ background: "var(--accent)" }}>
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
          <h1 className="font-black leading-[1.02] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.2rem, 4vw, 3.8rem)", color: "var(--text-primary)" }}>
            Tu gimnasio,{" "}
            <span style={{ color: "var(--accent)" }}>digitalizado.</span>
          </h1>
          <p className="text-sm leading-relaxed max-w-sm" style={{ color: "var(--text-tertiary)" }}>
            Registra tu negocio en minutos. Obtén tu código de acceso y empieza
            a gestionar miembros, clases y pagos desde el día uno.
          </p>
          <div className="mt-8 flex flex-col gap-2.5">
            {["Dashboard con KPIs en tiempo real", "Acceso QR para miembros", "Predicción de abandono con IA", "Multi-sede · Multi-rol"].map(f => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                     style={{ background: "rgba(0,208,132,0.15)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                </div>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <span className="text-xs" style={{ color: "var(--text-disabled)" }}>GYMsos v2.0 · 2026</span>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-start justify-center px-6 py-10 overflow-y-auto"
           style={{ background: "var(--bg-surface)", borderLeft: "1px solid var(--border-faint)" }}>
        <div className="w-full max-w-[460px] py-4">
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

          <StepBar step={step} />

          <AnimatePresence mode="wait">

            {/* ── STEP 1: Datos del dueño ─────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                <h2 className="text-2xl font-bold tracking-tight mb-1"
                    style={{ color: "var(--text-primary)" }}>Tu cuenta</h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
                  Serás el administrador principal. Todos los campos con * son obligatorios.
                </p>

                <div className="space-y-4">
                  {/* Foto de perfil */}
                  <Field label="Foto de perfil">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center shrink-0 cursor-pointer"
                        style={{ background: "var(--bg-overlay)", border: "2px dashed var(--border-subtle)" }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {fotoPreview
                          ? <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
                          : <User size={24} style={{ color: "var(--text-disabled)" }} />
                        }
                      </div>
                      <div className="flex flex-col gap-1">
                        <button type="button" onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                          <Upload size={12} /> Subir foto
                        </button>
                        {fotoFile && (
                          <button type="button" onClick={() => { setFotoFile(null); setFotoPreview("") }}
                            className="inline-flex items-center gap-1 text-[11px]"
                            style={{ color: "var(--text-disabled)" }}>
                            <X size={10} /> Quitar
                          </button>
                        )}
                        <span className="text-[10px]" style={{ color: "var(--text-disabled)" }}>
                          JPG, PNG · máx 5 MB
                        </span>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*"
                             onChange={handleFotoChange} className="hidden" />
                    </div>
                  </Field>

                  {/* Nombre + Cargo en fila */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nombre completo" required>
                      <input type="text" value={nombre}
                        onChange={e => { setNombre(e.target.value); setError("") }}
                        placeholder="Carlos Ramos" required minLength={2} maxLength={100}
                        className="input-base" autoComplete="name" />
                    </Field>
                    <Field label="Cargo" hint="Ej: Gerente General">
                      <input type="text" value={cargo}
                        onChange={e => setCargo(e.target.value)}
                        placeholder="Gerente General" maxLength={100}
                        className="input-base" />
                    </Field>
                  </div>

                  {/* Email */}
                  <Field label="Correo electrónico" required>
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError("") }}
                      placeholder="gerente@migym.com" required
                      className="input-base" autoComplete="email" />
                  </Field>

                  {/* Contraseña */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Contraseña" required>
                      <div className="relative">
                        <input type={showPass ? "text" : "password"} value={password}
                          onChange={e => { setPassword(e.target.value); setError("") }}
                          placeholder="Mín. 8 caracteres" required minLength={8}
                          className="input-base pr-9" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-tertiary)" }}>
                          {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </Field>
                    <Field label="Confirmar contraseña" required>
                      <div className="relative">
                        <input type={showConfirm ? "text" : "password"} value={confirmPass}
                          onChange={e => { setConfirmPass(e.target.value); setError("") }}
                          placeholder="Repite" required
                          className={cn("input-base pr-9",
                            confirmPass && confirmPass !== password ? "border-red-500/40" : "")}
                          autoComplete="new-password" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                          style={{ color: "var(--text-tertiary)" }}>
                          {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                      {confirmPass && confirmPass !== password && (
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--red)" }}>No coinciden</p>
                      )}
                    </Field>
                  </div>

                  {/* Teléfono + DNI */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Teléfono" hint="Ej: +51 987 654 321">
                      <input type="tel" value={telefono}
                        onChange={e => setTelefono(e.target.value)}
                        placeholder="+51 987 654 321" maxLength={20}
                        className="input-base" autoComplete="tel" />
                    </Field>
                    <Field label="DNI" hint="8 dígitos">
                      <input type="text" value={documento}
                        onChange={e => { setDocumento(e.target.value.replace(/\D/g, "")); setError("") }}
                        placeholder="12345678" maxLength={8}
                        className="input-base" inputMode="numeric" />
                    </Field>
                  </div>

                  {/* Fecha nacimiento + Género */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Fecha de nacimiento">
                      <input type="date" value={fechaNac}
                        onChange={e => setFechaNac(e.target.value)}
                        max={new Date(Date.now() - 18 * 365.25 * 86400000).toISOString().split("T")[0]}
                        className="input-base" style={{ colorScheme: "dark" }} />
                    </Field>
                    <Field label="Género">
                      <select value={genero} onChange={e => setGenero(e.target.value as typeof genero)}
                        className="input-base" style={{ appearance: "none" }}>
                        <option value="">Sin especificar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </Field>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
                             style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                          <AlertCircle size={13} style={{ color: "var(--red)" }} />
                          <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button type="button" onClick={goToStep2} whileTap={{ scale: 0.98 }}
                    className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ background: "var(--accent)", color: "#09090B" }}>
                    Siguiente — Configura tu gimnasio <ArrowRight size={14} />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Datos del gimnasio ──────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.22 }}>

                <h2 className="text-2xl font-bold tracking-tight mb-1"
                    style={{ color: "var(--text-primary)" }}>Tu gimnasio</h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
                  Datos de tu negocio. Podrás editarlos desde la configuración del dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nombre + RUC */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nombre del gimnasio" required>
                      <input type="text" value={gymNombre}
                        onChange={e => { setGymNombre(e.target.value); setError("") }}
                        placeholder="CrossFit Lima Norte" required maxLength={150}
                        className="input-base" autoFocus />
                    </Field>
                    <Field label="RUC" hint="11 dígitos — razón social">
                      <input type="text" value={gymRuc}
                        onChange={e => { setGymRuc(e.target.value.replace(/\D/g, "")); setError("") }}
                        placeholder="20123456789" maxLength={11}
                        className="input-base" inputMode="numeric" />
                    </Field>
                  </div>

                  {/* Dirección */}
                  <Field label="Dirección">
                    <input type="text" value={gymDireccion}
                      onChange={e => setGymDireccion(e.target.value)}
                      placeholder="Av. Javier Prado Este 123, San Isidro" maxLength={255}
                      className="input-base" />
                  </Field>

                  {/* Ciudad + País */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ciudad">
                      <input type="text" value={gymCiudad}
                        onChange={e => setGymCiudad(e.target.value)}
                        placeholder="Lima" maxLength={100}
                        className="input-base" />
                    </Field>
                    <Field label="País">
                      <input type="text" value={gymPais}
                        onChange={e => setGymPais(e.target.value)}
                        placeholder="Perú" maxLength={100}
                        className="input-base" />
                    </Field>
                  </div>

                  {/* Teléfono + Email del gym */}
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Teléfono del gym">
                      <input type="tel" value={gymTelefono}
                        onChange={e => setGymTelefono(e.target.value)}
                        placeholder="+51 01 234-5678" maxLength={20}
                        className="input-base" />
                    </Field>
                    <Field label="Email del gym">
                      <input type="email" value={gymEmail}
                        onChange={e => setGymEmail(e.target.value)}
                        placeholder="info@migym.com"
                        className="input-base" />
                    </Field>
                  </div>

                  {/* Plan */}
                  <Field label="Plan de suscripción" required>
                    <div className="grid grid-cols-2 gap-2">
                      {PLANES.map(p => (
                        <button key={p.value} type="button" onClick={() => setGymPlan(p.value)}
                          className="flex flex-col items-start p-3 rounded-lg text-left transition-all"
                          style={{
                            background: gymPlan === p.value ? "rgba(0,208,132,0.08)" : "var(--bg-overlay)",
                            border: `1px solid ${gymPlan === p.value ? "rgba(0,208,132,0.3)" : "var(--border-subtle)"}`,
                          }}>
                          <span className="text-xs font-semibold"
                                style={{ color: gymPlan === p.value ? "var(--accent)" : "var(--text-primary)" }}>
                            {p.label}
                          </span>
                          <span className="text-[10px] mt-0.5" style={{ color: "var(--text-disabled)" }}>{p.desc}</span>
                          <span className="text-[10px] mt-1 font-medium"
                                style={{ color: gymPlan === p.value ? "var(--accent)" : "var(--text-tertiary)" }}>
                            {p.precio}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Field>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg"
                             style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                          <AlertCircle size={13} style={{ color: "var(--red)" }} />
                          <p className="text-xs" style={{ color: "var(--red)" }}>{error}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setStep(1); setError("") }}
                      className="h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                      style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)", color: "var(--text-tertiary)" }}>
                      <ArrowLeft size={14} /> Atrás
                    </button>
                    <motion.button type="submit"
                      disabled={submitting || !gymNombre}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                      className="flex-1 h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                      style={{
                        background: "var(--accent)", color: "#09090B",
                        opacity: submitting || !gymNombre ? 0.5 : 1,
                        cursor: submitting || !gymNombre ? "not-allowed" : "pointer",
                      }}>
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

          <p className="mt-8 text-center text-[11px]" style={{ color: "var(--text-disabled)" }}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="transition-colors" style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}>
              Iniciar sesión
            </Link>
            {" · "}
            <Link href="/signup" className="transition-colors" style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}>
              Soy miembro (tengo un código)
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
