import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const type = searchParams.get("type") || "dashboard"

    const storeId = session.storeId
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterdayStart = new Date(todayStart.getTime() - 86400000)

    if (type === "dashboard") {
      const [todaySales, yesterdaySales, totalProducts, lowStockCount, topProducts, recentSales] =
        await Promise.all([
          prisma.sale.aggregate({
            where: { storeId, createdAt: { gte: todayStart }, status: "completed" },
            _sum: { total: true },
            _count: true,
          }),
          prisma.sale.aggregate({
            where: { storeId, createdAt: { gte: yesterdayStart, lt: todayStart }, status: "completed" },
            _sum: { total: true },
          }),
          prisma.product.count({ where: { storeId, isActive: true } }),
          prisma.product.count({
            where: { storeId, isActive: true, quantity: { lte: prisma.product.fields.lowStockThreshold } },
          }),
          prisma.saleItem.groupBy({
            by: ["productId"],
            _sum: { total: true, quantity: true },
            orderBy: { _sum: { total: "desc" } },
            take: 10,
            where: { sale: { storeId, status: "completed" } },
          }),
          prisma.sale.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: { employee: { select: { name: true } } },
          }),
        ])

      const productIds = topProducts.map((p) => p.productId)
      const products = productIds.length
        ? await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, name: true },
          })
        : []
      const productMap = new Map(products.map((p) => [p.id, p.name]))

      return NextResponse.json({
        todaySales: todaySales._sum.total || 0,
        todayTransactions: todaySales._count,
        totalProducts,
        lowStockCount,
        salesChange: yesterdaySales._sum.total
          ? (((todaySales._sum.total || 0) - (yesterdaySales._sum.total || 0)) / yesterdaySales._sum.total) * 100
          : 0,
        topProducts: topProducts.map((p) => ({
          name: productMap.get(p.productId) || "Unknown",
          total: p._sum.total || 0,
          quantity: p._sum.quantity || 0,
        })),
        recentSales: recentSales.map((s) => ({
          id: s.id,
          invoiceNumber: s.invoiceNumber,
          total: s.total,
          createdAt: s.createdAt.toISOString(),
          employee: s.employee,
        })),
      })
    }

    if (type === "sales_summary") {
      const period = searchParams.get("period") || "today"
      let startDate: Date
      switch (period) {
        case "today":
          startDate = todayStart
          break
        case "week":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
          break
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = todayStart
      }

      const sales = await prisma.sale.findMany({
        where: { storeId, createdAt: { gte: startDate }, status: "completed" },
        include: { payments: true, items: true },
      })

      const totalSales = sales.reduce((sum, s) => sum + s.total, 0)
      const totalProfit = sales.reduce((sum, s) => sum + s.profit, 0)
      const paymentMethods: Record<string, number> = {}
      sales.forEach((s) => {
        s.payments.forEach((p) => {
          paymentMethods[p.method] = (paymentMethods[p.method] || 0) + p.amount
        })
      })

      return NextResponse.json({
        totalSales,
        totalProfit,
        transactionCount: sales.length,
        averageOrder: sales.length ? totalSales / sales.length : 0,
        paymentMethods,
      })
    }

    if (type === "products") {
      const products = await prisma.product.findMany({
        where: { storeId, isActive: true },
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      })

      const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
      const totalCost = products.reduce((sum, p) => sum + p.costPrice * p.quantity, 0)
      const lowStock = products.filter((p) => p.quantity <= p.lowStockThreshold)
      const outOfStock = products.filter((p) => p.quantity === 0)

      return NextResponse.json({
        totalProducts: products.length,
        totalValue,
        totalCost,
        potentialProfit: totalValue - totalCost,
        lowStockCount: lowStock.length,
        outOfStockCount: outOfStock.length,
        lowStockProducts: lowStock,
        outOfStockProducts: outOfStock,
      })
    }

    return NextResponse.json({ error: "نوع التقرير غير معروف" }, { status: 400 })
  } catch (error) {
    console.error("Reports error:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
