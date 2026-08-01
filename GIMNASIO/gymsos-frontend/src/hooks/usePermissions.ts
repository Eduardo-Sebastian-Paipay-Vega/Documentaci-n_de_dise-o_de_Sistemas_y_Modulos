"use client"

import { useState, useEffect } from "react"
import { publicDb } from "@/lib/supabase.unified"

export interface Permission {
  permission: string
  role_name:  string
}

// Verifica si el usuario autenticado tiene un permiso específico.
// Retorna: null (cargando) | true (tiene permiso) | false (no tiene permiso)
export function usePermission(permission: string): boolean | null {
  const [allowed, setAllowed] = useState<boolean | null>(null)

  useEffect(() => {
    publicDb
      .rpc("fn_check_permission", { p_permission: permission })
      .then(({ data }) => setAllowed(data ?? false))
  }, [permission])

  return allowed
}

// Devuelve todos los permisos del usuario autenticado en su tenant actual.
export function useMyPermissions(): Permission[] {
  const [permisos, setPermisos] = useState<Permission[]>([])

  useEffect(() => {
    publicDb
      .rpc("fn_my_permissions")
      .then(({ data }) => setPermisos(data ?? []))
  }, [])

  return permisos
}
