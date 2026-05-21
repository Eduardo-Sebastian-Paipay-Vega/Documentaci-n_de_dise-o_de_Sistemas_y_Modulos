// ─── Tipos del sistema GYMsos — espejo exacto de la tabla `usuarios` (Fase 5) ─

export type Rol = "miembro" | "entrenador" | "recepcionista" | "gerente"
export type EstadoUsuario = "activo" | "inactivo" | "suspendido"

export interface Usuario {
  id_usuario:       string
  email:            string
  nombre:           string
  telefono?:        string
  documento?:       string
  genero?:          "M" | "F" | "Otro"
  id_gimnasio:      string
  nombre_gimnasio?: string
  rol:              Rol
  estado:           EstadoUsuario
  membresia?: {
    id_membresia:       string
    plan:               string
    fecha_inicio:       string
    fecha_vencimiento:  string
    estado:             "activa" | "vencida" | "cancelada" | "suspendida"
  }
}

// ─── Rutas por rol (BD define quién va a dónde) ────────────────────────────────
export const ROL_ROUTES: Record<Rol, string> = {
  gerente:       "/dashboard/gerente",
  miembro:       "/dashboard/miembro",
  entrenador:    "/dashboard/entrenador",
  recepcionista: "/dashboard/recepcionista",
}

export const ROL_LABELS: Record<Rol, string> = {
  gerente:       "Gerente",
  miembro:       "Miembro",
  entrenador:    "Entrenador",
  recepcionista: "Recepcionista",
}

export const ROL_ICONS: Record<Rol, string> = {
  gerente:       "📊",
  miembro:       "💪",
  entrenador:    "🏋️",
  recepcionista: "🗂️",
}

// ─── Colores por rol (para UI) ─────────────────────────────────────────────────
export const ROL_COLOR: Record<Rol, string> = {
  gerente:       "#00D084",
  miembro:       "#00D084",
  entrenador:    "#FF6B35",
  recepcionista: "#3B82F6",
}

// ─── USUARIOS DEMO (modo sin Supabase) ────────────────────────────────────────
// Estos datos reflejan exactamente el seed del supabase-schema.sql
export const DEMO_USERS: Record<string, Usuario & { password: string }> = {
  "gerente@gymsos.io": {
    id_usuario:      "demo-gerente-001",
    email:           "gerente@gymsos.io",
    password:        "gerente123",
    nombre:          "Carlos Ramos",
    telefono:        "+51 987 654 321",
    documento:       "12345678",
    genero:          "M",
    id_gimnasio:     "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol:             "gerente",
    estado:          "activo",
  },
  "miembro@gymsos.io": {
    id_usuario:      "demo-miembro-001",
    email:           "miembro@gymsos.io",
    password:        "miembro123",
    nombre:          "Juan Quispe",
    telefono:        "+51 912 345 678",
    documento:       "87654321",
    genero:          "M",
    id_gimnasio:     "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol:             "miembro",
    estado:          "activo",
    membresia: {
      id_membresia:      "demo-membresia-001",
      plan:              "Gold Premium",
      fecha_inicio:      "2026-05-01",
      fecha_vencimiento: "2026-06-30",
      estado:            "activa",
    },
  },
  "entrenador@gymsos.io": {
    id_usuario:      "demo-entrenador-001",
    email:           "entrenador@gymsos.io",
    password:        "entrenador123",
    nombre:          "Ana Torres",
    telefono:        "+51 901 234 567",
    documento:       "11223344",
    genero:          "F",
    id_gimnasio:     "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol:             "entrenador",
    estado:          "activo",
  },
  "recepcion@gymsos.io": {
    id_usuario:      "demo-recepcion-001",
    email:           "recepcion@gymsos.io",
    password:        "recepcion123",
    nombre:          "María López",
    telefono:        "+51 934 567 890",
    documento:       "44332211",
    genero:          "F",
    id_gimnasio:     "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol:             "recepcionista",
    estado:          "activo",
  },
}

// ─── Auth mock (modo demo sin Supabase) ────────────────────────────────────────
export function authenticateDemo(email: string, password: string): Usuario | null {
  const user = DEMO_USERS[email.toLowerCase().trim()]
  if (!user || user.password !== password) return null
  if (user.estado !== "activo") return null
  const { password: _, ...userData } = user
  return userData
}

// ─── Session storage (mock y Supabase usan la misma clave) ────────────────────
const STORAGE_KEY = "gymsos_session"

export function saveSession(user: Usuario): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}

export function getSession(): Usuario | null {
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as Usuario
    } catch {
      return null
    }
  }
  return null
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}
