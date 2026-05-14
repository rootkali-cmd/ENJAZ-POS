import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      include: { settings: true },
    })

    return NextResponse.json({ store })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const body = await request.json()
    const { name, phone, address, currency, taxRate, taxEnabled, activity, settings } = body

    await prisma.store.update({
      where: { id: session.storeId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(currency !== undefined && { currency }),
        ...(taxRate !== undefined && { taxRate: parseFloat(taxRate) }),
        ...(taxEnabled !== undefined && { taxEnabled }),
        ...(activity !== undefined && { activity }),
      },
    })

    if (settings) {
      await prisma.storeSettings.upsert({
        where: { storeId: session.storeId },
        update: {
          receiptFooter: settings.receiptFooter,
          returnPolicy: settings.returnPolicy,
          defaultPayment: settings.defaultPayment,
          lowStockAlert: settings.lowStockAlert,
          lowStockThreshold: parseInt(settings.lowStockThreshold || "5"),
        },
        create: {
          storeId: session.storeId,
          receiptFooter: settings.receiptFooter,
          returnPolicy: settings.returnPolicy,
          defaultPayment: settings.defaultPayment || "cash",
          lowStockAlert: settings.lowStockAlert ?? true,
          lowStockThreshold: parseInt(settings.lowStockThreshold || "5"),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    await prisma.store.delete({ where: { id: session.storeId } })

    await prisma.session.deleteMany({ where: { userId: session.id } })

    await prisma.user.delete({ where: { id: session.id } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ في حذف الحساب" }, { status: 500 })
  }
}
