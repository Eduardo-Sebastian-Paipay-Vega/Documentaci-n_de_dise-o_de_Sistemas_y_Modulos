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
  authenticate,
  saveSession,
  getSession,
  clearSession,
  ROL_ROUTES,
} from "@/lib/auth"

interface AuthContextValue {
  user: Usuario | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Rehydrate session on mount
  useEffect(() => {
    const session = getSession()
    setUser(session)
    setLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      const found = authenticate(email, password)
      if (!found) {
        return { ok: false, error: "Credenciales incorrectas. Verifica tu email y contraseña." }
      }
      setUser(found)
      saveSession(found)
      router.push(ROL_ROUTES[found.rol])
      return { ok: true }
    },
    [router],
  )

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
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
