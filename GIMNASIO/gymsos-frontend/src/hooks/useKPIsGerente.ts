"use client"

import { useAsyncWithDemoFallback } from "./useAsync"
import {
  getKPIsGerente,
  getChurnAtRisk,
  getIngresosPorMesGrafica,
  type KPIsGerente,
  type ChurnAtRisk,
  type IngresoMensual,
} from "@/lib/services"

const DEMO_KPIS: KPIsGerente = {
  totalMiembros:   1247,
  miembrosActivos: 1198,
  ingresosMes:     37140,
  tasaChurn:       2.1,
  npsScore:        72,
  accesoHoy:       42,
  clasesHoy:       8,
  churnDelta:      -0.5,
  ingresosDelta:   8.3,
  miembrosDelta:   12,
  tasaRetencion:   87.4,
  ltv:             31.0,
  ocupacionPromedio: 73,
  horaPico:        "07:00 - 08:00",
}

const DEMO_CHURN: ChurnAtRisk[] = [
  { id_usuario: "d1", nombre: "Carlos M.",  score_riesgo: 85, dias_sin_visita: 18, plan: "Gold Premium", dias_para_abandono: 12 },
  { id_usuario: "d2", nombre: "Ana Torres", score_riesgo: 71, dias_sin_visita: 22, plan: "Silver",       dias_para_abandono: 21 },
  { id_usuario: "d3", nombre: "Luis P.",    score_riesgo: 64, dias_sin_visita: 31, plan: "Gold Premium", dias_para_abandono: 30 },
  { id_usuario: "d4", nombre: "Rosa Ch.",   score_riesgo: 58, dias_sin_visita: 38, plan: "Basic",        dias_para_abandono: null },
]

const DEMO_INGRESOS: IngresoMensual[] = [
  { mes: "Jun", valor: 26000, indice: 52 }, { mes: "Jul", valor: 30500, indice: 61 },
  { mes: "Ago", valor: 29000, indice: 58 }, { mes: "Sep", valor: 37000, indice: 74 },
  { mes: "Oct", valor: 34500, indice: 69 }, { mes: "Nov", valor: 41500, indice: 83 },
  { mes: "Dic", valor: 39000, indice: 78 }, { mes: "Ene", valor: 44000, indice: 88 },
  { mes: "Feb", valor: 46000, indice: 92 }, { mes: "Mar", valor: 43500, indice: 87 },
  { mes: "Abr", valor: 48000, indice: 96 }, { mes: "May", valor: 50000, indice: 100 },
]

export function useKPIsGerente(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getKPIsGerente(gymId) : null,
    DEMO_KPIS,
    [gymId],
  )
}

export function useChurnAtRisk(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getChurnAtRisk(gymId) : null,
    DEMO_CHURN,
    [gymId],
  )
}

export function useIngresosMensuales(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getIngresosPorMesGrafica(gymId) : null,
    DEMO_INGRESOS,
    [gymId],
  )
}
