// `supabase` (compat) ahora apunta al esquema gym vía el cliente unificado.
// Los servicios que hacen `.from("<tabla gym>")` siguen funcionando sin cambios.
import { gymDb as supabase } from "@/lib/supabase.unified"

export { supabase }

export class ServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: string,
  ) {
    super(message)
    this.name = "ServiceError"
  }
}

export function handleSupabaseError(error: { message: string; code?: string; details?: string }): never {
  throw new ServiceError(error.message, error.code, error.details)
}

export type PaginatedResult<T> = {
  data: T[]
  count: number
}

export type QueryOptions = {
  limit?: number
  offset?: number
  gymId?: string
}
