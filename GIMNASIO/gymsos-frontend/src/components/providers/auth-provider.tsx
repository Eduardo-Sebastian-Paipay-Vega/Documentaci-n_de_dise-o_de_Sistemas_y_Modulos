"use client"

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { supabase, supabasePublic } from "@/lib/supabase"

// ─────────────────────────────────────────────────────────────────────────────
// Arquitectura BD Maestra (multi-sistema, multi-tenant):
//   auth.users        → identidad Supabase (nunca se toca directamente)
//   public.profiles   → perfil universal BD Maestra (1:1 con auth.users)
//                        existe para GYM, ONG, RRHH, etc.
//   gym.usuarios      → perfil operativo del módulo gym únicamente
//                        quién eres DENTRO del gimnasio: rol, cargo, gym asignado
//   gym.gimnasios     → el tenant del gym (id_gimnasio)
//
// Flujo de fetchProfile:
//   1. public.profiles → verifica que la cuenta existe en BD Maestra
//   2. gym.usuarios    → enriquece con datos del módulo gym
//   Si (1) falla → cuenta no configurada → sign out
//   Si (2) falla → usuario de BD Maestra sin acceso gym → redirige a onboarding
// ─────────────────────────────────────────────────────────────────────────────

export type Rol =
  | "gerente" | "recepcionista" | "entrenador"
  | "nutricionista" | "miembro" | "cliente" | "admin"

export interface GymProfile {
  // Identidad (auth.users)
  id:            string        // = auth.users.id
  email:         string

  // Perfil (gym.usuarios)
  full_name:     string | null // = gym.usuarios.nombre
  tenant_id:     string | null // = gym.gimnasios.id_gimnasio  — gym UUID (para queries gym schema)
  bd_tenant_id:  string | null // = public.tenants.id          — BD Maestra UUID (para RPCs RBAC)
  foto_url:      string | null
  cargo:         string | null
  telefono:      string | null
  documento:     string | null
  genero:        string | null
  rol:           Rol

