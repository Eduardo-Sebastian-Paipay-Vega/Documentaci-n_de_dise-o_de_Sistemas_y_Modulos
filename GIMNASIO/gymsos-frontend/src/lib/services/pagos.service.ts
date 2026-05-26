import { supabase, handleSupabaseError, type QueryOptions } from "./base"

export type PagoDetalle = {
  id_pago: string
  id_usuario: string
  id_membresia: string | null
  monto: number
  moneda: string
  metodo_pago: "tarjeta" | "transferencia" | "efectivo" | "yape" | "plin"
  estado: "pendiente" | "completado" | "fallido" | "reembolsado"
  fecha_pago: string
  proxima_renovacion: string | null
  descripcion: string | null
  nombre_usuario?: string
  email_usuario?: string
  plan_nombre?: string
}

export type NuevoPago = {
  id_usuario: string
  id_membresia?: string
  monto: number
  moneda?: string
  metodo_pago: "tarjeta" | "transferencia" | "efectivo" | "yape" | "plin"
  descripcion?: string
  proxima_renovacion?: string
}

export async function getPagosPorGimnasio(
  gymId: string,
  opts: QueryOptions & { estado?: string; desde?: string; hasta?: string } = {},
): Promise<PagoDetalle[]> {
  let q = supabase
    .from("pagos")
    .select(
      `
      id_pago, id_usuario, id_membresia, monto, moneda, metodo_pago,
      estado, fecha_pago, proxima_renovacion, descripcion, created_at,
      usuarios!inner ( nombre, email, id_gimnasio ),
      membresias (
        planes ( nombre )
      )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)

  if (opts.estado) q = q.eq("estado", opts.estado)
  if (opts.desde) q = q.gte("fecha_pago", opts.desde)
  if (opts.hasta) q = q.lte("fecha_pago", opts.hasta)

  q = q.order("fecha_pago", { ascending: false })
  if (opts.limit) q = q.limit(opts.limit)

  const { data, error } = await q
  if (error) handleSupabaseError(error)

  return (data ?? []).map((p) => ({
    ...p,
    metodo_pago: p.metodo_pago as PagoDetalle["metodo_pago"],
    estado:      p.estado as PagoDetalle["estado"],
    nombre_usuario: (p.usuarios as { nombre: string } | null)?.nombre,
    email_usuario:  (p.usuarios as { email: string } | null)?.email,
    plan_nombre:
      (p.membresias as { planes: { nombre: string } | null } | null)?.planes?.nombre,
  }))
}

export async function getPagosPendientesPorVencer(gymId: string): Promise<PagoDetalle[]> {
  const hoy = new Date().toISOString().split("T")[0]
  const en7dias = new Date()
  en7dias.setDate(en7dias.getDate() + 7)

  const { data, error } = await supabase
    .from("membresias")
    .select(
      `
      id_membresia, id_usuario, fecha_vencimiento,
      usuarios!inner ( nombre, email, id_gimnasio ),
      planes ( nombre, precio_mensual )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)
    .eq("estado", "activa")
    .lte("fecha_vencimiento", en7dias.toISOString().split("T")[0])
    .gte("fecha_vencimiento", hoy)
    .order("fecha_vencimiento", { ascending: true })

  if (error) handleSupabaseError(error)

  return (data ?? []).map((m) => ({
    id_pago:           "",
    id_usuario:        m.id_usuario,
    id_membresia:      m.id_membresia,
    monto:             (m.planes as { precio_mensual: number } | null)?.precio_mensual ?? 0,
    moneda:            "PEN",
    metodo_pago:       "efectivo" as const,
    estado:            "pendiente" as const,
    fecha_pago:        m.fecha_vencimiento,
    proxima_renovacion: null,
    descripcion:       "Renovación de membresía",
    nombre_usuario:    (m.usuarios as { nombre: string } | null)?.nombre,
    email_usuario:     (m.usuarios as { email: string } | null)?.email,
    plan_nombre:       (m.planes as { nombre: string } | null)?.nombre,
  }))
}

export async function registrarPago(pago: NuevoPago): Promise<string> {
  const { data, error } = await supabase
    .from("pagos")
    .insert({
      id_usuario:        pago.id_usuario,
      id_membresia:      pago.id_membresia ?? null,
      monto:             pago.monto,
      moneda:            pago.moneda ?? "PEN",
      metodo_pago:       pago.metodo_pago,
      estado:            "completado",
      descripcion:       pago.descripcion ?? null,
      proxima_renovacion: pago.proxima_renovacion ?? null,
    })
    .select("id_pago")
    .single()

  if (error) handleSupabaseError(error)
  return data.id_pago
}

export async function getTotalIngresosMes(gymId: string): Promise<number> {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("pagos")
    .select(
      `
      monto,
      usuarios!inner ( id_gimnasio )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)
    .eq("estado", "completado")
    .gte("fecha_pago", inicioMes.toISOString())

  if (error) handleSupabaseError(error)
  return (data ?? []).reduce((sum, p) => sum + Number(p.monto), 0)
}

export async function getIngresosPorMes(gymId: string, meses = 12): Promise<{ mes: string; total: number }[]> {
  const desde = new Date()
  desde.setMonth(desde.getMonth() - meses + 1)
  desde.setDate(1)
  desde.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("pagos")
    .select(
      `
      monto, fecha_pago,
      usuarios!inner ( id_gimnasio )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)
    .eq("estado", "completado")
    .gte("fecha_pago", desde.toISOString())
    .order("fecha_pago", { ascending: true })

  if (error) handleSupabaseError(error)

  const porMes: Record<string, number> = {}
  for (const p of data ?? []) {
    const fecha = new Date(p.fecha_pago)
    const key = fecha.toLocaleString("es-PE", { month: "short" })
    porMes[key] = (porMes[key] ?? 0) + Number(p.monto)
  }

  return Object.entries(porMes).map(([mes, total]) => ({ mes, total }))
}
