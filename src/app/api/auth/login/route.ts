import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth/password"
import { createSession } from "@/lib/auth/session"
import { auditLog } from "@/lib/audit"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { store: { select: { id: true } } },
    })

    if (!user) {
      await auditLog({
        storeId: null,
        action: "LOGIN_FAILED",
        entity: "user",
        entityId: null,
        details: { email: normalizedEmail, reason: "user_not_found" },
        userId: null,
      })
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "الحساب غير نشط" },
        { status: 403 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      await auditLog({
        storeId: user.store?.id || null,
        action: "LOGIN_FAILED",
        entity: "user",
        entityId: user.id,
        details: { email: normalizedEmail, reason: "wrong_password" },
        userId: user.id,
      })
      return NextResponse.json(
        { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
        { status: 401 }
      )
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
      details: { email: normalizedEmail },
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
