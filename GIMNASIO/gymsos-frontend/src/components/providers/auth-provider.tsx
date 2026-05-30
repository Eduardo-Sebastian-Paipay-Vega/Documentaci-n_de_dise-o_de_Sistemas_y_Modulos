"use client"

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { supabase, supabasePublic } from "@/lib/supabase"

// ─────────────────────────────────────────────────────────────────────────────
// Arquitectura BD Maestra:
//   public.tenants   → el gimnasio como tenant
//   public.profiles  → el usuario autenticado
//   public.sedes     → sucursales del gimnasio
//   gym.*            → dominio GYMsos
// ─────────────────────────────────────────────────────────────────────────────

export type Rol =
  | "gerente" | "recepcionista" | "entrenador"
  | "nutricionista" | "miembro" | "cliente" | "admin"

export interface GymProfile {
  // De public.profiles
  id:              string
  tenant_id:       string | null
  full_name:       string | null
  tipo_documento:  string | null
  numero_documento: string | null
  genero:          string | null
  foto_url:        string | null
  cargo:           string | null
  // De auth.users
  email:           string
  // De public.tenants (join)
  tenant_name?:    string
  tenant_plan?:    string
  // Rol en este tenant (de public.user_roles_sedes o metadata de auth)
  rol:             Rol
}

const ROL_ROUTES: Record<Rol, string> = {
  gerente:       "/dashboard/gerente",
  recepcionista: "/dashboard/recepcionista",
  entrenador:    "/dashboard/entrenador",
  nutricionista: "/dashboard/nutricionista",
  miembro:       "/dashboard/miembro",
  cliente:       "/dashboard/cliente",
  admin:         "/dashboard/gerente",
}

interface AuthContextValue {
  user:    GymProfile | null
  loading: boolean
  login:   (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout:  () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Helpers ───────────────────────────────────────────────────────────────────

async function fetchProfile(authUserId: string, email: string): Promise<GymProfile | null> {
  // 1. Obtener profile de public.profiles
  const { data: profile, error } = await supabasePublic
    .from("profiles")
    .select("id, tenant_id, full_name, tipo_documento, numero_documento, genero, foto_url, cargo")
    .eq("id", authUserId)
    .single()

  if (error || !profile) return null

  // 2. Obtener tenant si existe
  let tenant_name: string | undefined
  let tenant_plan: string | undefined
  if (profile.tenant_id) {
    const { data: tenant } = await supabasePublic
      .from("tenants")
      .select("name, plan_id")
      .eq("id", profile.tenant_id)
      .single()
    tenant_name = tenant?.name
    tenant_plan = tenant?.plan_id
  }

  // 3. Determinar rol (desde user_roles_sedes o metadata de auth)
  let rol: Rol = "miembro"
  if (profile.tenant_id) {
    const { data: roles } = await supabasePublic
      .from("user_roles_sedes")
      .select("roles(name)")
      .eq("user_id", authUserId)
      .eq("tenant_id", profile.tenant_id)
      .limit(1)

    const roleName = (roles?.[0]?.roles as { name?: string } | null)?.name
    if (roleName && isValidRol(roleName)) rol = roleName as Rol
  }

  return {
    id:               profile.id,
    tenant_id:        profile.tenant_id,
    full_name:        profile.full_name,
    tipo_documento:   profile.tipo_documento,
    numero_documento: profile.numero_documento,
    genero:           profile.genero,
    foto_url:         profile.foto_url,
    cargo:            profile.cargo,
    email,
    tenant_name,
    tenant_plan,
    rol,
  }
}

function isValidRol(value: string): boolean {
  return ["gerente","recepcionista","entrenador","nutricionista","miembro","cliente","admin"].includes(value)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<GymProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router                = useRouter()

  useEffect(() => {
    // Cargar sesión existente
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const profile = await fetchProfile(data.session.user.id, data.session.user.email ?? "")
        setUser(profile)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "")
        setUser(profile)
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return {
          ok:    false,
          error: error.message === "Invalid login credentials"
            ? "Credenciales incorrectas. Verifica tu email y contraseña."
            : error.message,
        }
      }

      if (!data.user) return { ok: false, error: "Error al iniciar sesión." }

      const profile = await fetchProfile(data.user.id, data.user.email ?? "")

      if (!profile) {
        await supabase.auth.signOut()
        return { ok: false, error: "Perfil no encontrado. Completa tu registro." }
      }

      if (!profile.tenant_id) {
        // Autenticado pero sin gym asignado → ir a onboarding
        router.push("/onboarding")
        return { ok: true }
      }

      setUser(profile)
      document.cookie = `gymsos_rol=${profile.rol}; path=/; max-age=86400; SameSite=Lax`
      router.push(ROL_ROUTES[profile.rol])
      return { ok: true }
    },
    [router],
  )

  const logout = useCallback(async () => {
    setUser(null)
    document.cookie = "gymsos_rol=; path=/; max-age=0"
    await supabase.auth.signOut()
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}

export { ROL_ROUTES }
