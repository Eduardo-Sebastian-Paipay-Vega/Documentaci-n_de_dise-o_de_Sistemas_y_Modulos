export type { Rol } from "./roles"
export type EstadoUsuario = "activo" | "inactivo" | "suspendido"

import type { Rol } from "./roles"

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

export { ROL_ROUTES } from "./roles"

export const ROL_LABELS: Record<Rol, string> = {
  gerente:       "Gerente",
  miembro:       "Miembro",
  cliente:       "Cliente",
  entrenador:    "Entrenador",
  recepcionista: "Recepcionista",
  nutricionista: "Nutricionista",
  admin:         "Admin",
}

export const ROL_ICONS: Record<Rol, string> = {
  gerente:       "G",
  miembro:       "M",
  cliente:       "C",
  entrenador:    "E",
  recepcionista: "R",
  nutricionista: "N",
  admin:         "A",
}

export const ROL_COLOR: Record<Rol, string> = {
  gerente:       "#00D084",
  miembro:       "#00D084",
  cliente:       "#22C55E",
  entrenador:    "#FF6B35",
  recepcionista: "#3B82F6",
  nutricionista: "#10B981",
  admin:         "#8B5CF6",
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
