import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const SESSION_COOKIE = "enjaz_session"

const publicPaths = ["/", "/login", "/register", "/faq", "/contact", "/terms", "/privacy"]

const protectedPaths = [
  "/onboarding",
  "/dashboard",
  "/pos",
  "/products",
  "/sales",
  "/customers",
  "/suppliers",
  "/employees",
  "/expenses",
  "/reports",
  "/settings",
  "/admin",
  "/ai-agent",
  "/devices",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const isApi = pathname.startsWith("/api")
  const isStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo.png") ||
    pathname.startsWith("/brand/") ||
    pathname.startsWith("/screenshots/")

  if (isApi || isStatic) return NextResponse.next()

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (token) {
    if (isPublic) {
      // Logged-in user visiting login/register → redirect to dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Has a session cookie → let through (route handler validates session)
    return NextResponse.next()
  }

  if (isPublic) return NextResponse.next()

  if (isProtected) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|brand|screenshots|.*\\.png|.*\\.svg|.*\\.ico).*)",
  ],
}
