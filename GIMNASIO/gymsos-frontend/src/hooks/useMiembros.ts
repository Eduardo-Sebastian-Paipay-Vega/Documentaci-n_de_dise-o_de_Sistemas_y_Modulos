"use client"

import { useState, useCallback, useMemo } from "react"
import { useAsyncWithDemoFallback } from "./useAsync"
import {
  getUsuariosPorGimnasio,
  getPagosPendientesPorVencer,
  getPagosPorGimnasio,
  type UsuarioConMembresia,
  type PagoDetalle,
} from "@/lib/services"

const DEMO_MIEMBROS: UsuarioConMembresia[] = [
  { id_usuario: "001", email: "juan@email.com",   nombre: "Juan Quispe",    telefono: "+51 912 345 678", fecha_nacimiento: null, documento: "87654321", genero: "M", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-01-01", updated_at: null, membresia: { id_membresia: "m1", estado: "activa",    fecha_inicio: "2026-05-01", fecha_vencimiento: "2026-06-30", plan_nombre: "Gold Premium", precio_mensual: 149.90 }, score_churn: 12 },
  { id_usuario: "002", email: "rosa@email.com",   nombre: "Rosa Chávez",    telefono: "+51 934 567 890", fecha_nacimiento: null, documento: "12345678", genero: "F", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-01-15", updated_at: null, membresia: { id_membresia: "m2", estado: "activa",    fecha_inicio: "2026-05-01", fecha_vencimiento: "2026-05-31", plan_nombre: "Silver",       precio_mensual: 109.90 }, score_churn: 58 },
  { id_usuario: "003", email: "pedro@email.com",  nombre: "Pedro Llontop",  telefono: "+51 956 789 012", fecha_nacimiento: null, documento: "55443322", genero: "M", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-02-01", updated_at: null, membresia: { id_membresia: "m3", estado: "activa",    fecha_inicio: "2026-05-01", fecha_vencimiento: "2026-06-15", plan_nombre: "Basic",        precio_mensual: 79.90  }, score_churn: 71 },
  { id_usuario: "004", email: "carmen@email.com", nombre: "Carmen Torres",  telefono: "+51 923 456 789", fecha_nacimiento: null, documento: "99887766", genero: "F", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-02-15", updated_at: null, membresia: { id_membresia: "m4", estado: "vencida",   fecha_inicio: "2026-03-01", fecha_vencimiento: "2026-04-30", plan_nombre: "Gold Premium", precio_mensual: 149.90 }, score_churn: 88 },
  { id_usuario: "005", email: "luis@email.com",   nombre: "Luis Mamani",    telefono: "+51 945 678 901", fecha_nacimiento: null, documento: "11223344", genero: "M", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-01-01", updated_at: null, membresia: { id_membresia: "m5", estado: "activa",    fecha_inicio: "2026-01-01", fecha_vencimiento: "2026-12-31", plan_nombre: "Enterprise",   precio_mensual: 299.90 }, score_churn: 5  },
  { id_usuario: "006", email: "ana@email.com",    nombre: "Ana Flores",     telefono: "+51 967 890 123", fecha_nacimiento: null, documento: "22334455", genero: "F", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-03-01", updated_at: null, membresia: { id_membresia: "m6", estado: "activa",    fecha_inicio: "2026-05-01", fecha_vencimiento: "2026-06-20", plan_nombre: "Silver",       precio_mensual: 109.90 }, score_churn: 29 },
  { id_usuario: "007", email: "miguel@email.com", nombre: "Miguel Huanca",  telefono: "+51 989 012 345", fecha_nacimiento: null, documento: "33445566", genero: "M", id_gimnasio: "g1", rol: "miembro", estado: "suspendido", created_at: "2026-01-20", updated_at: null, membresia: { id_membresia: "m7", estado: "suspendida",fecha_inicio: "2026-04-01", fecha_vencimiento: "2026-05-10", plan_nombre: "Basic",        precio_mensual: 79.90  }, score_churn: 95 },
  { id_usuario: "008", email: "paty@email.com",   nombre: "Patricia Ríos",  telefono: "+51 901 234 567", fecha_nacimiento: null, documento: "44556677", genero: "F", id_gimnasio: "g1", rol: "miembro", estado: "activo",     created_at: "2026-02-01", updated_at: null, membresia: { id_membresia: "m8", estado: "activa",    fecha_inicio: "2026-05-01", fecha_vencimiento: "2026-07-15", plan_nombre: "Gold Premium", precio_mensual: 149.90 }, score_churn: 18 },
]

const DEMO_PAGOS_PENDIENTES: PagoDetalle[] = [
  { id_pago: "", id_usuario: "002", id_membresia: "m2", monto: 109.90, moneda: "PEN", metodo_pago: "efectivo", estado: "pendiente", fecha_pago: "2026-05-31", proxima_renovacion: null, descripcion: "Renovación", nombre_usuario: "Rosa Chávez",   plan_nombre: "Silver"      },
  { id_pago: "", id_usuario: "004", id_membresia: "m4", monto: 149.90, moneda: "PEN", metodo_pago: "efectivo", estado: "pendiente", fecha_pago: "2026-06-01", proxima_renovacion: null, descripcion: "Renovación", nombre_usuario: "Carmen Torres",  plan_nombre: "Gold Premium"},
  { id_pago: "", id_usuario: "003", id_membresia: "m3", monto: 79.90,  moneda: "PEN", metodo_pago: "efectivo", estado: "pendiente", fecha_pago: "2026-06-03", proxima_renovacion: null, descripcion: "Renovación", nombre_usuario: "Pedro Llontop",  plan_nombre: "Basic"       },
]

export function useMiembros(gymId: string | undefined, opts: { busqueda?: string; estado?: string } = {}) {
  const { data, loading, error, refetch } = useAsyncWithDemoFallback(
    gymId
      ? () => getUsuariosPorGimnasio(gymId, { rol: "miembro", ...opts })
      : null,
    { data: DEMO_MIEMBROS, count: DEMO_MIEMBROS.length },
    [gymId, opts.busqueda, opts.estado],
  )

  return { miembros: data?.data ?? [], total: data?.count ?? 0, loading, error, refetch }
}

export function usePagosPendientes(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getPagosPendientesPorVencer(gymId) : null,
    DEMO_PAGOS_PENDIENTES,
    [gymId],
  )
}

const DEMO_PAGOS_HOY: PagoDetalle[] = [
  { id_pago: "p001", id_usuario: "001", id_membresia: "m1", monto: 149.90, moneda: "PEN", metodo_pago: "efectivo", estado: "completado", fecha_pago: new Date().toISOString(), proxima_renovacion: null, descripcion: null, nombre_usuario: "Juan Quispe",   plan_nombre: "Gold Premium" },
  { id_pago: "p002", id_usuario: "006", id_membresia: "m6", monto: 109.90, moneda: "PEN", metodo_pago: "yape",     estado: "completado", fecha_pago: new Date().toISOString(), proxima_renovacion: null, descripcion: null, nombre_usuario: "Ana Flores",    plan_nombre: "Silver" },
  { id_pago: "p003", id_usuario: "008", id_membresia: "m8", monto: 119.92, moneda: "PEN", metodo_pago: "tarjeta",  estado: "completado", fecha_pago: new Date().toISOString(), proxima_renovacion: null, descripcion: "Cupón DESC20",     nombre_usuario: "Patricia Ríos", plan_nombre: "Gold Premium" },
  { id_pago: "p004", id_usuario: "003", id_membresia: "m3", monto: 79.90,  moneda: "PEN", metodo_pago: "efectivo", estado: "pendiente",  fecha_pago: new Date().toISOString(), proxima_renovacion: null, descripcion: null, nombre_usuario: "Pedro Llontop", plan_nombre: "Basic" },
]

export function usePagosHoy(gymId: string | undefined) {
  // useMemo: computa 'desde' UNA sola vez al montar el componente.
  // new Date() en el cuerpo del hook crea una nueva string en CADA render,
  // lo que antes causaba re-ejecuciones infinitas de la query.
  const desde = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    return hoy.toISOString()
  }, [])

  return useAsyncWithDemoFallback(
    gymId ? () => getPagosPorGimnasio(gymId, { desde, limit: 50 }) : null,
    DEMO_PAGOS_HOY,
    [gymId, desde],
  )
}
