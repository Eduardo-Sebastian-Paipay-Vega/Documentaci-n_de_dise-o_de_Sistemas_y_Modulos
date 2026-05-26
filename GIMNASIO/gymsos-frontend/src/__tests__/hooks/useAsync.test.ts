/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from "@testing-library/react"

// Mock isDemoMode antes de importar el hook
jest.mock("@/lib/supabase", () => ({
  isDemoMode: false,
  supabase:   {},
}))

import { useAsync, useAsyncWithDemoFallback } from "@/hooks/useAsync"

describe("useAsync", () => {
  test("empieza en estado loading", () => {
    const { result } = renderHook(() =>
      useAsync(() => new Promise(() => {}), [])
    )
    expect(result.current.loading).toBe(true)
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  test("resuelve los datos correctamente", async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.resolve({ valor: 42 }), [])
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ valor: 42 })
    expect(result.current.error).toBeNull()
  })

  test("captura errores correctamente", async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject(new Error("Error de prueba")), [])
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe("Error de prueba")
  })

  test("captura errores no-Error como string genérico", async () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.reject("algo salió mal"), [])
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe("Error desconocido")
  })

  test("null asyncFn resulta en loading=false sin datos", async () => {
    const { result } = renderHook(() => useAsync(null, []))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeNull()
    expect(result.current.error).toBeNull()
  })

  test("refetch vuelve a ejecutar la función", async () => {
    let callCount = 0
    const { result } = renderHook(() =>
      useAsync(() => {
        callCount++
        return Promise.resolve(callCount)
      }, [])
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(1)

    act(() => { result.current.refetch() })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(callCount).toBe(2)
    expect(result.current.data).toBe(2)
  })

  test("expone función refetch", () => {
    const { result } = renderHook(() =>
      useAsync(() => Promise.resolve([]), [])
    )
    expect(typeof result.current.refetch).toBe("function")
  })
})

describe("useAsyncWithDemoFallback", () => {
  test("retorna demoData inmediatamente cuando isDemoMode=true", async () => {
    // Remock como demo mode
    jest.resetModules()
    jest.doMock("@/lib/supabase", () => ({
      isDemoMode: true,
      supabase:   {},
    }))

    const { useAsyncWithDemoFallback: useFallback } = await import("@/hooks/useAsync")

    const DEMO = [1, 2, 3]
    const { result } = renderHook(() =>
      useFallback(() => Promise.resolve([4, 5, 6]), DEMO, [])
    )

    expect(result.current.data).toEqual(DEMO)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test("en modo real llama a la función async", async () => {
    jest.resetModules()
    jest.doMock("@/lib/supabase", () => ({
      isDemoMode: false,
      supabase:   {},
    }))

    const { useAsyncWithDemoFallback: useFallback } = await import("@/hooks/useAsync")

    const REAL_DATA = { name: "real" }
    const DEMO_DATA = { name: "demo" }

    const { result } = renderHook(() =>
      useFallback(() => Promise.resolve(REAL_DATA), DEMO_DATA, [])
    )

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual(REAL_DATA)
  })
})
