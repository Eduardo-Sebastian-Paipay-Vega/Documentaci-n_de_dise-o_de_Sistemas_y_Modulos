"use client"

import { useAsyncWithDemoFallback } from "./useAsync"
import {
  getClasesHoy,
  getClasesDelEntrenador,
  getClasesPorGimnasio,
  getInscripcionesDelMiembro,
  type ClaseDetalle,
} from "@/lib/services"

const DEMO_CLASES_HOY: ClaseDetalle[] = [
  { id_clase: "c1", id_gimnasio: "g1", id_entrenador: "e1", id_espacio: "s1", nombre: "Spinning Extremo",   descripcion: null, capacidad_maxima: 15, nivel: "avanzado",    fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T07:30:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "lun,mie,vie", estado: "programada", nombre_entrenador: "Coach Ana", nombre_espacio: "Sala A", inscritos: 12 },
  { id_clase: "c2", id_gimnasio: "g1", id_entrenador: "e2", id_espacio: "s2", nombre: "Yoga Flow",          descripcion: null, capacidad_maxima: 20, nivel: "principiante", fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T10:00:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "lun,jue",    estado: "programada", nombre_entrenador: "María V.", nombre_espacio: "Sala B", inscritos: 8  },
  { id_clase: "c3", id_gimnasio: "g1", id_entrenador: "e3", id_espacio: "s3", nombre: "HIIT Total",         descripcion: null, capacidad_maxima: 10, nivel: "intermedio",   fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T18:30:00`, duracion_minutos: 45, recurrencia: "diaria",  dias_semana: null,         estado: "programada", nombre_entrenador: "Coach J.", nombre_espacio: "Sala C", inscritos: 9  },
  { id_clase: "c4", id_gimnasio: "g1", id_entrenador: "e1", id_espacio: "s4", nombre: "CrossFit Básico",    descripcion: null, capacidad_maxima: 14, nivel: "principiante", fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T19:30:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "lun,mie,vie", estado: "programada", nombre_entrenador: "Coach Ana", nombre_espacio: "Sala C", inscritos: 14 },
]

const DEMO_CLASES_ENTRENADOR: ClaseDetalle[] = [
  { id_clase: "c1", id_gimnasio: "g1", id_entrenador: "e1", id_espacio: "s1", nombre: "Spinning Extremo",   descripcion: null, capacidad_maxima: 15, nivel: "avanzado",    fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T07:30:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "lun,mie,vie", estado: "en_curso",  nombre_espacio: "Sala A", inscritos: 12 },
  { id_clase: "c2", id_gimnasio: "g1", id_entrenador: "e1", id_espacio: "s3", nombre: "HIIT Total",         descripcion: null, capacidad_maxima: 10, nivel: "intermedio",   fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T09:00:00`, duracion_minutos: 45, recurrencia: "diaria",  dias_semana: null,         estado: "programada", nombre_espacio: "Sala C", inscritos: 8  },
  { id_clase: "c3", id_gimnasio: "g1", id_entrenador: "e1", id_espacio: "s2", nombre: "Funcional Avanzado", descripcion: null, capacidad_maxima: 12, nivel: "avanzado",    fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T11:00:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "mar,jue",    estado: "programada", nombre_espacio: "Sala B", inscritos: 6  },
  { id_clase: "c4", id_gimnasio: "g1", id_entrenador: "e1", id_espacio: "s3", nombre: "CrossFit Básico",    descripcion: null, capacidad_maxima: 14, nivel: "principiante", fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T18:30:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "lun,mie,vie", estado: "programada", nombre_espacio: "Sala C", inscritos: 14 },
]

const DEMO_CLASES_GERENTE: ClaseDetalle[] = [
  ...DEMO_CLASES_HOY,
  { id_clase: "c5", id_gimnasio: "g1", id_entrenador: "e2", id_espacio: "s2", nombre: "Zumba Power",      descripcion: null, capacidad_maxima: 25, nivel: "principiante", fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T17:00:00`, duracion_minutos: 60, recurrencia: "semanal", dias_semana: "mar,jue", estado: "programada", nombre_entrenador: "María R.", nombre_espacio: "Sala B", inscritos: 19 },
  { id_clase: "c6", id_gimnasio: "g1", id_entrenador: "e3", id_espacio: "s4", nombre: "Pilates Core",     descripcion: null, capacidad_maxima: 15, nivel: "intermedio",   fecha_hora_inicio: `${new Date().toISOString().split("T")[0]}T09:00:00`, duracion_minutos: 50, recurrencia: "semanal", dias_semana: "lun,vie",  estado: "programada", nombre_entrenador: "Coach J.", nombre_espacio: "Sala D", inscritos: 6  },
]

export function useClasesGerente(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getClasesPorGimnasio(gymId) : null,
    DEMO_CLASES_GERENTE,
    [gymId],
  )
}

export function useClasesHoy(gymId: string | undefined) {
  return useAsyncWithDemoFallback(
    gymId ? () => getClasesHoy(gymId) : null,
    DEMO_CLASES_HOY,
    [gymId],
  )
}

export function useClasesEntrenador(entrenadorId: string | undefined) {
  return useAsyncWithDemoFallback(
    entrenadorId ? () => getClasesDelEntrenador(entrenadorId) : null,
    DEMO_CLASES_ENTRENADOR,
    [entrenadorId],
  )
}

export function useInscripcionesDelMiembro(userId: string | undefined) {
  return useAsyncWithDemoFallback(
    userId ? () => getInscripcionesDelMiembro(userId) : null,
    ["c1"],
    [userId],
  )
}
