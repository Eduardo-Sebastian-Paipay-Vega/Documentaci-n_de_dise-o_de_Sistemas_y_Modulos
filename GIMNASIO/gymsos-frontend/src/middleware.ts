import { NextRequest, NextResponse } from "next/server"

// Rutas públicas — no requieren autenticación
const PUBLIC_PATHS = ["/login", "/api/health"]

// Mapa de prefijos de ruta → roles permitidos
// Aplicado ANTES de que React se ejecute en el cliente
const ROLE_ROUTE_MAP: Record<string, string[]> = {
  "/dashboard/gerente":       ["gerente", "admin"],
  "/dashboard/recepcionista": ["recepcionista", "admin"],
  "/dashboard/entrenador":    ["entrenador", "admin"],
  "/dashboard/nutricionista": ["nutricionista", "admin"],
  "/dashboard/miembro":       ["miembro", "admin"],
  "/dashboard/cliente":       ["cliente", "admin"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas: pasar sin verificación
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Rutas de activos estáticos y API de Next.js: omitir
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Leer rol desde cookie (escrita por AuthProvider en login)
  const rolCookie = request.cookies.get("gymsos_rol")?.value

  // Si accede a /dashboard/* sin cookie → login
  if (pathname.startsWith("/dashboard") && !rolCookie) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar que el rol tenga permiso para la ruta solicitada
  if (rolCookie && pathname.startsWith("/dashboard")) {
    const matchedPrefix = Object.keys(ROLE_ROUTE_MAP).find((prefix) =>
      pathname.startsWith(prefix)
    )

    if (matchedPrefix) {
      const allowedRoles = ROLE_ROUTE_MAP[matchedPrefix]
      if (!allowedRoles.includes(rolCookie)) {
        // Redirigir al dashboard propio del rol (evita 403 confuso)
        const ownDashboard = `/dashboard/${rolCookie}`
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = ownDashboard
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // Raíz → login (o dashboard si tiene sesión)
  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = rolCookie ? `/dashboard/${rolCookie}` : "/login"
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Excluir archivos estáticos y API routes de Next.js internos
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
