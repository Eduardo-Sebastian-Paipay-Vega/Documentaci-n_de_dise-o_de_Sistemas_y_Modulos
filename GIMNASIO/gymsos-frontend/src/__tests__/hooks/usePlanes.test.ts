/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react"

jest.mock("@/lib/supabase", () => ({
  isDemoMode: true,
  supabase:   {},
}))

jest.mock("@/lib/services", () => ({
  getPlanesPorGimnasio: jest.fn(),
}))

import { usePlanes } from "@/hooks/usePlanes"

describe("usePlanes (demo mode)", () => {
  test("retorna planes demo sin loading", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  test("cada plan tiene los campos requeridos", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    const planes = result.current.data ?? []
    planes.forEach(p => {
      expect(p).toHaveProperty("id_plan")
      expect(p).toHaveProperty("nombre")
      expect(p).toHaveProperty("precio_mensual")
      expect(p).toHaveProperty("duracion_dias")
      expect(p).toHaveProperty("activo")
    })
  })

  test("todos los planes demo están activos", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    const planes = result.current.data ?? []
    planes.forEach(p => {
      expect(p.activo).toBe(true)
    })
  })

  test("precio_mensual siempre es positivo", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    const planes = result.current.data ?? []
    planes.forEach(p => {
      expect(p.precio_mensual).toBeGreaterThan(0)
    })
  })

  test("duracion_dias es al menos 1", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    const planes = result.current.data ?? []
    planes.forEach(p => {
      expect(p.duracion_dias).toBeGreaterThanOrEqual(1)
    })
  })

  test("tiene plan Basic, Silver y Gold Premium", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    const nombres = (result.current.data ?? []).map(p => p.nombre)
    expect(nombres).toContain("Basic")
    expect(nombres).toContain("Silver")
    expect(nombres).toContain("Gold Premium")
  })

  test("los precios están en orden ascendente", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    const precios = (result.current.data ?? []).map(p => p.precio_mensual)
    for (let i = 1; i < precios.length; i++) {
      expect(precios[i]).toBeGreaterThanOrEqual(precios[i - 1])
    }
  })

  test("retorna datos cuando gymId es undefined", () => {
    const { result } = renderHook(() => usePlanes(undefined))
    expect(result.current.loading).toBe(false)
  })

  test("no tiene error en estado inicial", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    expect(result.current.error).toBeNull()
  })

  test("expone función refetch", () => {
    const { result } = renderHook(() => usePlanes("gym-001"))
    expect(typeof result.current.refetch).toBe("function")
  })
})