  // Gym info (gym.gimnasios join)
  tenant_name?:  string        // = gym.gimnasios.nombre
  tenant_plan?:  string        // = gym.gimnasios.plan_suscripcion
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

export interface LoginResult {
  ok:      boolean
  error?:  string
  // 'choose_path'  → cuenta BD Maestra sin gym asignado → mostrar modal dueño/miembro
  // 'wrong_system' → cuenta pertenece a otro sistema (ONG, RRHH, etc.)
  action?: "choose_path" | "wrong_system"
}

interface AuthContextValue {
  user:              GymProfile | null
  loading:           boolean
  // ── RBAC (migración 016) ──────────────────────────────────────────────────
  permissions:       string[]       // lista de permission IDs cacheada para la sesión
  hasPermission:     (p: string) => boolean  // verificación instantánea sin RPC
  reloadPermissions: () => Promise<void>     // fuerza recarga desde Supabase
  // ─────────────────────────────────────────────────────────────────────────
  login:   (email: string, password: string) => Promise<LoginResult>
  logout:  () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── fetchProfile: gym.usuarios + gym.gimnasios → GymProfile ─────────────────
// Pre-condición: el llamador ya verificó que existe public.profiles.
// Solo construye el perfil gym completo para usuarios que tienen gym.usuarios.

async function fetchProfile(
  authUserId: string,
  email: string,
  bdAvatarUrl?: string | null,
): Promise<GymProfile | null> {
  const { data: usuario } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, id_gimnasio, rol, estado, foto_url, cargo, telefono, documento, genero")
    .eq("id_usuario", authUserId)
    .single()

  if (!usuario) return null

  let tenant_name:  string | undefined
  let tenant_plan:  string | undefined
  let bd_tenant_id: string | null = null

  if (usuario.id_gimnasio) {
    const { data: gym } = await supabase
      .from("gimnasios")
      .select("nombre, plan_suscripcion, tenant_id")
      .eq("id_gimnasio", usuario.id_gimnasio)
      .single()
    tenant_name  = gym?.nombre
    tenant_plan  = gym?.plan_suscripcion
    bd_tenant_id = gym?.tenant_id ?? null   // public.tenants.id — FK confirmada en 015b
  }

  const rol: Rol = isValidRol(usuario.rol) ? (usuario.rol as Rol) : "miembro"

  return {
    id:           usuario.id_usuario,
    email,
    full_name:    usuario.nombre       ?? null,
    tenant_id:    usuario.id_gimnasio  ?? null,
    bd_tenant_id,
    // gym.usuarios.foto_url tiene prioridad; si es null usar avatar universal de public.profiles
    foto_url:     usuario.foto_url     ?? bdAvatarUrl ?? null,
    cargo:        usuario.cargo        ?? null,
    telefono:     usuario.telefono     ?? null,
    documento:    usuario.documento    ?? null,
    genero:       usuario.genero       ?? null,
    rol,
    tenant_name,
    tenant_plan,
  }
}

function isValidRol(value: string): boolean {
  return ["gerente","recepcionista","entrenador","nutricionista","miembro","cliente","admin"].includes(value)
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,        setUser]        = useState<GymProfile | null>(null)
  const [loading,     setLoading]     = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])
  const router                        = useRouter()

  // Carga los permisos del usuario autenticado via fn_my_permissions()
  // Extrae solo el string de permission_id para verificación instantánea.
  const loadPermissions = useCallback(async () => {
    const { data } = await supabasePublic.rpc("fn_my_permissions")
    if (data) {
      setPermissions(data.map((p: { permission: string }) => p.permission))
    }
  }, [])

  const hasPermission = useCallback(
    (p: string) => permissions.includes(p),
    [permissions],
  )

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: bd } = await supabasePublic.rpc("fn_get_my_profile")
        const profile = await fetchProfile(data.session.user.id, data.session.user.email ?? "", bd?.avatar_url)
        setUser(profile)
        if (profile) await loadPermissions()
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: bd } = await supabasePublic.rpc("fn_get_my_profile")
        const profile = await fetchProfile(session.user.id, session.user.email ?? "", bd?.avatar_url)
        setUser(profile)
        if (profile) {
          await loadPermissions()
        }
      } else {
        setUser(null)
        setPermissions([])
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [loadPermissions])

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      // 1. Autenticación Supabase
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

      // 2. Verificar BD Maestra vía RPC (SECURITY DEFINER — bypasea RLS y sesión compartida)
      const { data: bdResult, error: rpcError } = await supabasePublic.rpc("fn_get_my_profile")

      if (rpcError) {
        // El RPC no existe o falló — probablemente migración 012 no ejecutada aún
        console.error("fn_get_my_profile RPC error:", rpcError.message)
        await supabase.auth.signOut()
        return {
          ok:    false,
          error: "Error de configuración del sistema. Asegúrate de haber ejecutado la migración 012 en Supabase.",
        }
      }

      if (!bdResult?.found) {
        // No existe en BD Maestra — cuenta creada antes de las migraciones 011/012
        await supabase.auth.signOut()
        return {
          ok:     false,
          error:  "Tu cuenta existe pero aún no está vinculada a un gimnasio.",
          action: "choose_path",
        }
      }

      // 3. Verificar acceso al módulo gym
      const { data: gymUser } = await supabase
        .from("usuarios")
        .select("id_usuario")
        .eq("id_usuario", data.user.id)
        .single()

      if (!gymUser) {
        // Tiene cuenta BD Maestra pero no acceso gym
        await supabase.auth.signOut()

        if (bdResult.tenant_id) {
          // Pertenece a otro sistema (ONG, RRHH, etc.) — tenant_id apunta a ese sistema
          return {
            ok:     false,
            error:  "Esta cuenta pertenece a otro sistema de la plataforma (como ONG u otro módulo). Accede desde el sistema correspondiente.",
            action: "wrong_system",
          }
        }

        // Sin sistema asignado → mostrar modal para elegir camino
        return {
          ok:     false,
          error:  "Tu cuenta existe pero aún no está vinculada a un gimnasio.",
          action: "choose_path",
        }
      }

      // 4. Construir perfil completo y redirigir
      const profile = await fetchProfile(data.user.id, data.user.email ?? "", bdResult.avatar_url)

      if (!profile) {
        await supabase.auth.signOut()
        return { ok: false, error: "Error al cargar el perfil. Intenta de nuevo." }
      }

      setUser(profile)
      // Los permisos se cargan vía onAuthStateChange que dispara signInWithPassword
      document.cookie = `gymsos_rol=${profile.rol}; path=/; max-age=86400; SameSite=Lax`
      router.push(ROL_ROUTES[profile.rol])
      return { ok: true }
    },
    [router],
  )

  const logout = useCallback(async () => {
    setUser(null)
    setPermissions([])
    document.cookie = "gymsos_rol=; path=/; max-age=0"
    await supabase.auth.signOut()
    router.push("/login")
  }, [router])

  return (
    <AuthContext.Provider value={{
      user, loading,
      permissions, hasPermission, reloadPermissions: loadPermissions,
      login, logout,
    }}>
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
