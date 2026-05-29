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
  // KPIs ejecutivos
  tasaRetencion: number       // % miembros que renovaron vs vencidos
  ltv: number                 // S/ ingreso promedio por miembro (LTV simple)
  ocupacionPromedio: number   // % ocupación promedio de clases hoy
  horaPico: string            // Hora con más accesos en los últimos 7 días
}

export type InsightAutomatico = {
  tipo: "positivo" | "alerta" | "neutro"
  mensaje: string
  metrica?: string
}

export function generarInsights(kpis: KPIsGerente, churnCount: number): InsightAutomatico[] {
  const insights: InsightAutomatico[] = []

  if (kpis.ingresosDelta > 10)
    insights.push({ tipo: "positivo", mensaje: `Ingresos creciendo ${kpis.ingresosDelta.toFixed(0)}% vs mes anterior`, metrica: "ingresos" })
  else if (kpis.ingresosDelta < -5)
    insights.push({ tipo: "alerta", mensaje: `Ingresos bajaron ${Math.abs(kpis.ingresosDelta).toFixed(0)}% vs mes anterior`, metrica: "ingresos" })

  if (kpis.tasaChurn > 10)
    insights.push({ tipo: "alerta", mensaje: `${churnCount} miembros en riesgo de abandono — acción urgente`, metrica: "churn" })
  else if (kpis.tasaChurn < 3)
    insights.push({ tipo: "positivo", mensaje: `Retención excelente: churn en ${kpis.tasaChurn}%`, metrica: "churn" })

  if (kpis.tasaRetencion > 85)
    insights.push({ tipo: "positivo", mensaje: `Retención mensual ${kpis.tasaRetencion}% — por encima del promedio del sector`, metrica: "retencion" })

  if (kpis.ocupacionPromedio > 80)
    insights.push({ tipo: "positivo", mensaje: `Clases al ${kpis.ocupacionPromedio}% de ocupación — considera agregar horarios`, metrica: "ocupacion" })
  else if (kpis.ocupacionPromedio < 40)
    insights.push({ tipo: "alerta", mensaje: `Ocupación de clases en ${kpis.ocupacionPromedio}% — revisa la programación`, metrica: "ocupacion" })

  if (kpis.miembrosDelta > 5)
    insights.push({ tipo: "positivo", mensaje: `+${kpis.miembrosDelta.toFixed(0)}% nuevos miembros este mes — crecimiento saludable`, metrica: "miembros" })

  return insights.slice(0, 3)
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

  // ── KPIs ejecutivos adicionales ─────────────────────────────────────────────

  // Retención: membresías que renovaron en los últimos 30 días vs las vencidas
  const [{ count: memVencidas }, { count: memRenovadas }, clasesOcupacion, accesosSemana] =
    await Promise.all([
      supabase
        .from("membresias")
        .select("id_membresia", { count: "exact", head: true })
        .eq("estado", "vencida")
        .gte("fecha_vencimiento", inicioMes.toISOString()),

      supabase
        .from("membresias")
        .select("id_membresia", { count: "exact", head: true })
        .eq("estado", "activa")
        .gte("fecha_inicio", inicioMes.toISOString()),

      supabase
        .from("clases")
        .select("capacidad_maxima, inscripciones(id_inscripcion)")
        .eq("id_gimnasio", gymId)
        .gte("fecha_hora_inicio", hoy.toISOString())
        .lt("fecha_hora_inicio", new Date(hoy.getTime() + 86400000).toISOString())
        .eq("estado", "programada"),

      supabase
        .from("accesos")
        .select("fecha_hora_entrada")
        .eq("id_gimnasio", gymId)
        .eq("estado_acceso", "permitido")
        .gte("fecha_hora_entrada", new Date(hoy.getTime() - 7 * 86400000).toISOString()),
    ])

  // Tasa de retención
  const totalVencidas = (memVencidas ?? 0) + (memRenovadas ?? 0)
  const tasaRetencion = totalVencidas > 0
    ? parseFloat(((memRenovadas ?? 0) / totalVencidas * 100).toFixed(1))
    : 100

  // LTV simple: ingresos totales del mes / miembros activos
  const ingresosMes         = (pagosMes ?? []).reduce((s, p) => s + Number(p.monto), 0)
  const ingresosMesAnterior = (pagosMesAnterior ?? []).reduce((s, p) => s + Number(p.monto), 0)
  const ingresosDelta       = ingresosMesAnterior > 0
    ? ((ingresosMes - ingresosMesAnterior) / ingresosMesAnterior) * 100
    : 0
  const ltv = (miembrosActivos ?? 0) > 0
    ? parseFloat((ingresosMes / (miembrosActivos ?? 1)).toFixed(2))
    : 0

  // Ocupación promedio de clases del día
  const clasesData = (clasesOcupacion.data ?? []) as Array<{ capacidad_maxima: number; inscripciones: unknown[] }>
  const ocupacionPromedio = clasesData.length > 0
    ? parseFloat(
        (clasesData.reduce((sum, c) => {
          const inscritos = Array.isArray(c.inscripciones) ? c.inscripciones.length : 0
          return sum + (inscritos / Math.max(c.capacidad_maxima, 1)) * 100
        }, 0) / clasesData.length).toFixed(1),
      )
    : 0

  // Hora pico: distribución por hora de los últimos 7 días
  const porHora: Record<number, number> = {}
  for (const a of accesosSemana.data ?? []) {
    const hora = new Date(a.fecha_hora_entrada).getHours()
    porHora[hora] = (porHora[hora] ?? 0) + 1
  }
  const horaPicoNum = Object.entries(porHora).sort(([, a], [, b]) => b - a)[0]?.[0]
  const horaPico = horaPicoNum ? `${horaPicoNum}:00 - ${Number(horaPicoNum) + 1}:00` : "—"

  const totalNow  = totalMiembros ?? 0
  const totalPrev = miembrosAnterior ?? 0
  const miembrosDelta = totalPrev > 0 ? ((totalNow - totalPrev) / totalPrev) * 100 : 0
  const tasaChurn = totalNow > 0 ? ((churnData?.length ?? 0) / totalNow) * 100 : 0

  return {
    totalMiembros:   totalNow,
    miembrosActivos: miembrosActivos ?? 0,
    ingresosMes,
    tasaChurn:       parseFloat(tasaChurn.toFixed(1)),
    npsScore:        72,
    accesoHoy:       accesoHoy ?? 0,
    clasesHoy:       clasesHoy ?? 0,
    churnDelta:      -0.5,
    ingresosDelta:   parseFloat(ingresosDelta.toFixed(1)),
    miembrosDelta:   parseFloat(miembrosDelta.toFixed(1)),
    tasaRetencion,
    ltv,
    ocupacionPromedio,
    horaPico,
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
    const usuarioRaw = (c as unknown as { usuarios?: unknown }).usuarios
    const usuario = Array.isArray(usuarioRaw) ? usuarioRaw[0] : usuarioRaw
    const membresiasRaw = usuario ? (usuario as { membresias?: unknown }).membresias : undefined
    const membresias = Array.isArray(membresiasRaw) ? membresiasRaw : []
    const memActiva = (membresias as Array<{ estado?: string; planes?: unknown }>).find((m) => m.estado === "activa")
    const planesRaw = memActiva?.planes
    const planObj = Array.isArray(planesRaw) ? planesRaw[0] : planesRaw
    const diasSinVisita = c.ultima_sesion
      ? Math.floor((Date.now() - new Date(c.ultima_sesion).getTime()) / 86400000)
      : 0

    return {
      id_usuario:        c.id_usuario,
      nombre:            (usuario as { nombre?: string } | undefined)?.nombre ?? "—",
      score_riesgo:      c.score_riesgo,
      dias_sin_visita:   diasSinVisita,
      plan:              (planObj as { nombre?: string } | undefined)?.nombre ?? "Sin plan",
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

