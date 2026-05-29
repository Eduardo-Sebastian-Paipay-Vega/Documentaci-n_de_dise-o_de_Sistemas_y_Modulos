"use client"

import { useAsyncWithDemoFallback } from "./useAsync"
import {
  getGamificationLevel,
  getXPHistorial,
  getSesionesPorSemana,
  getTituloNivel,
  getXPIcon,
  type GamificationLevel,
  type XPEvento,
} from "@/lib/services/gamification.service"

const DEMO_LEVEL: GamificationLevel = {
  id_usuario:          "demo",
  xp_total:            3250,
  nivel_actual:        32,
  xp_proximo_nivel:    500,
  fecha_actualizacion: new Date().toISOString(),
}

const DEMO_XP: XPEvento[] = [
  { id_xp: "1", tipo_evento: "sesion_completada",  cantidad_xp: 100, descripcion: null, fecha_evento: new Date(Date.now() - 3600000).toISOString() },
  { id_xp: "2", tipo_evento: "clase_asistida",     cantidad_xp:  75, descripcion: "Yoga", fecha_evento: new Date(Date.now() - 86400000).toISOString() },
  { id_xp: "3", tipo_evento: "nuevo_pr",           cantidad_xp: 500, descripcion: "Sentadilla 120kg", fecha_evento: new Date(Date.now() - 172800000).toISOString() },
  { id_xp: "4", tipo_evento: "racha_7_dias",       cantidad_xp: 200, descripcion: null, fecha_evento: new Date(Date.now() - 259200000).toISOString() },
  { id_xp: "5", tipo_evento: "sesion_completada",  cantidad_xp: 100, descripcion: null, fecha_evento: new Date(Date.now() - 345600000).toISOString() },
]

const DEMO_SESIONES = [
  { semana: "S1", valor: 3 }, { semana: "S2", valor: 5 },
  { semana: "S3", valor: 2 }, { semana: "S4", valor: 6 },
  { semana: "S5", valor: 4 }, { semana: "S6", valor: 7 },
  { semana: "S7", valor: 5 }, { semana: "S8", valor: 8 },
]

export function useGamificationLevel(userId: string | undefined) {
  return useAsyncWithDemoFallback(
    userId ? () => getGamificationLevel(userId) : null,
    DEMO_LEVEL,
    [userId],
  )
}

export function useXPHistorial(userId: string | undefined) {
  return useAsyncWithDemoFallback(
    userId ? () => getXPHistorial(userId, 6) : null,
    DEMO_XP,
    [userId],
  )
}

export function useSesionesSemana(userId: string | undefined) {
  return useAsyncWithDemoFallback(
    userId ? () => getSesionesPorSemana(userId, 8) : null,
    DEMO_SESIONES,
    [userId],
  )
}

export { getTituloNivel, getXPIcon }
