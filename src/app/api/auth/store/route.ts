import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { requireUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser()
    if (!user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    if (user.storeId) {
      return NextResponse.json({ error: "لديك متجر بالفعل" }, { status: 400 })
    }

    const body = await request.json()
    const { storeName, activity, phone, currency, address, ownerPin } = body

    if (!storeName) {
      return NextResponse.json({ error: "اسم المتجر مطلوب" }, { status: 400 })
    }

    const hashedPin = ownerPin ? await bcrypt.hash(ownerPin, 12) : null

    const store = await prisma.store.create({
      data: {
        name: storeName,
        activity: activity || null,
        phone: phone || null,
        currency: currency || "SAR",
        address: address || null,
        ownerPin: hashedPin,
        ownerId: user.id,
      },
    })

    await prisma.storeSettings.create({
      data: {
        storeId: store.id,
        defaultPayment: "cash",
        lowStockAlert: true,
        lowStockThreshold: 5,
      },
    })

    await prisma.category.createMany({
      data: [
        { storeId: store.id, name: "عام", color: "#6366f1" },
        { storeId: store.id, name: "مأكولات", color: "#f59e0b" },
        { storeId: store.id, name: "مشروبات", color: "#3b82f6" },
        { storeId: store.id, name: "الكترونيات", color: "#10b981" },
      ],
    })

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error("[Store Create] Error:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
