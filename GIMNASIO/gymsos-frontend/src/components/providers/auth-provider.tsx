"use client"

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { auth, publicDb, gymDb } from "@/lib/supabase.unified"

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
  | "gerente" | "supervisor" | "cajero"
  | "recepcionista" | "entrenador"
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

  // Membresía activa del usuario (opcional). Hoy fetchProfile NO la puebla;
  // se declara para el contrato de la UI (cliente/miembro).
  membresia?: {
    plan:              string
    fecha_vencimiento: string
    estado:            string
  } | null
}

const ROL_ROUTES: Record<Rol, string> = {
  gerente:       "/dashboard/gerente",
  supervisor:    "/dashboard/supervisor",
  cajero:        "/dashboard/cajero",
  recepcionista: "/dashboard/recepcionista",
  entrenador:    "/dashboard/entrenador",
  nutricionista: "/dashboard/nutricionista",
  miembro:       "/dashboard/miembro",
  cliente:       "/dashboard/miembro",
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
  const { data: usuario } = await gymDb
    .from("usuarios")
    .select("id_usuario, nombre, id_gimnasio, rol, estado, foto_url, cargo, telefono, documento, genero")
    .eq("id_usuario", authUserId)
    .maybeSingle()

  if (!usuario) return null

  let tenant_name:  string | undefined
  let tenant_plan:  string | undefined
  let bd_tenant_id: string | null = null

  if (usuario.id_gimnasio) {
    const { data: gym } = await gymDb
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
  return ["gerente","supervisor","cajero","recepcionista","entrenador","nutricionista","miembro","cliente","admin"].includes(value)
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
    const { data } = await publicDb.rpc("fn_my_permissions")
    if (data) {
      setPermissions(data.map((p: { permission: string }) => p.permission))
    }
  }, [])

  const hasPermission = useCallback(
    (p: string) => permissions.includes(p),
    [permissions],
  )

  useEffect(() => {
    auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: bd } = await publicDb.rpc("fn_get_my_profile")
        const profile = await fetchProfile(data.session.user.id, data.session.user.email ?? "", bd?.avatar_url)
        setUser(profile)
        if (profile) await loadPermissions()
      }
      setLoading(false)
    })

    const { data: listener } = auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: bd } = await publicDb.rpc("fn_get_my_profile")
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
      const { data, error } = await auth.signInWithPassword({ email, password })

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
      const { data: bdResult, error: rpcError } = await publicDb.rpc("fn_get_my_profile")

      if (rpcError) {
        // El RPC no existe o falló — probablemente migración 012 no ejecutada aún
        console.error("fn_get_my_profile RPC error:", rpcError.message)
        await auth.signOut()
        return {
          ok:    false,
          error: "Error de configuración del sistema. Asegúrate de haber ejecutado la migración 012 en Supabase.",
        }
      }

      if (!bdResult?.found) {
        // No existe en BD Maestra — cuenta creada antes de las migraciones 011/012
        await auth.signOut()
        return {
          ok:     false,
          error:  "Tu cuenta existe pero aún no está vinculada a un gimnasio.",
          action: "choose_path",
        }
      }

      // 3. Verificar acceso al módulo gym
      // .maybeSingle() devuelve { data: null, error: null } cuando hay 0 filas.
      // .single() devolvería HTTP 406 (Not Acceptable) que el cliente silencia
      // dejando data=null sin poder distinguir "no encontrado" de "error real".
      const { data: gymUser, error: gymUserError } = await gymDb
        .from("usuarios")
        .select("id_usuario")
        .eq("id_usuario", data.user.id)
        .maybeSingle()

      if (gymUserError) {
        console.error("gym.usuarios check error:", gymUserError.message)
        await auth.signOut()
        return { ok: false, error: "Error al verificar acceso al módulo gym. Intenta de nuevo." }
      }

      if (!gymUser) {
        // Tiene cuenta BD Maestra pero no perfil gym.
        await auth.signOut()

        // "wrong_system" solo si el tenant apunta a otra industria distinta de gym.
        // industry_type viene de fn_get_my_profile (migr-018).
        // Para usuarios gym: tenant_id existe pero industry_type = 'gym' → choose_path.
        // Para usuarios ONG/RRHH: industry_type = 'ong' / otro → wrong_system.
        if (bdResult.tenant_id && bdResult.industry_type && bdResult.industry_type !== "gym") {
          return {
            ok:     false,
            error:  "Esta cuenta pertenece a otro sistema de la plataforma (como ONG u otro módulo). Accede desde el sistema correspondiente.",
            action: "wrong_system",
          }
        }

        // Sin gym.usuarios → mostrar modal para elegir camino (dueño / miembro)
        return {
          ok:     false,
          error:  "Tu cuenta existe pero aún no está vinculada a un gimnasio.",
          action: "choose_path",
        }
      }

      // 4. Construir perfil completo y redirigir
      const profile = await fetchProfile(data.user.id, data.user.email ?? "", bdResult.avatar_url)

      if (!profile) {
        await auth.signOut()
        return { ok: false, error: "Error al cargar el perfil. Intenta de nuevo." }
      }

      setUser(profile)
      // Los permisos se cargan vía onAuthStateChange que dispara signInWithPassword
      router.push(ROL_ROUTES[profile.rol])
      return { ok: true }
    },
    [router],
  )

  const logout = useCallback(async () => {
    setUser(null)
    setPermissions([])
    await auth.signOut()
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
