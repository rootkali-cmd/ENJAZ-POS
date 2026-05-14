import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/currency"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const storeId = session.storeId
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { currency: true },
    })
    const currency = store?.currency || "SAR"

    const [
      lowStockCount,
      outOfStockCount,
      todaySalesCount,
      todaySalesTotal,
      recentReturns,
      pendingSalaries,
    ] = await Promise.all([
      prisma.product.count({
        where: { storeId, isActive: true, quantity: { gt: 0, lte: prisma.product.fields.lowStockThreshold } },
      }),
      prisma.product.count({
        where: { storeId, isActive: true, quantity: 0 },
      }),
      prisma.sale.count({
        where: { storeId, createdAt: { gte: today } },
      }),
      prisma.sale.aggregate({
        where: { storeId, createdAt: { gte: today }, status: "completed" },
        _sum: { total: true },
      }),
      prisma.return.count({
        where: { sale: { storeId }, createdAt: { gte: today } },
      }),
      prisma.salary.count({
        where: { storeId, status: "pending" },
      }),
    ])

    const notifications: {
      id: string
      type: "warning" | "danger" | "info" | "success"
      title: string
      message: string
      time: string
    }[] = []

    if (lowStockCount > 0) {
      notifications.push({
        id: "low-stock",
        type: "warning",
        title: "منتجات منخفضة المخزون",
        message: `${lowStockCount} منتج على وشك النفاد`,
        time: "الآن",
      })
    }

    if (outOfStockCount > 0) {
      notifications.push({
        id: "out-of-stock",
        type: "danger",
        title: "منتجات نفدت",
        message: `${outOfStockCount} منتج نفد من المخزون`,
        time: "الآن",
      })
    }

    if (todaySalesCount > 0) {
      notifications.push({
        id: "today-sales",
        type: "success",
        title: "مبيعات اليوم",
        message: `${todaySalesCount} فاتورة بقيمة ${formatCurrency(todaySalesTotal._sum.total || 0, currency)}`,
        time: "اليوم",
      })
    }

    if (recentReturns > 0) {
      notifications.push({
        id: "returns",
        type: "info",
        title: "مرتجعات اليوم",
        message: `${recentReturns} عملية إرجاع اليوم`,
        time: "اليوم",
      })
    }

    if (pendingSalaries > 0) {
      notifications.push({
        id: "salaries",
        type: "warning",
        title: "رواتب غير مدفوعة",
        message: `${pendingSalaries} راتب في انتظار الدفع`,
        time: "معلق",
      })
    }

    if (notifications.length === 0) {
      notifications.push({
        id: "all-good",
        type: "success",
        title: "كل شيء على ما يرام",
        message: "لا توجد إشعارات جديدة",
        time: "الآن",
      })
    }

    return NextResponse.json({
      notifications,
      total: notifications.length,
      hasAlerts: lowStockCount > 0 || outOfStockCount > 0,
    })
  } catch {
    return NextResponse.json({ notifications: [], total: 0, hasAlerts: false })
  }
}
