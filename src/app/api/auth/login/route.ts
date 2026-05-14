import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth/password"
import { createSession } from "@/lib/auth/session"
import { auditLog } from "@/lib/audit"
import { validateCsrfToken } from "@/lib/csrf"
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit"

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
})

export async function POST(request: NextRequest) {
  try {
    const ip = getRateLimitKey(request)
    if (!checkRateLimit(`login:${ip}`)) {
      return NextResponse.json({ error: "طلبات كثيرة جداً. حاول بعد دقيقة." }, { status: 429 })
    }

    const body = await request.json()

    // Origin check — CSRF defense layer
    const origin = request.headers.get("origin")
    const referer = request.headers.get("referer")
    if (origin && !origin.includes("enjaz.one") && !origin.includes("localhost")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }
    if (!origin && referer && !referer.includes("enjaz.one") && !referer.includes("localhost")) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 })
    }

    const csrfHeader = request.headers.get("x-csrf-token")
    const csrfToken = body._csrf || csrfHeader
    const cookieStore = await import("next/headers").then((m) => m.cookies())
    const csrfCookie = cookieStore.get("csrf-token")

    if (csrfCookie && (!csrfToken || !validateCsrfToken(csrfToken, csrfCookie.value))) {
      return NextResponse.json({ error: "طلب غير مصرح به" }, { status: 403 })
    }

    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || "بيانات غير صالحة"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email } = parsed.data
    let { password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: { select: { id: true } } },
    })

    if (!user) {
      await auditLog({
        storeId: null,
        action: "LOGIN_FAILED",
        entity: "user",
        entityId: null,
        details: { email, reason: "user_not_found" },
        userId: null,
      })
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "الحساب غير نشط" }, { status: 403 })
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      await auditLog({
        storeId: user.store?.id || null,
        action: "LOGIN_FAILED",
        entity: "user",
        entityId: user.id,
        details: { email, reason: "wrong_password" },
        userId: user.id,
      })
      return NextResponse.json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" }, { status: 401 })
    }

    const { cookieHeader } = await createSession(user.id, request)

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    await auditLog({
      storeId: user.store?.id || null,
      action: "USER_LOGGED_IN",
      entity: "user",
      entityId: user.id,
      details: { email },
      userId: user.id,
    })

    const response = NextResponse.json({
      success: true,
      redirect: user.store?.id ? "/dashboard" : "/onboarding",
    })
    response.headers.set("Set-Cookie", cookieHeader)
    return response
  } catch (error) {
    console.error("[Login] Error:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
