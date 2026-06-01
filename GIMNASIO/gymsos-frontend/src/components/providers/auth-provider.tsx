"use client"

import {
  createContext, useContext, useState, useEffect, useCallback, type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

// ─────────────────────────────────────────────────────────────────────────────
// Arquitectura BD:
//   auth.users       → identidad Supabase (nunca se toca directamente)
//   gym.usuarios     → perfil del usuario en el gym (id_usuario FK auth.users)
//   gym.gimnasios    → el tenant del gym (id_gimnasio)
//   gym.codigos_acceso → invitaciones por gimnasio
//   supabase client  → db.schema = "gym" por defecto
// ─────────────────────────────────────────────────────────────────────────────

export type Rol =
  | "gerente" | "recepcionista" | "entrenador"
  | "nutricionista" | "miembro" | "cliente" | "admin"

export interface GymProfile {
  // Identidad (auth.users)
  id:           string        // = auth.users.id
  email:        string

  // Perfil (gym.usuarios)
  full_name:    string | null // = gym.usuarios.nombre
  tenant_id:    string | null // = gym.usuarios.id_gimnasio (renombrado para compat.)
  foto_url:     string | null
  cargo:        string | null
  telefono:     string | null
  documento:    string | null
  genero:       string | null
  rol:          Rol

  // Gym info (gym.gimnasios join)
  tenant_name?: string        // = gym.gimnasios.nombre
  tenant_plan?: string        // = gym.gimnasios.plan_suscripcion
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

// ── fetchProfile: lee gym.usuarios + gym.gimnasios ────────────────────────────

async function fetchProfile(authUserId: string, email: string): Promise<GymProfile | null> {
  // 1. Obtener perfil del usuario en gym.usuarios
  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, id_gimnasio, rol, estado, foto_url, cargo, telefono, documento, genero")
    .eq("id_usuario", authUserId)
    .single()

  if (error || !usuario) return null

  // 2. Obtener nombre y plan del gimnasio (si tiene uno asignado)
  let tenant_name: string | undefined
  let tenant_plan: string | undefined

  if (usuario.id_gimnasio) {
    const { data: gym } = await supabase
      .from("gimnasios")
      .select("nombre, plan_suscripcion")
      .eq("id_gimnasio", usuario.id_gimnasio)
      .single()
    tenant_name = gym?.nombre
    tenant_plan = gym?.plan_suscripcion
  }

  // 3. Validar rol
  const rol: Rol = isValidRol(usuario.rol) ? (usuario.rol as Rol) : "miembro"

  return {
    id:          usuario.id_usuario,
    email,
    full_name:   usuario.nombre   ?? null,
    tenant_id:   usuario.id_gimnasio ?? null,   // id_gimnasio como tenant_id
    foto_url:    usuario.foto_url ?? null,
    cargo:       usuario.cargo    ?? null,
    telefono:    usuario.telefono ?? null,
    documento:   usuario.documento ?? null,
    genero:      usuario.genero   ?? null,
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
  const [user, setUser]       = useState<GymProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router                = useRouter()

  useEffect(() => {
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
        // No tiene fila en gym.usuarios → necesita onboarding o signup
        await supabase.auth.signOut()
        return {
          ok:    false,
          error: "Perfil no encontrado. Usa /onboarding para crear tu gimnasio o /signup para unirte a uno.",
        }
      }

      if (!profile.tenant_id) {
        // Autenticado pero sin gimnasio asignado → completar onboarding
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
