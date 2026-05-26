"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { isDemoMode } from "@/lib/supabase"

export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAsync<T>(
  asyncFn: (() => Promise<T>) | null,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const mountedRef            = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const execute = useCallback(async () => {
    if (!asyncFn) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await asyncFn()
      if (mountedRef.current) {
        setData(result)
      }
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Error desconocido")
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { execute() }, [execute])

  return { data, loading, error, refetch: execute }
}

export function useAsyncWithDemoFallback<T>(
  asyncFn: (() => Promise<T>) | null,
  demoData: T,
  deps: unknown[] = [],
): AsyncState<T> {
  const result = useAsync<T>(isDemoMode ? null : asyncFn, deps)

  if (isDemoMode) {
    return {
      data:    demoData,
      loading: false,
      error:   null,
      refetch: () => {},
    }
  }

  return result
}
