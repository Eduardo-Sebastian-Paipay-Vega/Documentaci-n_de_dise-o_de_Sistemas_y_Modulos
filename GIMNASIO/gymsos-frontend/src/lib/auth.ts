// Tipos del sistema de autenticación basados en BD GYMsos (tabla: usuarios)

export type Rol = "miembro" | "entrenador" | "recepcionista" | "gerente"
export type EstadoUsuario = "activo" | "inactivo" | "suspendido"

export interface Usuario {
  id_usuario: string
  email: string
  nombre: string
  telefono?: string
  documento?: string
  genero?: "M" | "F" | "Otro"
  id_gimnasio: string
  rol: Rol
  estado: EstadoUsuario
  avatar?: string
  // Datos de membresía para miembros
  membresia?: {
    plan: string
    fecha_vencimiento: string
    estado: "activa" | "vencida" | "cancelada"
  }
}

// Demo users — credenciales de prueba para cada rol
// En producción estos se verificarían contra la tabla `usuarios` con bcrypt
export const DEMO_USERS: Record<string, Usuario & { password: string }> = {
  "gerente@gymsos.io": {
    id_usuario: "uuid-gerente-001",
    email: "gerente@gymsos.io",
    password: "gerente123",
    nombre: "Carlos Ramos",
    telefono: "+51 987 654 321",
    documento: "12345678",
    genero: "M",
    id_gimnasio: "gym-lima-001",
    rol: "gerente",
    estado: "activo",
  },
  "miembro@gymsos.io": {
    id_usuario: "uuid-miembro-001",
    email: "miembro@gymsos.io",
    password: "miembro123",
    nombre: "Juan Quispe",
    telefono: "+51 912 345 678",
    documento: "87654321",
    genero: "M",
    id_gimnasio: "gym-lima-001",
    rol: "miembro",
    estado: "activo",
    membresia: {
      plan: "Gold Premium",
      fecha_vencimiento: "2026-06-30",
      estado: "activa",
    },
  },
  "entrenador@gymsos.io": {
    id_usuario: "uuid-entrenador-001",
    email: "entrenador@gymsos.io",
    password: "entrenador123",
    nombre: "Ana Torres",
    telefono: "+51 901 234 567",
    documento: "11223344",
    genero: "F",
    id_gimnasio: "gym-lima-001",
    rol: "entrenador",
    estado: "activo",
  },
  "recepcion@gymsos.io": {
    id_usuario: "uuid-recepcion-001",
    email: "recepcion@gymsos.io",
    password: "recepcion123",
    nombre: "María López",
    telefono: "+51 934 567 890",
    documento: "44332211",
    genero: "F",
    id_gimnasio: "gym-lima-001",
    rol: "recepcionista",
    estado: "activo",
  },
}

// Mapa de rutas por rol
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

// Autenticación mock — simula bcrypt compare
export function authenticate(email: string, password: string): Usuario | null {
  const user = DEMO_USERS[email.toLowerCase().trim()]
  if (!user || user.password !== password) return null
  if (user.estado !== "activo") return null
  const { password: _, ...userData } = user
  return userData
}

const STORAGE_KEY = "gymsos_session"

export function saveSession(user: Usuario): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  }
}

export function getSession(): Usuario | null {
  if (typeof window !== "undefined") {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Usuario
  }
  return null
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}
