import { supabase, handleSupabaseError } from "./base"

export type Plan = {
  id_plan: string
  id_gimnasio: string | null
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
  total_miembros?: number
}

export async function getPlanesPorGimnasio(gymId: string): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("planes")
    .select(
      `
      id_plan, id_gimnasio, nombre, precio_mensual, precio_trimestral,
      precio_anual, duracion_dias, clases_incluidas, horarios_acceso,
      sucursales_incluidas, descripcion, activo, created_at
    `,
    )
    .eq("id_gimnasio", gymId)
    .eq("activo", true)
    .order("precio_mensual", { ascending: true })

  if (error) handleSupabaseError(error)

  return (data ?? []).map((p) => ({
    ...p,
    sucursales_incluidas: p.sucursales_incluidas as Plan["sucursales_incluidas"],
  }))
}

export async function getPlanesConConteo(gymId: string): Promise<Plan[]> {
  // Single query: planes + conteo de membresias activas en JOIN lateral
  const { data, error } = await supabase
    .from("planes")
    .select(
      `
      id_plan, id_gimnasio, nombre, precio_mensual, precio_trimestral,
      precio_anual, duracion_dias, clases_incluidas, horarios_acceso,
      sucursales_incluidas, descripcion, activo, created_at,
      membresias!left ( id_membresia )
    `,
    )
    .eq("id_gimnasio", gymId)
    .eq("activo", true)
    .eq("membresias.estado", "activa")
    .order("precio_mensual", { ascending: true })

  if (error) handleSupabaseError(error)

  return (data ?? []).map((p) => ({
    id_plan:              p.id_plan,
    id_gimnasio:          p.id_gimnasio,
    nombre:               p.nombre,
    precio_mensual:       p.precio_mensual,
    precio_trimestral:    p.precio_trimestral,
    precio_anual:         p.precio_anual,
    duracion_dias:        p.duracion_dias,
    clases_incluidas:     p.clases_incluidas,
    horarios_acceso:      p.horarios_acceso,
    sucursales_incluidas: p.sucursales_incluidas as Plan["sucursales_incluidas"],
    descripcion:          p.descripcion,
    activo:               p.activo,
    total_miembros:       Array.isArray(p.membresias) ? p.membresias.length : 0,
  }))
}

export async function crearPlan(plan: Omit<Plan, "id_plan" | "total_miembros">): Promise<string> {
  const { data, error } = await supabase
    .from("planes")
    .insert(plan)
    .select("id_plan")
    .single()

  if (error) handleSupabaseError(error)
  return data.id_plan
}

export async function actualizarPlan(id: string, cambios: Partial<Plan>): Promise<void> {
  const { error } = await supabase.from("planes").update(cambios).eq("id_plan", id)
  if (error) handleSupabaseError(error)
}

export async function desactivarPlan(id: string): Promise<void> {
  await actualizarPlan(id, { activo: false })
}
