import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { pin } = await request.json()
    if (!pin) {
      return NextResponse.json({ error: "كلمة المرور مطلوبة" }, { status: 400 })
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: session.id },
    })

    if (!store?.ownerPin) {
      return NextResponse.json({ error: "لم يتم تعيين كلمة مرور الإدارة" }, { status: 400 })
    }

    const isValid = await verifyPassword(pin, store.ownerPin)
    if (!isValid) {
      return NextResponse.json({ verified: false }, { status: 401 })
    }

    return NextResponse.json({ verified: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
