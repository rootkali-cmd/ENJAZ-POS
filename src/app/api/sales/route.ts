import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateInvoiceNumber } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = { storeId: session.storeId }
    if (status) where.status = status
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { customer: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true } },
          employee: { select: { id: true, name: true } },
          payments: true,
          items: {
            include: { product: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where }),
    ])

    return NextResponse.json({ sales, total, page, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const body = await request.json()
    const { items, payments, discount, discountType, customerId, employeeId, notes } = body

    if (!items?.length) {
      return NextResponse.json({ error: "الفاتورة فارغة" }, { status: 400 })
    }

    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId: session.storeId },
    })
    const productMap = new Map(products.map((p: { id: string; name: string; price: number; costPrice: number; quantity: number }) => [p.id, p]))

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: `المنتج ${item.productId} غير موجود` }, { status: 400 })
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json({ error: `الكمية غير متوفرة لـ ${product.name}` }, { status: 400 })
      }
    }

    const invoiceNumber = generateInvoiceNumber()
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
    const discountAmount = discountType === "percentage"
      ? subtotal * ((discount || 0) / 100)
      : (discount || 0)
    const tax = 0
    const total = subtotal - discountAmount + tax

    const profit = items.reduce((sum: number, item: { productId: string; price: number; quantity: number }) => {
      const product = productMap.get(item.productId)
      return sum + (item.price - (product?.costPrice || 0)) * item.quantity
    }, 0)

    const sale = await prisma.sale.create({
      data: {
        storeId: session.storeId,
        invoiceNumber,
        subtotal,
        discount: discountAmount,
        discountType: discountType || "fixed",
        tax,
        total,
        profit,
        paymentMethod: payments?.[0]?.method || "cash",
        paymentMethods: payments ? JSON.stringify(payments) : null,
        status: "completed",
        notes,
        customerId: customerId || null,
        employeeId: employeeId || null,
        items: {
          create: items.map((item: { productId: string; quantity: number; price: number; discount?: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            costPrice: productMap.get(item.productId)?.costPrice || 0,
            discount: item.discount || 0,
            total: item.price * item.quantity - (item.discount || 0),
          })),
        },
        payments: payments?.length
          ? {
              create: payments.map((p: any) => ({
                method: p.method,
                amount: p.amount,
                reference: p.reference || null,
              })),
            }
          : undefined,
      },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        payments: true,
        customer: true,
      },
    })

    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      })

      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          type: "sale",
          quantity: -item.quantity,
          reference: invoiceNumber,
          notes: `بيع فاتورة ${invoiceNumber}`,
        },
      })
    }

    if (customerId) {
      const customerSales = await prisma.sale.aggregate({
        where: { customerId, status: "completed" },
        _sum: { total: true },
      })
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          totalPurchases: customerSales._sum.total || 0,
          lastPurchaseAt: new Date(),
        },
      })
    }

    return NextResponse.json({ sale }, { status: 201 })
  } catch (error) {
    console.error("Create sale error:", error)
    return NextResponse.json({ error: "حدث خطأ في إنشاء الفاتورة" }, { status: 500 })
  }
}
