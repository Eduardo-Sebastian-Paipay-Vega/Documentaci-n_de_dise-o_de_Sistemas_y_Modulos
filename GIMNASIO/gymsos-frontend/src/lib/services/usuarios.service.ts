import { supabase, handleSupabaseError, type PaginatedResult, type QueryOptions } from "./base"
import type { DbUsuario } from "@/lib/supabase"

export type UsuarioConMembresia = DbUsuario & {
  nombre_gimnasio?: string
  membresia?: {
    id_membresia: string
    estado: string
    fecha_inicio: string
    fecha_vencimiento: string
    plan_nombre: string
    precio_mensual: number
  } | null
  score_churn?: number
  sesiones_mes?: number
}

export type NuevoUsuario = {
  email: string
  nombre: string
  telefono?: string
  fecha_nacimiento?: string
  documento?: string
  genero?: "M" | "F" | "Otro"
  id_gimnasio: string
  rol: "miembro" | "entrenador" | "recepcionista" | "gerente"
}

export async function getUsuariosPorGimnasio(
  gymId: string,
  opts: QueryOptions & { rol?: string; estado?: string; busqueda?: string } = {},
): Promise<PaginatedResult<UsuarioConMembresia>> {
  let q = supabase
    .from("usuarios")
    .select(
      `
      id_usuario, email, nombre, telefono, fecha_nacimiento, documento,
      genero, id_gimnasio, rol, estado, created_at, updated_at,
      membresias (
        id_membresia, estado, fecha_inicio, fecha_vencimiento,
        planes ( nombre, precio_mensual )
      ),
      churn_predictions (
        score_riesgo
      )
    `,
      { count: "exact" },
    )
    .eq("id_gimnasio", gymId)

  if (opts.rol) q = q.eq("rol", opts.rol)
  if (opts.estado) q = q.eq("estado", opts.estado)
  if (opts.busqueda) {
    q = q.or(`nombre.ilike.%${opts.busqueda}%,email.ilike.%${opts.busqueda}%`)
  }

  q = q.order("created_at", { ascending: false })

  if (opts.limit) q = q.limit(opts.limit)
  if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 50) - 1)

  const { data, error, count } = await q

  if (error) handleSupabaseError(error)

  const usuarios: UsuarioConMembresia[] = (data ?? []).map((u) => {
    const memActiva = Array.isArray(u.membresias)
      ? u.membresias.find((m: { estado: string }) => m.estado === "activa")
      : null
    const churnLatest = Array.isArray(u.churn_predictions) && u.churn_predictions.length > 0
      ? u.churn_predictions[0]
      : null

    return {
      ...u,
      genero: u.genero as "M" | "F" | "Otro" | null,
      rol: u.rol as DbUsuario["rol"],
      estado: u.estado as DbUsuario["estado"],
      membresia: memActiva
        ? {
            id_membresia:      memActiva.id_membresia,
            estado:            memActiva.estado,
            fecha_inicio:      memActiva.fecha_inicio,
            fecha_vencimiento: memActiva.fecha_vencimiento,
            plan_nombre:       (memActiva.planes as { nombre: string; precio_mensual: number } | null)?.nombre ?? "—",
            precio_mensual:    (memActiva.planes as { nombre: string; precio_mensual: number } | null)?.precio_mensual ?? 0,
          }
        : null,
      score_churn: churnLatest?.score_riesgo ?? 0,
    }
  })

  return { data: usuarios, count: count ?? 0 }
}

export async function getUsuarioById(id: string): Promise<UsuarioConMembresia | null> {
  const { data, error } = await supabase
    .from("usuarios")
    .select(
      `
      *,
      gimnasios ( nombre ),
      membresias (
        id_membresia, estado, fecha_inicio, fecha_vencimiento,
        planes ( nombre, precio_mensual )
      )
    `,
    )
    .eq("id_usuario", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    handleSupabaseError(error)
  }

  const memActiva = Array.isArray(data.membresias)
    ? data.membresias.find((m: { estado: string }) => m.estado === "activa")
    : null

  return {
    ...data,
    genero: data.genero as "M" | "F" | "Otro" | null,
    rol: data.rol as DbUsuario["rol"],
    estado: data.estado as DbUsuario["estado"],
    nombre_gimnasio: (data.gimnasios as { nombre: string } | null)?.nombre,
    membresia: memActiva
      ? {
          id_membresia:      memActiva.id_membresia,
          estado:            memActiva.estado,
          fecha_inicio:      memActiva.fecha_inicio,
          fecha_vencimiento: memActiva.fecha_vencimiento,
          plan_nombre:       (memActiva.planes as { nombre: string; precio_mensual: number } | null)?.nombre ?? "—",
          precio_mensual:    (memActiva.planes as { nombre: string; precio_mensual: number } | null)?.precio_mensual ?? 0,
        }
      : null,
  }
}

