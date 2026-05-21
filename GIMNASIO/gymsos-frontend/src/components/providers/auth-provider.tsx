"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import {
  type Usuario,
  authenticateDemo,
  saveSession,
  getSession,
  clearSession,
  ROL_ROUTES,
} from "@/lib/auth"
import { supabase, isDemoMode } from "@/lib/supabase"

interface AuthContextValue {
  user:    Usuario | null
  loading: boolean
  login:   (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout:  () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router                = useRouter()

  // ── Cargar sesión al iniciar ─────────────────────────────────────────────────
  useEffect(() => {
    if (isDemoMode) {
      // Modo demo: leer sessionStorage
      const session = getSession()
      setUser(session)
      setLoading(false)
      return
    }

    // Modo Supabase: obtener sesión activa
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const perfil = await fetchPerfil(data.session.user.id)
        setUser(perfil)
      }
      setLoading(false)
    })

    // Escuchar cambios de sesión (tab, refresh, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const perfil = await fetchPerfil(session.user.id)
        setUser(perfil)
      } else {
        setUser(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // ── Obtener perfil completo desde tabla `usuarios` ────────────────────────────
  async function fetchPerfil(authUserId: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select(`
        id_usuario, email, nombre, telefono, documento, genero,
        id_gimnasio, rol, estado,
        gimnasios ( nombre ),
        membresias (
          id_membresia, estado, fecha_inicio, fecha_vencimiento,
          planes ( nombre )
        )
      `)
      .eq("id_usuario", authUserId)
      .eq("estado", "activo")           // Usuarios suspendidos/inactivos no acceden
      .single()

    if (error || !data) return null

    // Membresía activa más reciente
    const mem = Array.isArray(data.membresias)
      ? data.membresias.find((m: { estado: string }) => m.estado === "activa")
      : null

    return {
      id_usuario:      data.id_usuario,
      email:           data.email,
      nombre:          data.nombre,
      telefono:        data.telefono ?? undefined,
      documento:       data.documento ?? undefined,
      genero:          data.genero   ?? undefined,
      id_gimnasio:     data.id_gimnasio,
      nombre_gimnasio: (data.gimnasios as { nombre: string } | null)?.nombre,
      rol:             data.rol,
      estado:          data.estado,
      membresia: mem ? {
        id_membresia:      mem.id_membresia,
        plan:              (mem.planes as { nombre: string } | null)?.nombre ?? "Plan",
        fecha_inicio:      mem.fecha_inicio,
        fecha_vencimiento: mem.fecha_vencimiento,
        estado:            mem.estado,
      } : undefined,
    }
  }

  // ── Login ─────────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {

      // ── Modo demo (sin Supabase configurado) ──────────────────────────────────
      if (isDemoMode) {
        const found = authenticateDemo(email, password)
        if (!found) {
          return { ok: false, error: "Credenciales incorrectas. Verifica tu email y contraseña." }
        }
        setUser(found)
        saveSession(found)
        document.cookie = `gymsos_rol=${found.rol}; path=/; max-age=86400; SameSite=Lax`
        router.push(ROL_ROUTES[found.rol])
        return { ok: true }
      }

      // ── Modo Supabase ─────────────────────────────────────────────────────────
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

      const perfil = await fetchPerfil(data.user.id)

      if (!perfil) {
        await supabase.auth.signOut()
        return { ok: false, error: "Usuario no encontrado o cuenta suspendida. Contacta al administrador." }
      }

      setUser(perfil)
      saveSession(perfil)
      document.cookie = `gymsos_rol=${perfil.rol}; path=/; max-age=86400; SameSite=Lax`
      router.push(ROL_ROUTES[perfil.rol])
      return { ok: true }
    },
    [router],
  )

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    clearSession()
    document.cookie = "gymsos_rol=; path=/; max-age=0"
    setUser(null)
    if (!isDemoMode) await supabase.auth.signOut()
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
