import { supabase, handleSupabaseError, type QueryOptions } from "./base"

export type ClaseDetalle = {
  id_clase: string
  id_gimnasio: string
  id_entrenador: string | null
  id_espacio: string | null
  nombre: string
  descripcion: string | null
  capacidad_maxima: number
  nivel: "principiante" | "intermedio" | "avanzado" | null
  fecha_hora_inicio: string
  duracion_minutos: number
  recurrencia: "unica" | "diaria" | "semanal" | "mensual" | null
  dias_semana: string | null
  estado: "programada" | "en_curso" | "finalizada" | "cancelada"
  nombre_entrenador?: string
  nombre_espacio?: string
  inscritos?: number
}

export type InscripcionDetalle = {
  id_inscripcion: string
  id_usuario: string
  id_clase: string
  fecha_inscripcion: string
  estado: "inscrito" | "asistio" | "ausente" | "cancelado"
  nombre_usuario?: string
  email_usuario?: string
}

export async function getClasesPorGimnasio(
  gymId: string,
  opts: QueryOptions & { fecha?: string; estado?: string } = {},
): Promise<ClaseDetalle[]> {
  let q = supabase
    .from("clases")
    .select(
      `
      id_clase, id_gimnasio, id_entrenador, id_espacio, nombre, descripcion,
      capacidad_maxima, nivel, fecha_hora_inicio, duracion_minutos,
      recurrencia, dias_semana, estado, created_at,
      entrenadores (
        usuarios ( nombre )
      ),
      espacios ( nombre )
    `,
    )
    .eq("id_gimnasio", gymId)

  if (opts.estado) q = q.eq("estado", opts.estado)
  if (opts.fecha) {
    const fechaInicio = new Date(opts.fecha)
    fechaInicio.setHours(0, 0, 0, 0)
    const fechaFin = new Date(opts.fecha)
    fechaFin.setHours(23, 59, 59, 999)
    q = q
      .gte("fecha_hora_inicio", fechaInicio.toISOString())
      .lte("fecha_hora_inicio", fechaFin.toISOString())
  }

  q = q.order("fecha_hora_inicio", { ascending: true })
  if (opts.limit) q = q.limit(opts.limit)

  const { data, error } = await q
  if (error) handleSupabaseError(error)

  return (data ?? []).map((c) => ({
    ...c,
    nivel: c.nivel as ClaseDetalle["nivel"],
    recurrencia: c.recurrencia as ClaseDetalle["recurrencia"],
    estado: c.estado as ClaseDetalle["estado"],
    nombre_entrenador:
      (c.entrenadores as { usuarios: { nombre: string } | null } | null)?.usuarios?.nombre,
    nombre_espacio: (c.espacios as { nombre: string } | null)?.nombre,
  }))
}

export async function getClasesHoy(gymId: string): Promise<ClaseDetalle[]> {
  return getClasesPorGimnasio(gymId, { fecha: new Date().toISOString().split("T")[0] })
}

export async function getClasesDelEntrenador(entrenadorId: string): Promise<ClaseDetalle[]> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("clases")
    .select(
      `
      id_clase, id_gimnasio, id_entrenador, id_espacio, nombre, descripcion,
      capacidad_maxima, nivel, fecha_hora_inicio, duracion_minutos,
      recurrencia, dias_semana, estado, created_at,
      espacios ( nombre ),
      inscripciones ( id_inscripcion )
    `,
    )
    .eq("id_entrenador", entrenadorId)
    .gte("fecha_hora_inicio", hoy.toISOString())
    .order("fecha_hora_inicio", { ascending: true })
    .limit(20)

  if (error) handleSupabaseError(error)

  return (data ?? []).map((c) => ({
    ...c,
    nivel: c.nivel as ClaseDetalle["nivel"],
    recurrencia: c.recurrencia as ClaseDetalle["recurrencia"],
    estado: c.estado as ClaseDetalle["estado"],
    nombre_espacio: (c.espacios as { nombre: string } | null)?.nombre,
    inscritos: Array.isArray(c.inscripciones) ? c.inscripciones.length : 0,
  }))
}

export async function inscribirseEnClase(userId: string, claseId: string): Promise<string> {
  const { data, error } = await supabase
    .from("inscripciones")
    .insert({ id_usuario: userId, id_clase: claseId, estado: "inscrito" })
    .select("id_inscripcion")
    .single()

  if (error) handleSupabaseError(error)
  return data.id_inscripcion
}

export async function cancelarInscripcion(userId: string, claseId: string): Promise<void> {
  const { error } = await supabase
    .from("inscripciones")
    .update({ estado: "cancelado" })
    .eq("id_usuario", userId)
    .eq("id_clase", claseId)

  if (error) handleSupabaseError(error)
}

export async function getInscripcionesDelMiembro(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("inscripciones")
    .select("id_clase")
    .eq("id_usuario", userId)
    .eq("estado", "inscrito")

  if (error) handleSupabaseError(error)
  return (data ?? []).map((i) => i.id_clase)
}

export async function crearClase(clase: {
  id_gimnasio: string
  id_entrenador?: string
  id_espacio?: string
  nombre: string
  descripcion?: string
  capacidad_maxima: number
  nivel?: "principiante" | "intermedio" | "avanzado"
  fecha_hora_inicio: string
  duracion_minutos: number
  recurrencia?: "unica" | "diaria" | "semanal" | "mensual"
  dias_semana?: string
}): Promise<string> {
  const { data, error } = await supabase
    .from("clases")
    .insert({ ...clase, estado: "programada" })
    .select("id_clase")
    .single()

  if (error) handleSupabaseError(error)
  return data.id_clase
}

export async function actualizarEstadoClase(
  id: string,
  estado: "programada" | "en_curso" | "finalizada" | "cancelada",
): Promise<void> {
  const { error } = await supabase.from("clases").update({ estado }).eq("id_clase", id)
  if (error) handleSupabaseError(error)
}
