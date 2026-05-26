/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react"

jest.mock("@/lib/supabase", () => ({
  isDemoMode: true,
  supabase:   {},
}))

jest.mock("@/lib/services", () => ({
  getClasesHoy:               jest.fn(),
  getClasesDelEntrenador:     jest.fn(),
  getClasesPorGimnasio:       jest.fn(),
  getInscripcionesDelMiembro: jest.fn(),
}))

import {
  useClasesHoy,
  useClasesEntrenador,
  useClasesGerente,
  useInscripcionesDelMiembro,
} from "@/hooks/useClases"

describe("useClasesHoy (demo mode)", () => {
  test("retorna clases demo", () => {
    const { result } = renderHook(() => useClasesHoy("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  test("las clases tienen campos requeridos", () => {
    const { result } = renderHook(() => useClasesHoy("gym-001"))
    const clases = result.current.data ?? []
    clases.forEach(c => {
      expect(c).toHaveProperty("id_clase")
      expect(c).toHaveProperty("nombre")
      expect(c).toHaveProperty("capacidad_maxima")
      expect(c).toHaveProperty("fecha_hora_inicio")
      expect(c).toHaveProperty("estado")
    })
  })

  test("capacidad_maxima siempre es positiva", () => {
    const { result } = renderHook(() => useClasesHoy("gym-001"))
    const clases = result.current.data ?? []
    clases.forEach(c => {
      expect(c.capacidad_maxima).toBeGreaterThan(0)
    })
  })

  test("retorna datos aunque gymId sea undefined", () => {
    const { result } = renderHook(() => useClasesHoy(undefined))
    expect(result.current.loading).toBe(false)
  })
})

describe("useClasesEntrenador (demo mode)", () => {
  test("retorna clases para entrenador", () => {
    const { result } = renderHook(() => useClasesEntrenador("entrenador-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  test("las clases del entrenador tienen inscritos definidos", () => {
    const { result } = renderHook(() => useClasesEntrenador("entrenador-001"))
    const clases = result.current.data ?? []
    clases.forEach(c => {
      expect(c.inscritos).toBeDefined()
      expect(typeof c.inscritos).toBe("number")
    })
  })
})

describe("useClasesGerente (demo mode)", () => {
  test("retorna más clases que useClasesHoy (vista ampliada)", () => {
    const { result: hoy }    = renderHook(() => useClasesHoy("gym-001"))
    const { result: gerente } = renderHook(() => useClasesGerente("gym-001"))

    expect(gerente.current.data!.length).toBeGreaterThanOrEqual(hoy.current.data!.length)
  })
})

describe("useInscripcionesDelMiembro (demo mode)", () => {
  test("retorna array de IDs inscritos", () => {
    const { result } = renderHook(() => useInscripcionesDelMiembro("user-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  test("los IDs son strings", () => {
    const { result } = renderHook(() => useInscripcionesDelMiembro("user-001"))
    const ids = result.current.data ?? []
    ids.forEach(id => {
      expect(typeof id).toBe("string")
    })
  })
})
