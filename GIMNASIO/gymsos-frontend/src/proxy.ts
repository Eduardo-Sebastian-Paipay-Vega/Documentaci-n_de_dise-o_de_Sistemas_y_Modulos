import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ROUTE_ALLOWED_ROLES, ROL_ROUTES, isValidRol } from "@/lib/roles"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas o internas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  const rolCookie = request.cookies.get("gymsos_rol")?.value

  // Sin sesión → login
  if (!rolCookie && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Con sesión → verificar que el rol tiene acceso a la ruta
  if (rolCookie && pathname.startsWith("/dashboard")) {
    const matchedPrefix = Object.keys(ROUTE_ALLOWED_ROLES).find((prefix) =>
      pathname.startsWith(prefix),
    )

    if (matchedPrefix) {
      const allowed = ROUTE_ALLOWED_ROLES[matchedPrefix]
      if (!allowed.includes(rolCookie as never)) {
        const url = request.nextUrl.clone()
        url.pathname = isValidRol(rolCookie) ? ROL_ROUTES[rolCookie] : "/login"
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
