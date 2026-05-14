import { cookies } from "next/headers"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"

const SESSION_COOKIE = "enjaz_session"
const SESSION_DURATION_DAYS = 30

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  storeId?: string | null
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

function getCookieOptions(expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production"
  return `enjaz_session=TOKEN_PLACEHOLDER; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Strict; Path=/; Expires=${expiresAt.toUTCString()}`
}

export function buildCookieHeader(token: string, expiresAt: Date): string {
  const secure = process.env.NODE_ENV === "production"
  return `enjaz_session=${token}; HttpOnly; ${secure ? "Secure; " : ""}SameSite=Strict; Path=/; Expires=${expiresAt.toUTCString()}`
}

export async function createSession(
  userId: string,
  request?: Request
): Promise<{ token: string; cookieHeader: string }> {
  const token = crypto.randomBytes(48).toString("hex")
  const tokenHash = hashToken(token)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  let userAgent: string | undefined
  let ipAddress: string | undefined

  if (request) {
    userAgent = request.headers.get("user-agent") || undefined
    ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      undefined
  }

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      userAgent,
      ipAddress,
      expiresAt,
    },
  })

  const cookieHeader = buildCookieHeader(token, expiresAt)

  // Also try setting via cookies() for server-side reads
  try {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: expiresAt,
    })
  } catch {
    // cookies() may not be available in all contexts
  }

  return { token, cookieHeader }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const tokenHash = hashToken(token)

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { store: { select: { id: true } } },
        },
      },
    })

    if (!session) return null
    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: session.id } })
      return null
    }
    if (!session.user.isActive) return null

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      isActive: session.user.isActive,
      storeId: session.user.store?.id,
    }
  } catch {
    return null
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("Unauthorized")
  return user
}

export async function requireStoreUser(): Promise<AuthUser & { storeId: string }> {
  const user = await requireUser()
  if (!user.storeId) {
    const err = new Error("ONBOARDING_REQUIRED") as Error & { code: string }
    err.code = "ONBOARDING_REQUIRED"
    throw err
  }
  return user as AuthUser & { storeId: string }
}

export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (token) {
      const tokenHash = hashToken(token)
      await prisma.session.deleteMany({ where: { tokenHash } })
    }
    cookieStore.delete(SESSION_COOKIE)
  } catch {
    // ignore
  }
}
