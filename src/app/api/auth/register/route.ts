import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth/password"
import { createSession } from "@/lib/auth/session"
import { auditLog } from "@/lib/audit"
import { validateCsrfToken } from "@/lib/csrf"

const registerSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").transform((e) => e.toLowerCase()),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
    .regex(/[a-zA-Z]/, "كلمة المرور يجب أن تحتوي على حروف")
    .regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على أرقام"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const csrfHeader = request.headers.get("x-csrf-token")
    const csrfToken = body._csrf || csrfHeader

    const cookieStore = await import("next/headers").then((m) => m.cookies())
    const csrfCookie = cookieStore.get("csrf-token")

    if (csrfToken && csrfCookie && !validateCsrfToken(csrfToken, csrfCookie.value)) {
      return NextResponse.json({ error: "طلب غير مصرح به" }, { status: 403 })
    }

    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues?.[0]?.message || parsed.error.message || "بيانات غير صالحة"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "البريد الإلكتروني مسجل بالفعل" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "owner",
      },
    })

    const { cookieHeader } = await createSession(user.id, request)

    await auditLog({
      storeId: null,
      action: "USER_REGISTERED",
      entity: "user",
      entityId: user.id,
      details: { email },
      userId: user.id,
    })

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    })
    response.headers.set("Set-Cookie", cookieHeader)
    return response
  } catch (error) {
    console.error("[Register] Error:", error)
    return NextResponse.json({ error: "حدث خطأ في التسجيل" }, { status: 500 })
  }
}
