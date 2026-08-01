// ─────────────────────────────────────────────────────────────────────────────
// Fase 5: los CLIENTES se movieron a `supabase.unified.ts` (una sola instancia +
// selección de esquema con .schema()). Este módulo conserva SOLO los tipos de dominio.
// Re-export de conveniencia para no romper imports existentes durante la transición.
// ─────────────────────────────────────────────────────────────────────────────
export { db, auth, storage, gymDb, publicDb, ongDb, dbFor } from "./supabase.unified"

// ─── DB types that mirror Fase 5 schema exactly ───────────────────────────────

// import type crea el binding LOCAL (usable en `rol: DbRol`); el re-export lo mantiene
// disponible para quienes hacen `import { DbRol } from "@/lib/supabase"`.
import type { Rol as DbRol } from "./roles"
export type { DbRol }
export type DbEstado = "activo" | "inactivo" | "suspendido"

export interface DbUsuario {
  id_usuario: string
  email: string
  nombre: string
  telefono: string | null
  fecha_nacimiento: string | null
  documento: string | null
  genero: "M" | "F" | "Otro" | null
  id_gimnasio: string
  rol: DbRol
  estado: DbEstado
  created_at: string
  updated_at: string | null
}

export interface DbGimnasio {
  id_gimnasio: string
  nombre: string
  direccion: string | null
  ciudad: string | null
  pais: string | null
  telefono: string | null
  email: string | null
  plan_suscripcion: "pequeno" | "mediano" | "grande" | "enterprise"
  estado: "activo" | "pausado" | "cancelado"
}

export interface DbMembresia {
  id_membresia: string
  id_usuario: string
  id_plan: string
  fecha_inicio: string
  fecha_vencimiento: string
  estado: "activa" | "vencida" | "cancelada" | "suspendida"
  motivo_cancelacion: string | null
  created_at: string
}

export interface DbPlan {
  id_plan: string
  nombre: string
  precio_mensual: number
  precio_trimestral: number | null
  precio_anual: number | null
  duracion_dias: number
  clases_incluidas: number | null
  horarios_acceso: string | null
  sucursales_incluidas: "una" | "todas"
  descripcion: string | null
  activo: boolean
}

export interface DbClase {
  id_clase: string
  id_gimnasio: string
  id_entrenador: string | null   // P11: la BD permite NULL
  id_espacio: string | null      // P11: la BD permite NULL
  nombre: string
  descripcion: string | null
  capacidad_maxima: number
  nivel: "principiante" | "intermedio" | "avanzado" | null
  fecha_hora_inicio: string
  duracion_minutos: number
  recurrencia: "unica" | "diaria" | "semanal" | "mensual" | null
  dias_semana: string | null
  estado: "programada" | "en_curso" | "finalizada" | "cancelada"
  created_at: string
}

export interface DbAcceso {
  id_acceso: string
  id_usuario: string
  id_gimnasio: string
  fecha_hora_entrada: string
  fecha_hora_salida: string | null
  tipo_acceso: "qr" | "biometria" | "manual"
  estado_acceso: "permitido" | "denegado"
  razon_denegacion: string | null
}

export interface DbPago {
  id_pago: string
  id_usuario: string
  id_membresia: string
  monto: number
  moneda: string
  metodo_pago: "tarjeta" | "transferencia" | "efectivo" | "yape" | "plin"
  id_transaccion_stripe: string | null
  estado: "pendiente" | "completado" | "fallido" | "reembolsado"
  fecha_pago: string
  proxima_renovacion: string | null
}
