import { supabase, handleSupabaseError } from "./base"

export type KPIsGerente = {
  totalMiembros: number
  miembrosActivos: number
  ingresosMes: number
  tasaChurn: number
  npsScore: number
  accesoHoy: number
  clasesHoy: number
  churnDelta: number
  ingresosDelta: number
  miembrosDelta: number
}

export type ChurnAtRisk = {
  id_usuario: string
  nombre: string
  score_riesgo: number
  dias_sin_visita: number
  plan: string
  dias_para_abandono: number | null
}

export type IngresoMensual = {
  mes: string
  valor: number
  indice: number
}

export async function getKPIsGerente(gymId: string): Promise<KPIsGerente> {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  const inicioMesAnterior = new Date(inicioMes)
  inicioMesAnterior.setMonth(inicioMesAnterior.getMonth() - 1)

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const [
    { count: totalMiembros },
    { count: miembrosActivos },
    { data: pagosMes },
    { data: pagosMesAnterior },
    { count: miembrosAnterior },
    { count: accesoHoy },
    { count: clasesHoy },
    { data: churnData },
  ] = await Promise.all([
    supabase
      .from("usuarios")
      .select("id_usuario", { count: "exact", head: true })
      .eq("id_gimnasio", gymId)
      .eq("rol", "miembro"),

    supabase
      .from("usuarios")
      .select("id_usuario", { count: "exact", head: true })
      .eq("id_gimnasio", gymId)
      .eq("rol", "miembro")
      .eq("estado", "activo"),

    supabase
      .from("pagos")
      .select("monto, usuarios!inner(id_gimnasio)")
      .eq("usuarios.id_gimnasio", gymId)
      .eq("estado", "completado")
      .gte("fecha_pago", inicioMes.toISOString()),

    supabase
      .from("pagos")
      .select("monto, usuarios!inner(id_gimnasio)")
      .eq("usuarios.id_gimnasio", gymId)
      .eq("estado", "completado")
      .gte("fecha_pago", inicioMesAnterior.toISOString())
      .lt("fecha_pago", inicioMes.toISOString()),

    supabase
      .from("usuarios")
      .select("id_usuario", { count: "exact", head: true })
      .eq("id_gimnasio", gymId)
      .eq("rol", "miembro")
      .lt("created_at", inicioMes.toISOString()),

    supabase
      .from("accesos")
      .select("id_acceso", { count: "exact", head: true })
      .eq("id_gimnasio", gymId)
      .gte("fecha_hora_entrada", hoy.toISOString()),

    supabase
      .from("clases")
      .select("id_clase", { count: "exact", head: true })
      .eq("id_gimnasio", gymId)
      .gte("fecha_hora_inicio", hoy.toISOString())
      .lt("fecha_hora_inicio", new Date(hoy.getTime() + 86400000).toISOString()),

    supabase
      .from("churn_predictions")
      .select("score_riesgo, usuarios!inner(id_gimnasio)")
      .eq("usuarios.id_gimnasio", gymId)
      .gte("score_riesgo", 60),
  ])

  const ingresosMes         = (pagosMes ?? []).reduce((s, p) => s + Number(p.monto), 0)
  const ingresosMesAnterior = (pagosMesAnterior ?? []).reduce((s, p) => s + Number(p.monto), 0)
  const ingresosDelta       = ingresosMesAnterior > 0
    ? ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100
    : 0

  const totalNow  = totalMiembros ?? 0
  const totalPrev = miembrosAnterior ?? 0
  const miembrosDelta = totalPrev > 0 ? ((totalNow - totalPrev) / totalPrev) * 100 : 0

  const tasaChurn = totalNow > 0 ? ((churnData?.length ?? 0) / totalNow) * 100 : 0

  return {
    totalMiembros:  totalNow,
    miembrosActivos: miembrosActivos ?? 0,
    ingresosMes,
    tasaChurn:       parseFloat(tasaChurn.toFixed(1)),
    npsScore:        72,
    accesoHoy:       accesoHoy ?? 0,
    clasesHoy:       clasesHoy ?? 0,
    churnDelta:      -0.5,
    ingresosDelta:   parseFloat(ingresosDelta.toFixed(1)),
    miembrosDelta:   parseFloat(miembrosDelta.toFixed(1)),
  }
}

export async function getChurnAtRisk(gymId: string, limit = 10): Promise<ChurnAtRisk[]> {
  const { data, error } = await supabase
    .from("churn_predictions")
    .select(
      `
      id_prediction, id_usuario, score_riesgo, dias_para_abandono, ultima_sesion,
      usuarios!inner (
        nombre, id_gimnasio,
        membresias (
          estado,
          planes ( nombre )
        )
      )
    `,
    )
    .eq("usuarios.id_gimnasio", gymId)
    .gte("score_riesgo", 50)
    .order("score_riesgo", { ascending: false })
    .limit(limit)

  if (error) handleSupabaseError(error)

  return (data ?? []).map((c) => {
    const usuario = c.usuarios as {
      nombre: string
      membresias: Array<{ estado: string; planes: { nombre: string } | null }>
    } | null
    const memActiva = usuario?.membresias?.find((m) => m.estado === "activa")
    const diasSinVisita = c.ultima_sesion
      ? Math.floor((Date.now() - new Date(c.ultima_sesion).getTime()) / 86400000)
      : 0

    return {
      id_usuario:        c.id_usuario,
      nombre:            usuario?.nombre ?? "—",
      score_riesgo:      c.score_riesgo,
      dias_sin_visita:   diasSinVisita,
      plan:              memActiva?.planes?.nombre ?? "Sin plan",
      dias_para_abandono: c.dias_para_abandono,
    }
  })
}

export async function getIngresosPorMesGrafica(gymId: string, meses = 12): Promise<IngresoMensual[]> {
  const desde = new Date()
  desde.setMonth(desde.getMonth() - meses + 1)
  desde.setDate(1)
  desde.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from("pagos")
    .select("monto, fecha_pago, usuarios!inner(id_gimnasio)")
    .eq("usuarios.id_gimnasio", gymId)
    .eq("estado", "completado")
    .gte("fecha_pago", desde.toISOString())
    .order("fecha_pago", { ascending: true })

  if (error) handleSupabaseError(error)

  const porMes: Record<string, number> = {}
  const mesesOrden: string[] = []

  for (const p of data ?? []) {
    const fecha = new Date(p.fecha_pago)
    const key = fecha.toLocaleString("es-PE", { month: "short" })
    if (!porMes[key]) mesesOrden.push(key)
    porMes[key] = (porMes[key] ?? 0) + Number(p.monto)
  }

  const maxValor = Math.max(...Object.values(porMes), 1)

  return mesesOrden.map((mes, i) => ({
    mes,
    valor:  porMes[mes],
    indice: Math.round((porMes[mes] / maxValor) * 100),
  }))
}
