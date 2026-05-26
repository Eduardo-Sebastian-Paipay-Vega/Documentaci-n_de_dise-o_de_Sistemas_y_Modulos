import { supabase, handleSupabaseError, type QueryOptions } from "./base"

export type AccesoDetalle = {
  id_acceso: string
  id_usuario: string
  id_gimnasio: string
  fecha_hora_entrada: string
  fecha_hora_salida: string | null
  tipo_acceso: "qr" | "biometria" | "manual"
  estado_acceso: "permitido" | "denegado"
  razon_denegacion: string | null
  nombre_usuario?: string
  plan_usuario?: string
}

export async function getAccesosRecientes(
  gymId: string,
  opts: QueryOptions = {},
): Promise<AccesoDetalle[]> {
  const { data, error } = await supabase
    .from("accesos")
    .select(
      `
      id_acceso, id_usuario, id_gimnasio, fecha_hora_entrada, fecha_hora_salida,
      tipo_acceso, estado_acceso, razon_denegacion, created_at,
      usuarios (
        nombre,
        membresias (
          estado,
          planes ( nombre )
        )
      )
    `,
    )
    .eq("id_gimnasio", gymId)
    .order("fecha_hora_entrada", { ascending: false })
    .limit(opts.limit ?? 20)

  if (error) handleSupabaseError(error)

  return (data ?? []).map((a) => {
    const usuario = a.usuarios as {
      nombre: string
      membresias: Array<{ estado: string; planes: { nombre: string } | null }>
    } | null
    const memActiva = usuario?.membresias?.find((m) => m.estado === "activa")

    return {
      id_acceso:          a.id_acceso,
      id_usuario:         a.id_usuario,
      id_gimnasio:        a.id_gimnasio,
      fecha_hora_entrada: a.fecha_hora_entrada,
      fecha_hora_salida:  a.fecha_hora_salida,
      tipo_acceso:        a.tipo_acceso as AccesoDetalle["tipo_acceso"],
      estado_acceso:      a.estado_acceso as AccesoDetalle["estado_acceso"],
      razon_denegacion:   a.razon_denegacion,
      nombre_usuario:     usuario?.nombre,
      plan_usuario:       memActiva?.planes?.nombre,
    }
  })
}

export async function contarAccesosHoy(gymId: string): Promise<{ total: number; actualmente_dentro: number }> {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const { data: todayData, error: todayError } = await supabase
    .from("accesos")
    .select("id_acceso, fecha_hora_salida")
    .eq("id_gimnasio", gymId)
    .eq("estado_acceso", "permitido")
    .gte("fecha_hora_entrada", hoy.toISOString())

  if (todayError) handleSupabaseError(todayError)

  const todos = todayData ?? []
  const dentroAhora = todos.filter((a) => !a.fecha_hora_salida).length

  return {
    total:              todos.length,
    actualmente_dentro: dentroAhora,
  }
}

export async function registrarAcceso(
  usuarioId: string,
  gymId: string,
  tipo: "qr" | "biometria" | "manual" = "manual",
): Promise<{ permitido: boolean; razon?: string }> {
  // Verificar membresía activa
  const { data: membresia } = await supabase
    .from("membresias")
    .select("id_membresia, estado, fecha_vencimiento")
    .eq("id_usuario", usuarioId)
    .eq("estado", "activa")
    .gte("fecha_vencimiento", new Date().toISOString().split("T")[0])
    .single()

  const permitido = !!membresia
  const razon = permitido ? undefined : "Membresía inactiva o vencida"

  const { error } = await supabase.from("accesos").insert({
    id_usuario:        usuarioId,
    id_gimnasio:       gymId,
    tipo_acceso:       tipo,
    estado_acceso:     permitido ? "permitido" : "denegado",
    razon_denegacion:  razon ?? null,
  })

  if (error) handleSupabaseError(error)
  return { permitido, razon }
}

export async function registrarSalida(accesoId: string): Promise<void> {
  const { error } = await supabase
    .from("accesos")
    .update({ fecha_hora_salida: new Date().toISOString() })
    .eq("id_acceso", accesoId)

  if (error) handleSupabaseError(error)
}

export async function getHistorialAccesoMiembro(
  userId: string,
  limit = 30,
): Promise<AccesoDetalle[]> {
  const { data, error } = await supabase
    .from("accesos")
    .select(
      "id_acceso, id_usuario, id_gimnasio, fecha_hora_entrada, fecha_hora_salida, tipo_acceso, estado_acceso, razon_denegacion",
    )
    .eq("id_usuario", userId)
    .order("fecha_hora_entrada", { ascending: false })
    .limit(limit)

  if (error) handleSupabaseError(error)

  return (data ?? []).map((a) => ({
    ...a,
    tipo_acceso:   a.tipo_acceso as AccesoDetalle["tipo_acceso"],
    estado_acceso: a.estado_acceso as AccesoDetalle["estado_acceso"],
  }))
}
