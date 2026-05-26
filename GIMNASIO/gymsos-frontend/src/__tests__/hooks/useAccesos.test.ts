/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react"

jest.mock("@/lib/supabase", () => ({
  isDemoMode: true,
  supabase:   {},
}))

jest.mock("@/lib/services", () => ({
  getAccesosRecientes:      jest.fn(),
  contarAccesosHoy:         jest.fn(),
  getHistorialAccesoMiembro: jest.fn(),
}))

import {
  useAccesosRecientes,
  useConteoAccesos,
  useHistorialMiembro,
} from "@/hooks/useAccesos"

describe("useAccesosRecientes (demo mode)", () => {
  test("retorna accesos demo sin loading", () => {
    const { result } = renderHook(() => useAccesosRecientes("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  test("los accesos tienen campos requeridos", () => {
    const { result } = renderHook(() => useAccesosRecientes("gym-001"))
    const accesos = result.current.data ?? []
    accesos.forEach(a => {
      expect(a).toHaveProperty("id_acceso")
      expect(a).toHaveProperty("id_usuario")
      expect(a).toHaveProperty("fecha_hora_entrada")
      expect(a).toHaveProperty("estado_acceso")
      expect(a).toHaveProperty("tipo_acceso")
    })
  })

  test("estado_acceso es 'permitido' o 'denegado'", () => {
    const { result } = renderHook(() => useAccesosRecientes("gym-001"))
    const accesos = result.current.data ?? []
    accesos.forEach(a => {
      expect(["permitido", "denegado"]).toContain(a.estado_acceso)
    })
  })

  test("tipo_acceso es uno de los valores válidos", () => {
    const { result } = renderHook(() => useAccesosRecientes("gym-001"))
    const accesos = result.current.data ?? []
    accesos.forEach(a => {
      expect(["qr", "biometria", "manual"]).toContain(a.tipo_acceso)
    })
  })

  test("acepta parámetro limit", () => {
    const { result } = renderHook(() => useAccesosRecientes("gym-001", 10))
    expect(result.current.loading).toBe(false)
  })
})

describe("useConteoAccesos (demo mode)", () => {
  test("retorna conteo con total y actualmente_dentro", () => {
    const { result } = renderHook(() => useConteoAccesos("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toHaveProperty("total")
    expect(result.current.data).toHaveProperty("actualmente_dentro")
  })

  test("total demo es positivo", () => {
    const { result } = renderHook(() => useConteoAccesos("gym-001"))
    expect(result.current.data!.total).toBeGreaterThan(0)
  })

  test("actualmente_dentro no supera total", () => {
    const { result } = renderHook(() => useConteoAccesos("gym-001"))
    const { total, actualmente_dentro } = result.current.data!
    expect(actualmente_dentro).toBeLessThanOrEqual(total)
  })
})

describe("useHistorialMiembro (demo mode)", () => {
  test("retorna array (vacío en demo)", () => {
    const { result } = renderHook(() => useHistorialMiembro("user-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  test("retorna datos aunque userId sea undefined", () => {
    const { result } = renderHook(() => useHistorialMiembro(undefined))
    expect(result.current.loading).toBe(false)
  })
})
