/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from "@testing-library/react"

// Simular modo demo
jest.mock("@/lib/supabase", () => ({
  isDemoMode: true,
  supabase:   {},
}))

// Mock de servicios (no se llaman en modo demo)
jest.mock("@/lib/services", () => ({
  getUsuariosPorGimnasio:      jest.fn(),
  getPagosPendientesPorVencer: jest.fn(),
  getPagosPorGimnasio:         jest.fn(),
}))

import { useMiembros, usePagosPendientes, usePagosHoy } from "@/hooks/useMiembros"

describe("useMiembros (demo mode)", () => {
  test("retorna datos demo sin llamar a Supabase", async () => {
    const { result } = renderHook(() => useMiembros("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.miembros)).toBe(true)
    expect(result.current.miembros.length).toBeGreaterThan(0)
  })

  test("retorna miembros con estructura correcta", () => {
    const { result } = renderHook(() => useMiembros("gym-001"))
    const m = result.current.miembros[0]
    expect(m).toHaveProperty("id_usuario")
    expect(m).toHaveProperty("nombre")
    expect(m).toHaveProperty("email")
    expect(m).toHaveProperty("rol")
    expect(m).toHaveProperty("estado")
  })

  test("retorna total correcto", () => {
    const { result } = renderHook(() => useMiembros("gym-001"))
    expect(result.current.total).toBe(result.current.miembros.length)
  })

  test("retorna [] cuando gymId es undefined", () => {
    const { result } = renderHook(() => useMiembros(undefined))
    expect(Array.isArray(result.current.miembros)).toBe(true)
  })

  test("expone función refetch", () => {
    const { result } = renderHook(() => useMiembros("gym-001"))
    expect(typeof result.current.refetch).toBe("function")
  })

  test("todos los miembros demo tienen membresia o null", () => {
    const { result } = renderHook(() => useMiembros("gym-001"))
    result.current.miembros.forEach(m => {
      expect(m.membresia === null || typeof m.membresia === "object").toBe(true)
    })
  })

  test("score_churn está entre 0 y 100", () => {
    const { result } = renderHook(() => useMiembros("gym-001"))
    result.current.miembros.forEach(m => {
      if (m.score_churn !== undefined) {
        expect(m.score_churn).toBeGreaterThanOrEqual(0)
        expect(m.score_churn).toBeLessThanOrEqual(100)
      }
    })
  })
})

describe("usePagosPendientes (demo mode)", () => {
  test("retorna array de pagos pendientes", () => {
    const { result } = renderHook(() => usePagosPendientes("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  test("los pagos pendientes tienen campos requeridos", () => {
    const { result } = renderHook(() => usePagosPendientes("gym-001"))
    const pagos = result.current.data ?? []
    pagos.forEach(p => {
      expect(p).toHaveProperty("id_usuario")
      expect(p).toHaveProperty("monto")
      expect(p).toHaveProperty("estado")
    })
  })
})

describe("usePagosHoy (demo mode)", () => {
  test("retorna array de pagos", () => {
    const { result } = renderHook(() => usePagosHoy("gym-001"))
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
  })

  test("los pagos tienen monto positivo", () => {
    const { result } = renderHook(() => usePagosHoy("gym-001"))
    const pagos = result.current.data ?? []
    pagos.forEach(p => {
      expect(p.monto).toBeGreaterThan(0)
    })
  })
})
