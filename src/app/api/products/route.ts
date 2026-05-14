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
    const categoryId = searchParams.get("categoryId")
    const lowStock = searchParams.get("lowStock")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = { storeId: session.storeId, isActive: true }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        { barcodes: { some: { barcode: { contains: search, mode: "insensitive" } } } },
      ]
    }
    if (categoryId) where.categoryId = categoryId
    if (lowStock === "true") where.quantity = { lte: prisma.product.fields.lowStockThreshold }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          barcodes: { select: { barcode: true, isPrimary: true } },
          supplier: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error("Products error:", error)
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
    const { name, sku, price, costPrice, quantity, lowStockThreshold, categoryId, supplierId, description, barcodes } = body

    if (!name || price === undefined) {
      return NextResponse.json({ error: "اسم المنتج والسعر مطلوبان" }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        storeId: session.storeId,
        name,
        sku: sku || `SKU-${generateInvoiceNumber().slice(0, 10)}`,
        price: parseFloat(price),
        costPrice: parseFloat(costPrice || 0),
        quantity: parseInt(quantity || 0),
        lowStockThreshold: parseInt(lowStockThreshold || 5),
        categoryId: categoryId || null,
        supplierId: supplierId || null,
        description,
        barcodes: barcodes?.length
          ? {
              create: barcodes.map((b: string, i: number) => ({
                barcode: b,
                isPrimary: i === 0,
              })),
            }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        barcodes: { select: { barcode: true, isPrimary: true } },
      },
    })

    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        type: "in",
        quantity: parseInt(quantity || 0),
        notes: "إضافة منتج جديد",
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ error: "حدث خطأ في إضافة المنتج" }, { status: 500 })
  }
}
