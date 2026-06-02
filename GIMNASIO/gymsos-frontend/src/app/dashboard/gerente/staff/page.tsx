"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import QRCode from "react-qr-code"
import {
  Loader2, Shield, UserCog, ChevronDown, Copy, Check,
  Download, MessageCircle, Link2, AlertCircle,
  Clock, Hash, FileText, Sparkles, Plus,
} from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { usePermission } from "@/hooks/usePermissions"
import { supabase, supabasePublic } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { fadeIn, staggerContainer, scaleIn } from "@/lib/motion"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Role {
  id:              string
  name:            string
  hierarchy_level: number
}

interface GeneratedCode {
  ok:         boolean
  code_id:    string
  code:       string
  role_id:    string
  max_uses:   number | null
  expires_at: string | null
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_DESCRIPTIONS: Record<string, string> = {
  "Administrador General": "Acceso completo al sistema",
  "Supervisor":            "Supervisión de operaciones y staff",
  "Cajero":                "Registro de cobros y pagos",
  "Recepcionista":         "Control de accesos y registro de miembros",
  "Entrenador":            "Gestión de clases y evaluación de clientes",
  "Nutricionista":         "Planes nutricionales y seguimiento",
  "Miembro":               "Acceso estándar de miembro activo",
}

const MAX_USES_OPTIONS = [
  { value: "1",  label: "1 uso (único)" },
  { value: "3",  label: "3 usos" },
  { value: "5",  label: "5 usos" },
  { value: "10", label: "10 usos" },
]

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const { user } = useAuth()
  const canCreate = usePermission("gym.codigos.crear")

  // bd_tenant_id viene de GymProfile (cargado en login, cero RPCs adicionales)
  const bdTenantId = user?.bd_tenant_id ?? null

  // Data
  const [gymAccessCode, setGymAccessCode] = useState<string | null>(null)
  const [roles,         setRoles]         = useState<Role[]>([])
  const [dataLoading,   setDataLoading]   = useState(true)
  const [dataError,     setDataError]     = useState("")

  // Form
  const [roleId,       setRoleId]       = useState("")
  const [maxUses,      setMaxUses]      = useState("1")
  const [expiresAt,    setExpiresAt]    = useState("")
  const [description,  setDescription]  = useState("")
  const [generating,   setGenerating]   = useState(false)
  const [genError,     setGenError]     = useState("")

  // Result
  const [result,      setResult]      = useState<GeneratedCode | null>(null)
  const [copied,      setCopied]      = useState(false)
  const [copiedLink,  setCopiedLink]  = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  // ── Build invite link ────────────────────────────────────────────────────
  const buildInviteLink = useCallback((code: string) => {
    const base   = typeof window !== "undefined" ? window.location.origin : ""
    const params = new URLSearchParams({ staff_code: code })
    if (gymAccessCode) params.set("gym", gymAccessCode)
    return `${base}/signup?${params.toString()}`
  }, [gymAccessCode])

  // ── Load data when permission is confirmed ───────────────────────────────
  // bd_tenant_id ya viene del contexto (gym.gimnasios.tenant_id → public.tenants.id)
  // No se necesita llamar fn_current_tenant_id() aquí.
  useEffect(() => {
    if (canCreate !== true) return

    async function loadData() {
      setDataLoading(true)
      setDataError("")
      try {
        if (!bdTenantId) throw new Error("El gimnasio no está vinculado a un tenant. Ejecuta la migración 015b.")

        // Roles del sistema para este tenant
        const { data: roleData, error: rolesErr } = await supabasePublic
          .from("roles")
          .select("id, name, hierarchy_level")
          .eq("tenant_id", bdTenantId)
          .order("hierarchy_level")
        if (rolesErr) throw new Error("No se pudieron cargar los roles: " + rolesErr.message)
        setRoles(roleData ?? [])
        if (roleData?.length) setRoleId(roleData[0].id)

        // Código de acceso principal del gym (para el link de invitación)
        const { data: codeRow } = await supabase
          .from("codigos_acceso")
          .select("codigo")
          .eq("id_gimnasio", user?.tenant_id ?? "")
          .eq("activo", true)
          .limit(1)
          .single()
        setGymAccessCode(codeRow?.codigo ?? null)

      } catch (e) {
        setDataError(e instanceof Error ? e.message : "Error al cargar datos")
      } finally {
        setDataLoading(false)
      }
    }

    loadData()
  }, [canCreate, bdTenantId, user?.tenant_id])

