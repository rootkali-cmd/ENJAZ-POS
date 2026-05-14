import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    const sale = await prisma.sale.findFirst({
      where: { id, storeId: session.storeId },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        payments: true,
        customer: true,
        employee: { select: { id: true, name: true } },
        returns: true,
      },
    })

    if (!sale) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 })
    }

    return NextResponse.json({ sale })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const sale = await prisma.sale.findFirst({
      where: { id, storeId: session.storeId },
    })
    if (!sale) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 })
    }

    const updated = await prisma.sale.update({
      where: { id },
      data: {
        status: body.status || sale.status,
        notes: body.notes !== undefined ? body.notes : sale.notes,
      },
    })

    if (body.status === "cancelled") {
      const items = await prisma.saleItem.findMany({ where: { saleId: id } })
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        })
        await prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "out",
            quantity: item.quantity,
            reference: sale.invoiceNumber,
            notes: `إلغاء فاتورة ${sale.invoiceNumber}`,
          },
        })
      }
    }

    return NextResponse.json({ sale: updated })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
