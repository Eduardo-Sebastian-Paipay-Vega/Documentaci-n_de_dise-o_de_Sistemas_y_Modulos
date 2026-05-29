import { supabase, handleSupabaseError } from "./base"

export type GamificationLevel = {
  id_usuario: string
  xp_total: number
  nivel_actual: number
  xp_proximo_nivel: number
  fecha_actualizacion: string
}

export type XPEvento = {
  id_xp: string
  tipo_evento: string
  cantidad_xp: number
  descripcion: string | null
  fecha_evento: string
}

export type Logro = {
  nombre: string
  icon: string
  desc: string
  progreso: number
  desbloqueado: boolean
}

// Títulos por nivel para sensación de progresión
const TITULOS_NIVEL: Record<number, string> = {
  1: "Novato",  5: "Activo", 10: "Dedicado", 20: "Warrior",
  30: "Elite",  40: "Legend", 50: "GYMsos Master",
}

export function getTituloNivel(nivel: number): string {
  const niveles = Object.keys(TITULOS_NIVEL).map(Number).sort((a, b) => b - a)
  for (const n of niveles) {
    if (nivel >= n) return TITULOS_NIVEL[n]
  }
  return "Novato"
}

export function getXPParaSiguienteNivel(nivelActual: number): number {
  // Curva de progresión: 500 XP base × factor exponencial suave
  return Math.round(500 * Math.pow(1.15, nivelActual - 1))
}

export async function getGamificationLevel(userId: string): Promise<GamificationLevel | null> {
  const { data, error } = await supabase
    .from("gamification_levels")
    .select("id_usuario, xp_total, nivel_actual, xp_proximo_nivel, fecha_actualizacion")
    .eq("id_usuario", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    handleSupabaseError(error)
  }
  return data
}

export async function getXPHistorial(userId: string, limit = 10): Promise<XPEvento[]> {
  const { data, error } = await supabase
    .from("gamification_xp")
    .select("id_xp, tipo_evento, cantidad_xp, descripcion, fecha_evento")
    .eq("id_usuario", userId)
    .order("fecha_evento", { ascending: false })
    .limit(limit)

  if (error) handleSupabaseError(error)
  return data ?? []
}

export async function getSesionesPorSemana(
  userId: string,
  semanas = 8,
): Promise<{ semana: string; valor: number }[]> {
  const desde = new Date()
  desde.setDate(desde.getDate() - semanas * 7)

  const { data, error } = await supabase
    .from("accesos")
    .select("fecha_hora_entrada")
    .eq("id_usuario", userId)
    .eq("estado_acceso", "permitido")
    .gte("fecha_hora_entrada", desde.toISOString())
    .order("fecha_hora_entrada", { ascending: true })

  if (error) handleSupabaseError(error)

  // Agrupar por semana
  const porSemana: Record<number, number> = {}
  for (const a of data ?? []) {
    const fecha = new Date(a.fecha_hora_entrada)
    const diffDias = Math.floor((Date.now() - fecha.getTime()) / 86400000)
    const semanaIdx = Math.floor(diffDias / 7)
    if (semanaIdx < semanas) {
      porSemana[semanaIdx] = (porSemana[semanaIdx] ?? 0) + 1
    }
  }

  return Array.from({ length: semanas }, (_, i) => ({
    semana: `S${semanas - i}`,
    valor: porSemana[i] ?? 0,
  })).reverse()
}

export async function otorgarXP(
  userId: string,
  tipoEvento: string,
  cantidadXp: number,
  descripcion?: string,
): Promise<void> {
  const { error: xpError } = await supabase.from("gamification_xp").insert({
    id_usuario:  userId,
    tipo_evento: tipoEvento,
    cantidad_xp: cantidadXp,
    descripcion: descripcion ?? null,
  })
  if (xpError) handleSupabaseError(xpError)

  // Actualizar o crear nivel
  const nivel = await getGamificationLevel(userId)
  if (nivel) {
    const xpNuevo = nivel.xp_total + cantidadXp
    const nivelNuevo = calcularNivel(xpNuevo)
    const { error } = await supabase
      .from("gamification_levels")
      .update({
        xp_total:         xpNuevo,
        nivel_actual:     nivelNuevo,
        xp_proximo_nivel: getXPParaSiguienteNivel(nivelNuevo),
        fecha_actualizacion: new Date().toISOString(),
      })
      .eq("id_usuario", userId)
    if (error) handleSupabaseError(error)
  } else {
    const { error } = await supabase.from("gamification_levels").insert({
      id_usuario:         userId,
      xp_total:           cantidadXp,
      nivel_actual:       1,
      xp_proximo_nivel:   500,
      fecha_actualizacion: new Date().toISOString(),
    })
    if (error) handleSupabaseError(error)
  }
}

function calcularNivel(xpTotal: number): number {
  let nivel = 1
  let xpAcumulado = 0
  while (xpAcumulado + getXPParaSiguienteNivel(nivel) <= xpTotal) {
    xpAcumulado += getXPParaSiguienteNivel(nivel)
    nivel++
  }
  return nivel
}

// Icono para cada tipo de evento XP
export function getXPIcon(tipoEvento: string): string {
  const map: Record<string, string> = {
    "sesion_completada":   "💪",
    "clase_asistida":      "🧘",
    "nuevo_pr":            "🏆",
    "racha_7_dias":        "🔥",
    "reto_clan":           "⚔️",
    "primer_mes":          "🥇",
    "evaluacion_fisica":   "📊",
    "pago_puntual":        "💳",
  }
  return map[tipoEvento] ?? "⭐"
}
