import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const store = await prisma.store.findUnique({
      where: { ownerId: session.id },
      include: {
        _count: { select: { products: true, sales: true, customers: true, employees: true, expenses: true } },
        settings: true,
      },
    })

    const aiUsage = await prisma.aiUsage.findUnique({
      where: { storeId: store?.id },
    })

    const feedback = await prisma.betaFeedback.findMany({
      where: { storeId: store?.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({
      store,
      aiUsage,
      feedback,
      stats: {
        totalProducts: store?._count.products || 0,
        totalSales: store?._count.sales || 0,
        totalCustomers: store?._count.customers || 0,
        totalEmployees: store?._count.employees || 0,
        totalExpenses: store?._count.expenses || 0,
      },
    })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== "owner") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const body = await request.json()
    const { isActive, aiEnabled, aiDailyLimit, isBeta } = body

    const store = await prisma.store.findUnique({ where: { ownerId: session.id } })
    if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 })

    await prisma.store.update({
      where: { id: store.id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(aiEnabled !== undefined && { aiEnabled }),
        ...(aiDailyLimit !== undefined && { aiDailyLimit: parseInt(aiDailyLimit) }),
        ...(isBeta !== undefined && { isBeta }),
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
