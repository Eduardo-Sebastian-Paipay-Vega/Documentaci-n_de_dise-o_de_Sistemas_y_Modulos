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
  const planes = await getPlanesPorGimnasio(gymId)

  const { data: membresiaData, error } = await supabase
    .from("membresias")
    .select("id_plan")
    .in("id_plan", planes.map((p) => p.id_plan))
    .eq("estado", "activa")

  if (error) handleSupabaseError(error)

  const conteo: Record<string, number> = {}
  for (const m of membresiaData ?? []) {
    conteo[m.id_plan] = (conteo[m.id_plan] ?? 0) + 1
  }

  return planes.map((p) => ({ ...p, total_miembros: conteo[p.id_plan] ?? 0 }))
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
