"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/components/providers/auth-provider"
import { supabasePublic } from "@/lib/supabase"
import { fadeIn, staggerContainer } from "@/lib/motion"
import {
  ShieldCheck, ShieldX, Shield, Search, ChevronRight, Loader2,
  Plus, Minus, RotateCcw, AlertCircle, User, ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

interface Person {
  id: string
  full_name: string | null
  role_id:   string | null
  role_name: string | null
  hierarchy: number
}

interface CatPermission {
  id:          string
  description: string | null
  module:      string | null
}

interface Override {
  id:         string
  permission: string
  effect:     "grant" | "deny"
  expires_at: string | null
}

type PermSource = "role" | "grant" | "deny" | "none"

interface PermRow {
  id:          string
  description: string | null
  module:      string | null
  source:      PermSource   // reason it's in the base
  override:    Override | null
  effective:   boolean
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function groupByModule(rows: PermRow[]): Record<string, PermRow[]> {
  const groups: Record<string, PermRow[]> = {}
  for (const r of rows) {
    const m = r.module ?? "otro"
    if (!groups[m]) groups[m] = []
    groups[m].push(r)
  }
  return groups
}

function sourceBadge(row: PermRow) {
  if (row.override?.effect === "grant")
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(0,208,132,0.15)", color: "var(--accent)" }}>+override</span>
  if (row.override?.effect === "deny")
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(239,68,68,0.12)", color: "var(--red)" }}>−override</span>
  if (row.source === "role")
    return <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-overlay)", color: "var(--text-tertiary)" }}>rol base</span>
  return null
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PermisosPage() {
  const { user } = useAuth()
  const bdTenant = user?.bd_tenant_id

  // Access guard
  const [accessChecked, setAccessChecked] = useState(false)
  const [hasAccess,     setHasAccess]     = useState(false)

  // People list
  const [people,       setPeople]       = useState<Person[]>([])
  const [peopleLoading, setPeopleLoading] = useState(false)
  const [selectedId,   setSelectedId]   = useState<string | null>(null)
  const [searchPeople, setSearchPeople] = useState("")

  // Right panel
  const [catPerms,    setCatPerms]    = useState<CatPermission[]>([])
  const [rolePerms,   setRolePerms]   = useState<Set<string>>(new Set())
  const [overrides,   setOverrides]   = useState<Override[]>([])
  const [editorLoading, setEditorLoading] = useState(false)
  const [searchPerms, setSearchPerms] = useState("")
  const [expandedMods, setExpandedMods] = useState<Set<string>>(new Set())
  const [mutating,    setMutating]    = useState<string | null>(null) // permission id being acted on

  const selectedPerson = people.find(p => p.id === selectedId) ?? null

  // ── Access check ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    supabasePublic.rpc("fn_check_permission", { p_permission: "ace.perms.manage" })
      .then(({ data }) => {
        setHasAccess(data === true)
        setAccessChecked(true)
      })
  }, [user])

  // ── Load people + cat_permissions on mount ───────────────────────────────
  useEffect(() => {
    if (!hasAccess || !bdTenant) return
    setPeopleLoading(true)

    Promise.all([
      // user_roles with nested roles
      supabasePublic
        .from("user_roles")
        .select("user_id, role_id, roles(id, name, hierarchy_level)")
        .eq("tenant_id", bdTenant),
      // profiles for names
      supabasePublic
        .from("profiles")
        .select("id, full_name")
        .eq("tenant_id", bdTenant),
      // all cat_permissions
      supabasePublic
        .from("cat_permissions")
        .select("id, description, module")
        .order("module")
        .order("id"),
    ]).then(([urRes, profRes, catRes]) => {
      const profiles = profRes.data ?? []
      const userRoles = urRes.data ?? []
      const profMap = new Map(profiles.map(p => [p.id, p.full_name]))

      const built: Person[] = userRoles.map((ur: any) => ({
        id:        ur.user_id,
        full_name: profMap.get(ur.user_id) ?? null,
        role_id:   ur.role_id,
        role_name: ur.roles?.name ?? null,
        hierarchy: ur.roles?.hierarchy_level ?? 999,
      }))
      built.sort((a, b) => a.hierarchy - b.hierarchy || (a.full_name ?? "").localeCompare(b.full_name ?? ""))
      setPeople(built)
      setCatPerms(catRes.data ?? [])

      // Auto-expand all modules initially
      const mods = new Set((catRes.data ?? []).map((c: CatPermission) => c.module ?? "otro"))
      setExpandedMods(mods)
    }).finally(() => setPeopleLoading(false))
  }, [hasAccess, bdTenant])

  // ── Load role perms + overrides when person changes ──────────────────────
  const loadEditor = useCallback(async (person: Person) => {
    if (!bdTenant || !person.role_id) return
    setEditorLoading(true)
    setRolePerms(new Set())
    setOverrides([])

    const [rpRes, ovRes] = await Promise.all([
      supabasePublic
        .from("role_permissions")
        .select("permission")
        .eq("role_id", person.role_id),
      supabasePublic
        .from("user_permission_overrides")
        .select("id, permission, effect, expires_at")
        .eq("user_id", person.id)
        .eq("tenant_id", bdTenant),
    ])

    setRolePerms(new Set((rpRes.data ?? []).map((r: any) => r.permission)))
    setOverrides(ovRes.data ?? [])
    setEditorLoading(false)
  }, [bdTenant])

  useEffect(() => {
    if (!selectedPerson) return
    loadEditor(selectedPerson)
  }, [selectedPerson?.id, loadEditor])

  // ── CRUD ─────────────────────────────────────────────────────────────────
  async function addOverride(permission: string, effect: "grant" | "deny") {
    if (!selectedPerson || !bdTenant) return
    setMutating(permission)
    const { data, error } = await supabasePublic
      .from("user_permission_overrides")
      .insert({ tenant_id: bdTenant, user_id: selectedPerson.id, permission, effect })
      .select()
      .single()
    if (!error && data) setOverrides(prev => [...prev, data as Override])
    setMutating(null)
  }

  async function removeOverride(overrideId: string, permission: string) {
    setMutating(permission)
    const { error } = await supabasePublic
      .from("user_permission_overrides")
      .delete()
      .eq("id", overrideId)
    if (!error) setOverrides(prev => prev.filter(o => o.id !== overrideId))
    setMutating(null)
  }

  // ── Build perm rows ───────────────────────────────────────────────────────
  function buildRows(): PermRow[] {
    const overrideMap = new Map(overrides.map(o => [o.permission, o]))
    return catPerms.map(c => {
      const ov      = overrideMap.get(c.id) ?? null
      const inRole  = rolePerms.has(c.id)
      const source: PermSource = ov?.effect === "grant" ? "grant"
        : ov?.effect === "deny" ? "deny"
        : inRole ? "role" : "none"
      const effective = ov?.effect === "deny" ? false : inRole || ov?.effect === "grant"
      return { id: c.id, description: c.description, module: c.module, source, override: ov, effective }
    })
  }

  const allRows = buildRows()
  const filteredRows = searchPerms
    ? allRows.filter(r => r.id.includes(searchPerms.toLowerCase()) || (r.description ?? "").toLowerCase().includes(searchPerms.toLowerCase()))
    : allRows
  const groups = groupByModule(filteredRows)
  const sortedMods = Object.keys(groups).sort()

  const filteredPeople = searchPeople
    ? people.filter(p => (p.full_name ?? "").toLowerCase().includes(searchPeople.toLowerCase()) || (p.role_name ?? "").toLowerCase().includes(searchPeople.toLowerCase()))
    : people

  // ── Render ────────────────────────────────────────────────────────────────
  if (!accessChecked) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <ShieldX size={32} className="mx-auto mb-3" style={{ color: "var(--text-disabled)" }} />
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Sin acceso</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Necesitas el permiso <code className="px-1 py-0.5 rounded text-[11px]" style={{ background: "var(--bg-overlay)" }}>ace.perms.manage</code> para gestionar permisos.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT PANEL: people list ────────────────────────────────────────── */}
      <div
        className="flex flex-col w-64 shrink-0 border-r overflow-hidden"
        style={{ borderColor: "var(--border-faint)", background: "var(--bg-surface)" }}
      >
        {/* Header */}
        <div className="px-4 pt-5 pb-3">
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-disabled)" }}>
            Personas del gym
          </p>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-disabled)" }} />
            <input
              className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg outline-none"
              style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
              placeholder="Buscar persona…"
              value={searchPeople}
              onChange={e => setSearchPeople(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {peopleLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--text-disabled)" }} />
            </div>
          ) : filteredPeople.length === 0 ? (
            <p className="text-center text-xs py-6" style={{ color: "var(--text-disabled)" }}>Sin resultados</p>
          ) : filteredPeople.map(person => (
            <button
              key={person.id}
              onClick={() => setSelectedId(person.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl mb-0.5 flex items-center gap-2.5 transition-colors group",
                selectedId === person.id ? "ring-1" : "hover:bg-opacity-60"
              )}
              style={{
                background: selectedId === person.id ? "rgba(0,208,132,0.08)" : "transparent",
                borderColor: selectedId === person.id ? "var(--accent-border)" : "transparent",
                ringColor: "var(--accent-border)",
              } as React.CSSProperties}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                style={{ background: selectedId === person.id ? "rgba(0,208,132,0.2)" : "var(--bg-overlay)", color: selectedId === person.id ? "var(--accent)" : "var(--text-tertiary)" }}
              >
                {(person.full_name?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {person.full_name ?? "(sin nombre)"}
                </p>
                <p className="text-[10px] truncate" style={{ color: "var(--text-tertiary)" }}>
                  {person.role_name ?? "—"}
                </p>
              </div>
              {selectedId === person.id && (
                <ChevronRight size={12} className="ml-auto shrink-0" style={{ color: "var(--accent)" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL: editor ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedPerson ? (
          <div className="flex flex-col h-full items-center justify-center gap-3">
            <Shield size={28} style={{ color: "var(--text-disabled)" }} />
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Selecciona una persona para editar sus permisos
            </p>
          </div>
        ) : (
          <>
            {/* Person header */}
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{ borderColor: "var(--border-faint)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm"
                style={{ background: "rgba(0,208,132,0.15)", color: "var(--accent)" }}
              >
                {(selectedPerson.full_name?.[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {selectedPerson.full_name ?? "(sin nombre)"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Rol base: <span style={{ color: "var(--text-secondary)" }}>{selectedPerson.role_name ?? "—"}</span>
                </p>
              </div>
              {/* Search permissions */}
              <div className="relative ml-auto w-52">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-disabled)" }} />
                <input
                  className="w-full text-xs pl-7 pr-3 py-1.5 rounded-lg outline-none"
                  style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}
                  placeholder="Filtrar permisos…"
                  value={searchPerms}
                  onChange={e => setSearchPerms(e.target.value)}
                />
              </div>
            </div>

            {/* Permission list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {editorLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={18} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedMods.map(mod => {
                    const rows   = groups[mod]
                    const isOpen = expandedMods.has(mod)
                    const grantCount = rows.filter(r => r.override?.effect === "grant").length
                    const denyCount  = rows.filter(r => r.override?.effect === "deny").length

                    return (
                      <div key={mod} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border-faint)" }}>
                        {/* Module header */}
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-left"
                          style={{ background: "var(--bg-overlay)" }}
                          onClick={() => setExpandedMods(prev => {
                            const next = new Set(prev)
                            if (isOpen) { next.delete(mod) } else { next.add(mod) }
                            return next
                          })}
                        >
                          <ChevronDown
                            size={13}
                            className="transition-transform shrink-0"
                            style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)", color: "var(--text-disabled)" }}
                          />
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>
                            {mod}
                          </span>
                          <span className="ml-1 text-[10px]" style={{ color: "var(--text-disabled)" }}>
                            {rows.length} permisos
                          </span>
                          {grantCount > 0 && (
                            <span className="ml-1 text-[10px] font-semibold" style={{ color: "var(--accent)" }}>+{grantCount}</span>
                          )}
                          {denyCount > 0 && (
                            <span className="ml-1 text-[10px] font-semibold" style={{ color: "var(--red)" }}>−{denyCount}</span>
                          )}
                        </button>

                        {/* Rows */}
                        {isOpen && (
                          <div className="divide-y" style={{ borderColor: "var(--border-faint)" }}>
                            {rows.map(row => {
                              const isMutating = mutating === row.id
                              return (
                                <div
                                  key={row.id}
                                  className="flex items-center gap-3 px-4 py-2.5"
                                  style={{ background: row.override?.effect === "deny" ? "rgba(239,68,68,0.03)" : row.override?.effect === "grant" ? "rgba(0,208,132,0.03)" : "transparent" }}
                                >
                                  {/* Effective indicator */}
                                  <div className="shrink-0">
                                    {row.effective
                                      ? <ShieldCheck size={13} style={{ color: "var(--accent)" }} />
                                      : <ShieldX     size={13} style={{ color: "var(--text-disabled)" }} />
                                    }
                                  </div>

                                  {/* Name + description */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                                        {row.id.split(".").slice(1).join(".")}
                                      </span>
                                      {sourceBadge(row)}
                                    </div>
                                    {row.description && (
                                      <p className="text-[10px] truncate mt-0.5" style={{ color: "var(--text-disabled)" }}>
                                        {row.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    {isMutating ? (
                                      <Loader2 size={13} className="animate-spin" style={{ color: "var(--text-disabled)" }} />
                                    ) : row.override ? (
                                      // Has override → show Revert button
                                      <button
                                        onClick={() => removeOverride(row.override!.id, row.id)}
                                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors"
                                        style={{ background: "var(--bg-overlay)", color: "var(--text-tertiary)", border: "1px solid var(--border-subtle)" }}
                                        title="Revertir al comportamiento del rol"
                                      >
                                        <RotateCcw size={10} />
                                        Revertir
                                      </button>
                                    ) : (
                                      // No override → Grant + Deny buttons
                                      <>
                                        <button
                                          onClick={() => addOverride(row.id, "grant")}
                                          disabled={row.source === "role"}
                                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                          style={{ background: "rgba(0,208,132,0.1)", color: "var(--accent)", border: "1px solid rgba(0,208,132,0.2)" }}
                                          title={row.source === "role" ? "Ya incluido por el rol" : "Añadir este permiso"}
                                        >
                                          <Plus size={10} />
                                          Añadir
                                        </button>
                                        <button
                                          onClick={() => addOverride(row.id, "deny")}
                                          disabled={row.source === "none"}
                                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                          style={{ background: "rgba(239,68,68,0.08)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.18)" }}
                                          title={row.source === "none" ? "No está en el rol — nada que quitar" : "Quitar este permiso del rol"}
                                        >
                                          <Minus size={10} />
                                          Quitar
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
