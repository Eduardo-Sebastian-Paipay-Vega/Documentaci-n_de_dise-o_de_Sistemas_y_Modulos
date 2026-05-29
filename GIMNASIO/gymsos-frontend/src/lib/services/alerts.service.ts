import { supabase, handleSupabaseError } from "./base"

export type HealthAlert = {
  id_alerta: string
  id_usuario: string
  tipo_alerta: string
  descripcion: string
  severidad: "baja" | "media" | "alta"
  fecha_alerta: string
  leida: boolean
  accion_recomendada: string | null
  nombre_usuario?: string
}

export async function getAlertasPorGimnasio(
  gymId: string,
  soloNoLeidas = true,
): Promise<HealthAlert[]> {
  let q = supabase
    .from("health_alerts")
    .select(`
      id_alerta, id_usuario, tipo_alerta, descripcion,
      severidad, fecha_alerta, leida, accion_recomendada,
      usuarios!inner ( nombre, id_gimnasio )
    `)
    .eq("usuarios.id_gimnasio", gymId)
    .order("fecha_alerta", { ascending: false })
    .limit(20)

  if (soloNoLeidas) q = q.eq("leida", false)

  const { data, error } = await q
  if (error) handleSupabaseError(error)

  return (data ?? []).map((a) => {
    const uRaw = (a as unknown as { usuarios?: unknown }).usuarios
    const u = Array.isArray(uRaw) ? uRaw[0] : uRaw
    return {
      ...a,
      severidad: a.severidad as HealthAlert["severidad"],
      nombre_usuario: (u as { nombre?: string } | undefined)?.nombre,
    }
  })
}

export async function getAlertasPropias(userId: string): Promise<HealthAlert[]> {
  const { data, error } = await supabase
    .from("health_alerts")
    .select("id_alerta, id_usuario, tipo_alerta, descripcion, severidad, fecha_alerta, leida, accion_recomendada")
    .eq("id_usuario", userId)
    .order("fecha_alerta", { ascending: false })
    .limit(10)

  if (error) handleSupabaseError(error)
  return (data ?? []).map((a) => ({
    ...a,
    severidad: a.severidad as HealthAlert["severidad"],
  }))
}

export async function marcarAlertaLeida(alertaId: string): Promise<void> {
  const { error } = await supabase
    .from("health_alerts")
    .update({ leida: true })
    .eq("id_alerta", alertaId)
  if (error) handleSupabaseError(error)
}

export async function crearAlerta(alerta: {
  id_usuario: string
  tipo_alerta: string
  descripcion: string
  severidad: "baja" | "media" | "alta"
  accion_recomendada?: string
}): Promise<void> {
  const { error } = await supabase.from("health_alerts").insert({
    id_usuario:          alerta.id_usuario,
    tipo_alerta:         alerta.tipo_alerta,
    descripcion:         alerta.descripcion,
    severidad:           alerta.severidad,
    accion_recomendada:  alerta.accion_recomendada ?? null,
    leida:               false,
  })
  if (error) handleSupabaseError(error)
}

export function getSeveridadStyle(severidad: HealthAlert["severidad"]) {
  const map = {
    alta:  { color: "var(--red)",  bg: "rgba(239,68,68,0.08)",  border: "rgba(239,68,68,0.2)"  },
    media: { color: "#F97316",     bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)" },
    baja:  { color: "var(--blue)", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" },
  }
  return map[severidad]
}

export function getTipoAlertaIcon(tipo: string): string {
  const map: Record<string, string> = {
    "membresia_por_vencer": "⏰",
    "pago_atrasado":        "💳",
    "inactividad":          "😴",
    "frecuencia_baja":      "📉",
    "imc_alto":             "⚠️",
    "evaluacion_pendiente": "📋",
    "renovacion_recomendada": "🔄",
  }
  return map[tipo] ?? "🔔"
}
