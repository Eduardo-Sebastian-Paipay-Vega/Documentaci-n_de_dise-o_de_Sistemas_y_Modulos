import { supabase, handleSupabaseError, type QueryOptions } from "./base"

export type MembresiaDetalle = {
  id_membresia: string
  id_usuario: string
  id_plan: string
  fecha_inicio: string
  fecha_vencimiento: string
  estado: "activa" | "vencida" | "cancelada" | "suspendida"
  motivo_cancelacion: string | null
  created_at: string
  nombre_usuario?: string
  email_usuario?: string
  plan_nombre?: string
  precio_mensual?: number
}

export type NuevaMembresia = {
  id_usuario: string
  id_plan: string
  fecha_inicio: string
  fecha_vencimiento: string
}

export async function getMembresiasPorGimnasio(
  gymId: string,
  opts: QueryOptions & { estado?: string } = {},
): Promise<MembresiaDetalle[]> {
  let q = supabase
    .from("membresias")
    .select(
      `
      id_membresia, id_usuario, id_plan, fecha_inicio, fecha_vencimiento,
      estado, motivo_cancelacion, created_at,
      usuarios!inner ( nombre, email, id_gimnasio ),
      planes ( nombre, precio_mensual )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)

  if (opts.estado) q = q.eq("estado", opts.estado)
  q = q.order("created_at", { ascending: false })
  if (opts.limit) q = q.limit(opts.limit)

  const { data, error } = await q
  if (error) handleSupabaseError(error)

  return (data ?? []).map((m) => ({
    ...m,
    estado: m.estado as MembresiaDetalle["estado"],
    nombre_usuario: (m.usuarios as { nombre: string } | null)?.nombre,
    email_usuario:  (m.usuarios as { email: string } | null)?.email,
    plan_nombre:    (m.planes as { nombre: string } | null)?.nombre,
    precio_mensual: (m.planes as { precio_mensual: number } | null)?.precio_mensual,
  }))
}

export async function getMembresiaActiva(userId: string): Promise<MembresiaDetalle | null> {
  const { data, error } = await supabase
    .from("membresias")
    .select(
      `
      id_membresia, id_usuario, id_plan, fecha_inicio, fecha_vencimiento,
      estado, motivo_cancelacion, created_at,
      planes ( nombre, precio_mensual )
    `,
    )
    .eq("id_usuario", userId)
    .eq("estado", "activa")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    handleSupabaseError(error)
  }

  return {
    ...data,
    estado: data.estado as MembresiaDetalle["estado"],
    plan_nombre:    (data.planes as { nombre: string } | null)?.nombre,
    precio_mensual: (data.planes as { precio_mensual: number } | null)?.precio_mensual,
  }
}

export async function crearMembresia(nueva: NuevaMembresia): Promise<string> {
  const { data, error } = await supabase
    .from("membresias")
    .insert({
      id_usuario:       nueva.id_usuario,
      id_plan:          nueva.id_plan,
      fecha_inicio:     nueva.fecha_inicio,
      fecha_vencimiento: nueva.fecha_vencimiento,
      estado:           "activa",
    })
    .select("id_membresia")
    .single()

  if (error) handleSupabaseError(error)
  return data.id_membresia
}

export async function cancelarMembresia(id: string, motivo: string): Promise<void> {
  const { error } = await supabase
    .from("membresias")
    .update({ estado: "cancelada", motivo_cancelacion: motivo })
    .eq("id_membresia", id)

  if (error) handleSupabaseError(error)
}

export async function getMembresiasPorVencer(gymId: string, diasHastaVencer: number = 7): Promise<MembresiaDetalle[]> {
  const fechaLimite = new Date()
  fechaLimite.setDate(fechaLimite.getDate() + diasHastaVencer)

  const { data, error } = await supabase
    .from("membresias")
    .select(
      `
      id_membresia, id_usuario, id_plan, fecha_inicio, fecha_vencimiento,
      estado, motivo_cancelacion, created_at,
      usuarios!inner ( nombre, email, id_gimnasio ),
      planes ( nombre, precio_mensual )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)
    .eq("estado", "activa")
    .lte("fecha_vencimiento", fechaLimite.toISOString().split("T")[0])
    .order("fecha_vencimiento", { ascending: true })

  if (error) handleSupabaseError(error)

  return (data ?? []).map((m) => ({
    ...m,
    estado: m.estado as MembresiaDetalle["estado"],
    nombre_usuario: (m.usuarios as { nombre: string } | null)?.nombre,
    email_usuario:  (m.usuarios as { email: string } | null)?.email,
    plan_nombre:    (m.planes as { nombre: string } | null)?.nombre,
    precio_mensual: (m.planes as { precio_mensual: number } | null)?.precio_mensual,
  }))
}
