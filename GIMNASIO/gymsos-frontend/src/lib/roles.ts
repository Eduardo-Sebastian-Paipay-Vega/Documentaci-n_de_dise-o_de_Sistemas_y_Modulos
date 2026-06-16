// Single source of truth for role definitions.
// No browser APIs — safe to import from middleware (Edge Runtime).

export const ROLES = [
  "miembro",
  "cliente",
  "entrenador",
  "recepcionista",
  "cajero",
  "supervisor",
  "gerente",
  "nutricionista",
  "admin",
] as const

export type Rol = (typeof ROLES)[number]

export const ROL_ROUTES: Record<Rol, string> = {
  gerente:       "/dashboard/gerente",
  supervisor:    "/dashboard/supervisor",
  cajero:        "/dashboard/cajero",
  miembro:       "/dashboard/miembro",
  cliente:       "/dashboard/miembro",
  entrenador:    "/dashboard/entrenador",
  recepcionista: "/dashboard/recepcionista",
  nutricionista: "/dashboard/nutricionista",
  admin:         "/dashboard/gerente",
}

// Maps each route prefix to the roles allowed to access it.
// Used by middleware for server-side route protection.
export const ROUTE_ALLOWED_ROLES: Record<string, Rol[]> = {
  "/dashboard/gerente":       ["gerente", "admin"],
  "/dashboard/supervisor":    ["supervisor", "admin"],
  "/dashboard/cajero":        ["cajero", "admin"],
  "/dashboard/recepcionista": ["recepcionista", "supervisor", "admin"],
  "/dashboard/entrenador":    ["entrenador", "admin"],
  "/dashboard/nutricionista": ["nutricionista", "admin"],
  "/dashboard/miembro":       ["miembro", "cliente", "admin"],
}

export function isValidRol(value: unknown): value is Rol {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value)
}