  // ── Generate staff code ──────────────────────────────────────────────────
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!bdTenantId || !roleId) return

    setGenerating(true)
    setGenError("")
    setResult(null)

    const { data, error } = await supabasePublic.rpc("fn_create_staff_code", {
      p_tenant_id:   bdTenantId,
      p_role_id:     roleId,
      p_max_uses:    parseInt(maxUses, 10) || 1,
      p_expires_at:  expiresAt ? new Date(expiresAt).toISOString() : null,
      p_description: description.trim() || null,
    })

    setGenerating(false)

    if (error || !data?.ok) {
      setGenError(data?.error ?? error?.message ?? "Error al generar el código")
      return
    }

    setResult(data as GeneratedCode)
    setDescription("")
  }

  // ── Copy / share helpers ─────────────────────────────────────────────────
  function copyCode() {
    if (!result) return
    navigator.clipboard.writeText(result.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  function copyInviteLink() {
    if (!result) return
    navigator.clipboard.writeText(buildInviteLink(result.code))
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2200)
  }

  function shareWhatsApp() {
    if (!result) return
    const roleName = roles.find(r => r.id === result.role_id)?.name ?? "Staff"
    const link     = buildInviteLink(result.code)
    const msg      = `Hola, te invito a unirte al equipo de *${user?.tenant_name ?? "nuestro gimnasio"}* como *${roleName}*.\n\n📌 Código de acceso: *${result.code}*\n\n🔗 Regístrate aquí:\n${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank")
  }

  function downloadQR() {
    const svg = qrRef.current?.querySelector("svg")
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob    = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement("a")
    a.href        = url
    a.download    = `codigo-staff-${result?.code ?? "gymsos"}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedRole = roles.find(r => r.id === roleId)
  const todayMin     = new Date().toISOString().split("T")[0]

  // ─────────────────────────────────────────────────────────────────────────
  // Guard states
  // ─────────────────────────────────────────────────────────────────────────

  if (canCreate === null) {
    return (
      <div className="p-6 lg:p-8 min-h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent)" }} />
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Verificando permisos…</p>
        </div>
      </div>
    )
  }

  if (canCreate === false) {
    return (
      <div className="p-6 lg:p-8 min-h-full flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
          >
            <Shield size={22} style={{ color: "var(--red)" }} />
          </div>
          <p className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
            Sin acceso
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            Necesitas el permiso{" "}
            <code
              className="text-[11px] px-1.5 py-0.5 rounded-md"
              style={{ background: "var(--bg-muted)", color: "var(--text-secondary)" }}
            >
              gym.codigos.crear
            </code>{" "}
            para gestionar el staff de tu gimnasio.
          </p>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8 min-h-full max-w-[1200px]">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="mb-8"
      >
        <motion.div variants={fadeIn} className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
              >
                <UserCog size={15} style={{ color: "var(--accent)" }} />
              </div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Gestión de Staff
              </h1>
            </div>
            <p className="text-sm ml-[42px]" style={{ color: "var(--text-tertiary)" }}>
              Genera códigos de invitación para que tu equipo acceda al sistema
            </p>
          </div>

          {/* Gym info badge */}
          {user?.tenant_name && (
            <motion.div
              variants={fadeIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}
            >
              <span className="status-dot status-dot-live" />
              <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
                {user.tenant_name}
              </span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* ── Data error banner ────────────────────────────────────────────── */}
      <AnimatePresence>
        {dataError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
              <p className="text-sm" style={{ color: "var(--red)" }}>{dataError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

        {/* ── LEFT: Form ───────────────────────────────────────────────── */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="surface rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--bg-muted)" }}>
              <Plus size={11} style={{ color: "var(--text-tertiary)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Crear código de invitación
            </p>
          </div>

          {dataLoading ? (
            // Skeleton
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="skeleton h-3 rounded w-24" />
                <div className="skeleton h-9 rounded-lg w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="skeleton h-3 rounded w-16" />
                  <div className="skeleton h-9 rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <div className="skeleton h-3 rounded w-16" />
                  <div className="skeleton h-9 rounded-lg" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="skeleton h-3 rounded w-24" />
                <div className="skeleton h-9 rounded-lg w-full" />
              </div>
              <div className="skeleton h-10 rounded-lg w-full" />
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">

              {/* Role selector */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Rol del staff <span style={{ color: "var(--red)" }}>*</span>
                </label>
                <div className="relative">
                  <select
                    value={roleId}
                    onChange={e => setRoleId(e.target.value)}
                    required
                    className="input-base"
                    style={{ appearance: "none", paddingRight: "32px" }}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={13}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-tertiary)" }}
                  />
                </div>
                {selectedRole && (
                  <p className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: "var(--text-disabled)" }}>
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent)", opacity: 0.6 }}
                    />
                    {ROLE_DESCRIPTIONS[selectedRole.name] ?? `Nivel jerárquico ${selectedRole.hierarchy_level}`}
                  </p>
                )}
              </div>

              {/* Max uses + Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    <Hash size={10} className="inline mr-1 align-middle" />
                    Máx. usos
                  </label>
                  <div className="relative">
                    <select
                      value={maxUses}
                      onChange={e => setMaxUses(e.target.value)}
                      className="input-base"
                      style={{ appearance: "none", paddingRight: "28px" }}
                    >
                      {MAX_USES_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    <Clock size={10} className="inline mr-1 align-middle" />
                    Expira (opcional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={e => setExpiresAt(e.target.value)}
                    min={todayMin}
                    className="input-base"
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  <FileText size={10} className="inline mr-1 align-middle" />
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ej: Para Ana — recepcionista turno mañana"
                  maxLength={120}
                  className="input-base"
                />
                <p className="text-[11px] mt-1" style={{ color: "var(--text-disabled)" }}>
                  Nota interna para identificar este código
                </p>
              </div>

              {/* Generation error */}
              <AnimatePresence>
                {genError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                      style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}
                    >
                      <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: "var(--red)" }} />
                      <p className="text-xs" style={{ color: "var(--red)" }}>{genError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={generating || !roleId || !bdTenantId}
                whileTap={!generating && !!roleId ? { scale: 0.98 } : {}}
                className="w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: "var(--accent)",
                  color:      "#09090B",
                  opacity:    (generating || !roleId || !bdTenantId) ? 0.5 : 1,
                  cursor:     (generating || !roleId || !bdTenantId) ? "not-allowed" : "pointer",
                }}
              >
                {generating
                  ? <><Loader2 size={14} className="animate-spin" /> Generando…</>
                  : <><Sparkles size={14} /> Generar código</>
                }
              </motion.button>
            </form>
          )}
        </motion.div>

        {/* ── RIGHT: Result / empty state ──────────────────────────────── */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="surface rounded-2xl p-6"
            >
              {/* Success header */}
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent)" }}
                >
                  <Check size={10} strokeWidth={3} style={{ color: "#09090B" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  Código generado con éxito
                </p>
              </div>

              {/* Code display */}
              <div className="mb-5">
                <div
                  className="flex items-center justify-between px-5 py-4 rounded-xl mb-3"
                  style={{ background: "var(--bg-muted)", border: "1px solid var(--border-default)" }}
                >
                  <span
                    className="font-black tracking-[0.22em] text-2xl"
                    style={{
                      color:      "var(--accent)",
                      fontFamily: "ui-monospace, 'Cascadia Code', 'Fira Code', monospace",
                    }}
                  >
                    {result.code}
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: copied ? "rgba(0,208,132,0.12)" : "var(--bg-overlay)",
                      color:      copied ? "var(--accent)"        : "var(--text-secondary)",
                      border:     `1px solid ${copied ? "var(--accent-border)" : "var(--border-default)"}`,
                    }}
                    aria-label="Copiar código"
                  >
                    {copied
                      ? <><Check size={11} strokeWidth={2.5} /> Copiado</>
                      : <><Copy size={11} /> Copiar</>
                    }
                  </motion.button>
                </div>

                {/* Metadata badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-md font-medium"
                    style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}
                  >
                    {roles.find(r => r.id === result.role_id)?.name ?? "Rol"}
                  </span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-md"
                    style={{ background: "var(--bg-muted)", color: "var(--text-tertiary)" }}
                  >
                    {result.max_uses === 1 ? "1 uso" : `${result.max_uses} usos`}
                  </span>
                  {result.expires_at && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md"
                      style={{ background: "var(--bg-muted)", color: "var(--text-tertiary)" }}
                    >
                      Vence {new Date(result.expires_at).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  )}
                  {!result.expires_at && (
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-md"
                      style={{ background: "var(--bg-muted)", color: "var(--text-disabled)" }}
                    >
                      Sin expiración
                    </span>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-5" ref={qrRef}>
                <div
                  className="p-4 rounded-xl"
                  style={{ background: "#09090B", border: "1px solid var(--border-default)" }}
                >
                  <QRCode
                    value={buildInviteLink(result.code)}
                    size={164}
                    bgColor="#09090B"
                    fgColor="#00D084"
                    level="M"
                  />
                </div>
              </div>
              <p className="text-center text-[11px] mb-5" style={{ color: "var(--text-disabled)" }}>
                El QR lleva al formulario de registro pre-cargado con este código
              </p>

              {/* Action buttons */}
              <div className="space-y-2">
                <button
                  onClick={downloadQR}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 h-9 rounded-lg",
                    "text-xs font-medium transition-colors",
                  )}
                  style={{
                    background: "var(--bg-muted)",
                    color:      "var(--text-secondary)",
                    border:     "1px solid var(--border-subtle)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-default)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                >
                  <Download size={13} />
                  Descargar QR (.svg)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={shareWhatsApp}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: "rgba(37,211,102,0.08)",
                      color:      "#25D366",
                      border:     "1px solid rgba(37,211,102,0.2)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(37,211,102,0.14)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(37,211,102,0.08)")}
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </button>

                  <button
                    onClick={copyInviteLink}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: copiedLink ? "rgba(0,208,132,0.08)" : "var(--bg-muted)",
                      color:      copiedLink ? "var(--accent)"        : "var(--text-secondary)",
                      border:     `1px solid ${copiedLink ? "var(--accent-border)" : "var(--border-subtle)"}`,
                    }}
                    onMouseEnter={e => { if (!copiedLink) e.currentTarget.style.borderColor = "var(--border-default)" }}
                    onMouseLeave={e => { if (!copiedLink) e.currentTarget.style.borderColor = "var(--border-subtle)" }}
                  >
                    {copiedLink
                      ? <><Check size={11} strokeWidth={2.5} /> Copiado</>
                      : <><Link2 size={11} /> Copiar enlace</>
                    }
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="surface rounded-2xl p-6 flex flex-col items-center justify-center"
              style={{ minHeight: "320px" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "var(--bg-muted)" }}
              >
                <UserCog size={22} style={{ color: "var(--text-disabled)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                El código aparecerá aquí
              </p>
              <p className="text-xs text-center max-w-[200px] leading-relaxed" style={{ color: "var(--text-disabled)" }}>
                Selecciona un rol, configura las opciones y presiona <em>Generar código</em>
              </p>

              {/* Flow hint */}
              <div
                className="mt-6 px-4 py-3 rounded-xl max-w-[260px]"
                style={{ background: "var(--bg-muted)", border: "1px solid var(--border-faint)" }}
              >
                <p className="text-[10px] font-medium uppercase tracking-wider mb-2.5" style={{ color: "var(--text-disabled)" }}>
                  Flujo de invitación
                </p>
                {[
                  "Admin genera el código",
                  "Comparte por WhatsApp o QR",
                  "Staff se registra con el código",
                  "Permisos asignados automáticamente",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5 last:mb-0">
                    <span
                      className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5"
                      style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{step}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
