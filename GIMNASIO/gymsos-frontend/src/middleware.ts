import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas permitidas por rol — la BD es la fuente de verdad,
// pero el middleware refuerza en el edge para UX rápido.
const ROL_ROUTES: Record<string, string> = {
  gerente:       "/dashboard/gerente",
  miembro:       "/dashboard/miembro",
  entrenador:    "/dashboard/entrenador",
  recepcionista: "/dashboard/recepcionista",
}

// Prefijos de ruta exclusivos por rol
const ROL_PREFIXES: Record<string, string[]> = {
  gerente:       ["/dashboard/gerente"],
  miembro:       ["/dashboard/miembro"],
  entrenador:    ["/dashboard/entrenador"],
  recepcionista: ["/dashboard/recepcionista"],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir rutas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Leer sesión de cookie (el auth-provider la guarda en sessionStorage → no
  // accessible en middleware. Usamos un cookie que el provider setea al login)
  const sessionCookie = request.cookies.get("gymsos_rol")
  const rol = sessionCookie?.value as keyof typeof ROL_ROUTES | undefined

  // Si no hay sesión y accede a dashboard → redirigir a login
  if (!rol && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Si tiene sesión, verificar que el rol coincide con la ruta
  if (rol && pathname.startsWith("/dashboard")) {
    const prefijos = ROL_PREFIXES[rol]
    if (prefijos && !prefijos.some((p) => pathname.startsWith(p))) {
      // Redirigir a su dashboard correcto (no puede acceder a ruta de otro rol)
      const url = request.nextUrl.clone()
      url.pathname = ROL_ROUTES[rol]
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
