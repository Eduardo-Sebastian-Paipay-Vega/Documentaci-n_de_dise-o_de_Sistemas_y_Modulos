"use client"

import { useAsyncWithDemoFallback } from "./useAsync"
import { getPlanesPorGimnasio, type Plan } from "@/lib/services"

const DEMO_PLANES: Plan[] = [
  { id_plan: "p1", id_gimnasio: "g1", nombre: "Basic",        precio_mensual: 79.90,  precio_trimestral: null,   precio_anual: null,    duracion_dias: 30,  clases_incluidas: null, horarios_acceso: null, sucursales_incluidas: "una",  descripcion: "Acceso básico L-V",              activo: true },
  { id_plan: "p2", id_gimnasio: "g1", nombre: "Silver",       precio_mensual: 109.90, precio_trimestral: null,   precio_anual: null,    duracion_dias: 30,  clases_incluidas: 10,   horarios_acceso: null, sucursales_incluidas: "una",  descripcion: "Acceso completo + 10 clases",    activo: true },
  { id_plan: "p3", id_gimnasio: "g1", nombre: "Gold Premium", precio_mensual: 149.90, precio_trimestral: 429.90, precio_anual: null,    duracion_dias: 30,  clases_incluidas: null, horarios_acceso: null, sucursales_incluidas: "todas",descripcion: "Ilimitado + clases ilimitadas",  activo: true },
  { id_plan: "p4", id_gimnasio: "g1", nombre: "Enterprise",   precio_mensual: 299.90, precio_trimestral: null,   precio_anual: 2999.00, duracion_dias: 30,  clases_incluidas: null, horarios_acceso: null, sucursales_incluidas: "todas",descripcion: "Todo incluido + empresarial",    activo: true },
]

export function usePlanes(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getPlanesPorGimnasio(gymId) : null,
    DEMO_PLANES,
    [gymId],
  )
}
