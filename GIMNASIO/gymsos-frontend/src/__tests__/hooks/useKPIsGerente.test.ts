/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react"

jest.mock("@/lib/supabase", () => ({
  isDemoMode: true,
  supabase:   {},
}))

jest.mock("@/lib/services", () => ({
  getKPIsGerente:            jest.fn(),
  getChurnAtRisk:            jest.fn(),
  getIngresosPorMesGrafica:  jest.fn(),
}))

import {
  useKPIsGerente,
  useChurnAtRisk,
  useIngresosMensuales,
} from "@/hooks/useKPIsGerente"

describe("useKPIsGerente (demo mode)", () => {
  test("retorna KPIs demo sin loading", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).not.toBeNull()
  })

  test("el objeto KPIs tiene todos los campos", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    const k = result.current.data!
    expect(k).toHaveProperty("totalMiembros")
    expect(k).toHaveProperty("miembrosActivos")
    expect(k).toHaveProperty("ingresosMes")
    expect(k).toHaveProperty("tasaChurn")
    expect(k).toHaveProperty("npsScore")
    expect(k).toHaveProperty("accesoHoy")
    expect(k).toHaveProperty("clasesHoy")
    expect(k).toHaveProperty("churnDelta")
    expect(k).toHaveProperty("ingresosDelta")
    expect(k).toHaveProperty("miembrosDelta")
  })

  test("totalMiembros es positivo", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    expect(result.current.data!.totalMiembros).toBeGreaterThan(0)
  })

  test("miembrosActivos no supera totalMiembros", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    const { totalMiembros, miembrosActivos } = result.current.data!
    expect(miembrosActivos).toBeLessThanOrEqual(totalMiembros)
  })

  test("tasaChurn está entre 0 y 100", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    expect(result.current.data!.tasaChurn).toBeGreaterThanOrEqual(0)
    expect(result.current.data!.tasaChurn).toBeLessThanOrEqual(100)
  })

  test("ingresosMes es positivo", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    expect(result.current.data!.ingresosMes).toBeGreaterThan(0)
  })

  test("retorna datos cuando gymId es undefined", () => {
    const { result } = renderHook(() => useKPIsGerente(undefined))
    expect(result.current.loading).toBe(false)
  })

  test("no tiene error en estado inicial", () => {
    const { result } = renderHook(() => useKPIsGerente("gym-001"))
    expect(result.current.error).toBeNull()
  })
})

describe("useChurnAtRisk (demo mode)", () => {
  test("retorna array de usuarios en riesgo", () => {
    const { result } = renderHook(() => useChurnAtRisk("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  test("cada elemento tiene campos requeridos", () => {
    const { result } = renderHook(() => useChurnAtRisk("gym-001"))
    const items = result.current.data ?? []
    items.forEach(u => {
      expect(u).toHaveProperty("id_usuario")
      expect(u).toHaveProperty("nombre")
      expect(u).toHaveProperty("score_riesgo")
      expect(u).toHaveProperty("dias_sin_visita")
    })
  })

  test("score_riesgo está entre 0 y 100", () => {
    const { result } = renderHook(() => useChurnAtRisk("gym-001"))
    const items = result.current.data ?? []
    items.forEach(u => {
      expect(u.score_riesgo).toBeGreaterThanOrEqual(0)
      expect(u.score_riesgo).toBeLessThanOrEqual(100)
    })
  })

  test("retorna datos aunque gymId sea undefined", () => {
    const { result } = renderHook(() => useChurnAtRisk(undefined))
    expect(result.current.loading).toBe(false)
  })
})

describe("useIngresosMensuales (demo mode)", () => {
  test("retorna 12 meses de datos", () => {
    const { result } = renderHook(() => useIngresosMensuales("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(result.current.data!.length).toBe(12)
  })

  test("cada mes tiene campos mes e indice", () => {
    const { result } = renderHook(() => useIngresosMensuales("gym-001"))
    const meses = result.current.data ?? []
    meses.forEach(m => {
      expect(m).toHaveProperty("mes")
      expect(m).toHaveProperty("indice")
      expect(typeof m.mes).toBe("string")
      expect(m.indice).toBeGreaterThanOrEqual(0)
      expect(m.indice).toBeLessThanOrEqual(100)
    })
  })

  test("retorna datos aunque gymId sea undefined", () => {
    const { result } = renderHook(() => useIngresosMensuales(undefined))
    expect(result.current.loading).toBe(false)
  })
})
