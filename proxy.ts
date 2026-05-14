import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

const SESSION_COOKIE = "enjaz_session"

const publicPaths = ["/", "/login", "/register"]

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
]

const storeRequiredPaths = [
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
]

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + "/") || pathname.startsWith(p + "/["))
  const needsStore = storeRequiredPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))
  const isAuthApi = pathname.startsWith("/api/auth")
  const isOnboarding = pathname === "/onboarding" || pathname.startsWith("/onboarding/")

  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (token) {
    const tokenHash = hashToken(token)
    try {
      const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: { user: { include: { store: { select: { id: true } } } } },
      })

      if (session && session.expiresAt > new Date() && session.user.isActive) {
        const hasStore = !!session.user.store

        if (isPublic && !isAuthApi) {
          const target = hasStore ? "/dashboard" : "/onboarding"
          return NextResponse.redirect(new URL(target, request.url))
        }

        if (needsStore && !hasStore && !isOnboarding) {
          return NextResponse.redirect(new URL("/onboarding", request.url))
        }

        return NextResponse.next()
      }
    } catch {
      // continue to redirect
    }
  }

  if (isPublic || isAuthApi) {
    return NextResponse.next()
  }

  if (isProtected) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.svg).*)"],
}
