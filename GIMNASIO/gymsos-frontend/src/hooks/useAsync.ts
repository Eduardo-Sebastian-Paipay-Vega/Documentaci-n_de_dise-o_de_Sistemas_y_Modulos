"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export type AsyncState<T> = {
  data:    T | null
  loading: boolean
  error:   string | null
  refetch: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// useAsync — hook base para peticiones asíncronas sin bucles infinitos
//
// Patrón clave: asyncFnRef
//   El asyncFn que llega al hook cambia de referencia en CADA render (arrow fn
//   inline). Si lo ponemos en los deps del useCallback → execute cambia → el
//   useEffect dispara de nuevo → bucle infinito.
//   La solución: guardamos asyncFn en un ref que se actualiza sincrónicamente
//   sin re-render. execute solo se recrea cuando cambian deps estables (gymId,
//   userId, etc.), no cuando cambia la referencia de la función.
//
// executionId — anti-race condition:
//   Si el usuario navega rápido o deps cambian mientras hay una petición en
//   vuelo, el resultado de la petición antigua NO pisará el estado actual.
// ─────────────────────────────────────────────────────────────────────────────
export function useAsync<T>(
  asyncFn: (() => Promise<T>) | null,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(asyncFn !== null)
  const [error,   setError]   = useState<string | null>(null)

  // Siempre apunta a la versión más reciente de asyncFn, sin causar re-renders
  const asyncFnRef    = useRef(asyncFn)
  asyncFnRef.current  = asyncFn

  // Contador de ejecuciones para ignorar respuestas de peticiones antiguas
  const executionRef  = useRef(0)

  const execute = useCallback(async () => {
    if (!asyncFnRef.current) {
      setLoading(false)
      return
    }

    const id = ++executionRef.current
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFnRef.current()
      if (id === executionRef.current) {
        setData(result)
        setLoading(false)
      }
    } catch (e) {
      if (id === executionRef.current) {
        setError(e instanceof Error ? e.message : "Error desconocido")
        setLoading(false)
      }
    }
  // Solo se recrea cuando cambian los deps estables (gymId, userId, etc.)
  // NO incluimos asyncFn porque cambia referencia en cada render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    execute()
  }, [execute])

  return { data, loading, error, refetch: execute }
}

// ─────────────────────────────────────────────────────────────────────────────
// useAsyncWithDemoFallback — wrapper mantenido por compatibilidad con hooks
// existentes. El segundo argumento (_fallbackData) ya no se usa para mock mode
// — Supabase es siempre la fuente real.
// ─────────────────────────────────────────────────────────────────────────────
export function useAsyncWithDemoFallback<T>(
  asyncFn:       (() => Promise<T>) | null,
  _fallbackData: T,
  deps:          unknown[] = [],
): AsyncState<T> {
  return useAsync<T>(asyncFn, deps)
}

// ─────────────────────────────────────────────────────────────────────────────
// useMutation — patrón limpio para peticiones POST/PATCH/DELETE
//
// Uso:
//   const { mutate, loading, error } = useMutation(registrarPago)
//   await mutate({ id_usuario, monto, metodo_pago })
//
// Ventajas vs useEffect manual:
//   - Sin bucles — no corre automáticamente, solo cuando llamas a mutate()
//   - Tipado completo (TInput → TResult)
//   - Estado de carga/error aislado de los hooks de lectura
// ─────────────────────────────────────────────────────────────────────────────
export type MutationState<TResult> = {
  data:    TResult | null
  loading: boolean
  error:   string | null
  reset:   () => void
}

export function useMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
): MutationState<TResult> & { mutate: (input: TInput) => Promise<TResult | null> } {
  const [data,    setData]    = useState<TResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const mutationFnRef    = useRef(mutationFn)
  mutationFnRef.current  = mutationFn

  const mutate = useCallback(async (input: TInput): Promise<TResult | null> => {
    setLoading(true)
    setError(null)
    try {
      const result = await mutationFnRef.current(input)
      setData(result)
      setLoading(false)
      return result
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido"
      setError(msg)
      setLoading(false)
      return null
    }
  }, [])  // Sin deps — mutate nunca cambia referencia

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, mutate, reset }
}
