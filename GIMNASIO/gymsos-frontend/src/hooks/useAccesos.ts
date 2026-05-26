"use client"

import { useAsyncWithDemoFallback } from "./useAsync"
import {
  getAccesosRecientes,
  contarAccesosHoy,
  getHistorialAccesoMiembro,
  type AccesoDetalle,
} from "@/lib/services"

const DEMO_ACCESOS: AccesoDetalle[] = [
  { id_acceso: "a1", id_usuario: "u1", id_gimnasio: "g1", fecha_hora_entrada: new Date().toISOString(), fecha_hora_salida: null,             tipo_acceso: "qr",     estado_acceso: "permitido", razon_denegacion: null, nombre_usuario: "Ana Torres",  plan_usuario: "Gold Premium" },
  { id_acceso: "a2", id_usuario: "u2", id_gimnasio: "g1", fecha_hora_entrada: new Date(Date.now() - 900000).toISOString(),  fecha_hora_salida: null,             tipo_acceso: "qr",     estado_acceso: "permitido", razon_denegacion: null, nombre_usuario: "Carlos M.",   plan_usuario: "Gold Premium" },
  { id_acceso: "a3", id_usuario: "u3", id_gimnasio: "g1", fecha_hora_entrada: new Date(Date.now() - 1800000).toISOString(), fecha_hora_salida: new Date().toISOString(), tipo_acceso: "manual", estado_acceso: "permitido", razon_denegacion: null, nombre_usuario: "Jorge F.",    plan_usuario: "Silver" },
  { id_acceso: "a4", id_usuario: "u4", id_gimnasio: "g1", fecha_hora_entrada: new Date(Date.now() - 2700000).toISOString(), fecha_hora_salida: null,             tipo_acceso: "qr",     estado_acceso: "permitido", razon_denegacion: null, nombre_usuario: "Rosa Ch.",    plan_usuario: "Basic" },
  { id_acceso: "a5", id_usuario: "u5", id_gimnasio: "g1", fecha_hora_entrada: new Date(Date.now() - 3600000).toISOString(), fecha_hora_salida: new Date().toISOString(), tipo_acceso: "qr",     estado_acceso: "permitido", razon_denegacion: null, nombre_usuario: "Luis P.",     plan_usuario: "Silver" },
  { id_acceso: "a6", id_usuario: "u6", id_gimnasio: "g1", fecha_hora_entrada: new Date(Date.now() - 4500000).toISOString(), fecha_hora_salida: null,             tipo_acceso: "qr",     estado_acceso: "permitido", razon_denegacion: null, nombre_usuario: "María V.",    plan_usuario: "Gold Premium" },
]

const DEMO_CONTEO = { total: 42, actualmente_dentro: 17 }

export function useAccesosRecientes(gymId: string | undefined, limit = 20) {
  return useAsyncWithDemoFallback(
    gymId ? () => getAccesosRecientes(gymId, { limit }) : null,
    DEMO_ACCESOS,
    [gymId, limit],
  )
}

export function useConteoAccesos(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => contarAccesosHoy(gymId) : null,
    DEMO_CONTEO,
    [gymId],
  )
}

export function useHistorialMiembro(userId: string | undefined) {
  return useAsyncWithDemoFallback(
    userId ? () => getHistorialAccesoMiembro(userId) : null,
    [],
    [userId],
  )
}
