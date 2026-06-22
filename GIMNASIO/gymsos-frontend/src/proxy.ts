import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas o internas — siempre pasar
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  // Sesión y autorización por rol delegadas al cliente (dashboard/layout.tsx + useAuth).
  // TODO: usar @supabase/ssr con cookies HttpOnly para protección server-side real (producción).
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
