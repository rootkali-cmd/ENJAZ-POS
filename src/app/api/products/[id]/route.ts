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
    const product = await prisma.product.findFirst({
      where: { id, storeId: session.storeId },
      include: {
        category: true,
        barcodes: true,
        supplier: true,
        inventoryMovements: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function PUT(
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
    const { name, sku, price, costPrice, quantity, lowStockThreshold, categoryId, supplierId, description, isActive, barcodes } = body

    const existing = await prisma.product.findFirst({
      where: { id, storeId: session.storeId },
    })
    if (!existing) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sku !== undefined && { sku }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(lowStockThreshold !== undefined && { lowStockThreshold: parseInt(lowStockThreshold) }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(supplierId !== undefined && { supplierId: supplierId || null }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
        barcodes: true,
      },
    })

    if (barcodes && Array.isArray(barcodes)) {
      await prisma.productBarcode.deleteMany({ where: { productId: id } })
      if (barcodes.length > 0) {
        await prisma.productBarcode.createMany({
          data: barcodes.map((b: string, i: number) => ({
            productId: id,
            barcode: b,
            isPrimary: i === 0,
          })),
        })
      }
    }

    if (quantity !== undefined && quantity !== existing.quantity) {
      const diff = parseInt(quantity) - existing.quantity
      await prisma.inventoryMovement.create({
        data: {
          productId: id,
          type: diff > 0 ? "in" : "out",
          quantity: Math.abs(diff),
          notes: "تعديل المخزون يدوياً",
        },
      })
    }

    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    }

    const { id } = await params
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