export async function actualizarEstadoUsuario(
  id: string,
  estado: "activo" | "inactivo" | "suspendido",
): Promise<void> {
  const { error } = await supabase
    .from("usuarios")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id_usuario", id)

  if (error) handleSupabaseError(error)
}

export async function buscarUsuarios(
  gymId: string,
  termino: string,
  limit = 6,
): Promise<Pick<DbUsuario, "id_usuario" | "nombre" | "email" | "documento">[]> {
  if (!termino.trim()) return []
  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, email, documento")
    .eq("id_gimnasio", gymId)
    .eq("rol", "miembro")
    .or(`nombre.ilike.%${termino}%,email.ilike.%${termino}%,documento.ilike.%${termino}%`)
    .limit(limit)

  if (error) handleSupabaseError(error)
  return data ?? []
}

export async function registrarNuevoMiembro(datos: {
  nombre: string
  email: string
  telefono?: string
  documento?: string
  genero?: "M" | "F" | "Otro"
  id_gimnasio: string
  id_plan: string
  duracion_dias?: number
  metodo_pago: "tarjeta" | "transferencia" | "efectivo" | "yape" | "plin"
  monto: number
}): Promise<{ id_usuario: string; id_membresia: string; id_pago: string }> {
  const tempPassword = Math.random().toString(36).slice(2, 10) + "Gym2026!"

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: datos.email,
    password: tempPassword,
  })
  if (authError) handleSupabaseError(authError)
  const authUserId = authData.user!.id

  const { error: usuarioError } = await supabase.from("usuarios").insert({
    id_usuario:  authUserId,
    email:       datos.email,
    nombre:      datos.nombre,
    telefono:    datos.telefono ?? null,
    documento:   datos.documento ?? null,
    genero:      datos.genero ?? null,
    id_gimnasio: datos.id_gimnasio,
    rol:         "miembro",
    estado:      "activo",
  })
  if (usuarioError) handleSupabaseError(usuarioError)

  const fechaInicio      = new Date()
  const fechaVencimiento = new Date()
  fechaVencimiento.setDate(fechaVencimiento.getDate() + (datos.duracion_dias ?? 30))

  const { data: membresia, error: membresiaError } = await supabase
    .from("membresias")
    .insert({
      id_usuario:        authUserId,
      id_plan:           datos.id_plan,
      fecha_inicio:      fechaInicio.toISOString().split("T")[0],
      fecha_vencimiento: fechaVencimiento.toISOString().split("T")[0],
      estado:            "activa",
    })
    .select("id_membresia")
    .single()
  if (membresiaError) handleSupabaseError(membresiaError)

  const { data: pago, error: pagoError } = await supabase
    .from("pagos")
    .insert({
      id_usuario:   authUserId,
      id_membresia: membresia.id_membresia,
      monto:        datos.monto,
      moneda:       "PEN",
      metodo_pago:  datos.metodo_pago,
      estado:       "completado",
      descripcion:  "Registro nuevo miembro",
    })
    .select("id_pago")
    .single()
  if (pagoError) handleSupabaseError(pagoError)

  return { id_usuario: authUserId, id_membresia: membresia.id_membresia, id_pago: pago.id_pago }
}

export async function contarMiembrosPorEstado(gymId: string): Promise<{
  total: number
  activos: number
  inactivos: number
  suspendidos: number
}> {
  const { data, error } = await supabase
    .from("usuarios")
    .select("estado")
    .eq("id_gimnasio", gymId)
    .eq("rol", "miembro")

  if (error) handleSupabaseError(error)

  const todos = data ?? []
  return {
    total:       todos.length,
    activos:     todos.filter((u) => u.estado === "activo").length,
    inactivos:   todos.filter((u) => u.estado === "inactivo").length,
    suspendidos: todos.filter((u) => u.estado === "suspendido").length,
  }
}
