export type Rol = "miembro" | "cliente" | "entrenador" | "recepcionista" | "gerente" | "nutricionista"
export type EstadoUsuario = "activo" | "inactivo" | "suspendido"

export interface Usuario {
  id_usuario: string
  email: string
  nombre: string
  telefono?: string
  documento?: string
  genero?: "M" | "F" | "Otro"
  id_gimnasio: string
  nombre_gimnasio?: string
  rol: Rol
  estado: EstadoUsuario
  membresia?: {
    id_membresia: string
    plan: string
    fecha_inicio: string
    fecha_vencimiento: string
    estado: "activa" | "vencida" | "cancelada" | "suspendida"
  }
}

export const ROL_ROUTES: Record<Rol, string> = {
  gerente: "/dashboard/gerente",
  miembro: "/dashboard/miembro",
  cliente: "/dashboard/cliente",
  entrenador: "/dashboard/entrenador",
  recepcionista: "/dashboard/recepcionista",
  nutricionista: "/dashboard/nutricionista",
}

export const ROL_LABELS: Record<Rol, string> = {
  gerente: "Gerente",
  miembro: "Miembro",
  cliente: "Cliente",
  entrenador: "Entrenador",
  recepcionista: "Recepcionista",
  nutricionista: "Nutricionista",
}

export const ROL_ICONS: Record<Rol, string> = {
  gerente: "G",
  miembro: "M",
  cliente: "C",
  entrenador: "E",
  recepcionista: "R",
  nutricionista: "N",
}

export const ROL_COLOR: Record<Rol, string> = {
  gerente: "#00D084",
  miembro: "#00D084",
  cliente: "#22C55E",
  entrenador: "#FF6B35",
  recepcionista: "#3B82F6",
  nutricionista: "#10B981",
}

export const DEMO_USERS: Record<string, Usuario & { password: string }> = {
  "gerente@gymsos.io": {
    id_usuario: "demo-gerente-001",
    email: "gerente@gymsos.io",
    password: "gerente123",
    nombre: "Carlos Ramos",
    telefono: "+51 987 654 321",
    documento: "12345678",
    genero: "M",
    id_gimnasio: "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol: "gerente",
    estado: "activo",
  },
  "miembro@gymsos.io": {
    id_usuario: "demo-miembro-001",
    email: "miembro@gymsos.io",
    password: "miembro123",
    nombre: "Juan Quispe",
    telefono: "+51 912 345 678",
    documento: "87654321",
    genero: "M",
    id_gimnasio: "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol: "miembro",
    estado: "activo",
    membresia: {
      id_membresia: "demo-membresia-001",
      plan: "Gold Premium",
      fecha_inicio: "2026-05-01",
      fecha_vencimiento: "2026-06-30",
      estado: "activa",
    },
  },
  "cliente@gymsos.io": {
    id_usuario: "demo-cliente-001",
    email: "cliente@gymsos.io",
    password: "cliente123",
    nombre: "Lucia Mendoza",
    telefono: "+51 955 123 456",
    documento: "66554433",
    genero: "F",
    id_gimnasio: "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol: "cliente",
    estado: "activo",
    membresia: {
      id_membresia: "demo-membresia-002",
      plan: "Silver",
      fecha_inicio: "2026-05-10",
      fecha_vencimiento: "2026-06-10",
      estado: "activa",
    },
  },
  "entrenador@gymsos.io": {
    id_usuario: "demo-entrenador-001",
    email: "entrenador@gymsos.io",
    password: "entrenador123",
    nombre: "Ana Torres",
    telefono: "+51 901 234 567",
    documento: "11223344",
    genero: "F",
    id_gimnasio: "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol: "entrenador",
    estado: "activo",
  },
  "recepcion@gymsos.io": {
    id_usuario: "demo-recepcion-001",
    email: "recepcion@gymsos.io",
    password: "recepcion123",
    nombre: "Maria Lopez",
    telefono: "+51 934 567 890",
    documento: "44332211",
    genero: "F",
    id_gimnasio: "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol: "recepcionista",
    estado: "activo",
  },
  "nutricion@gymsos.io": {
    id_usuario: "demo-nutricion-001",
    email: "nutricion@gymsos.io",
    password: "nutricion123",
    nombre: "Sofia Ramos Paredes",
    telefono: "+51 945 678 901",
    documento: "55443322",
    genero: "F",
    id_gimnasio: "00000000-0000-0000-0000-000000000001",
    nombre_gimnasio: "GymFit Lima",
    rol: "nutricionista",
    estado: "activo",
  },
}

export function authenticateDemo(email: string, password: string): Usuario | null {
  const user = DEMO_USERS[email.toLowerCase().trim()]
  if (!user || user.password !== password) return null
  if (user.estado !== "activo") return null
  const { password: _password, ...userData } = user
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
