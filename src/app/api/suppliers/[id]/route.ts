import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { id } = await params
    const supplier = await prisma.supplier.findFirst({
      where: { id, storeId: session.storeId },
      include: { products: { take: 20 } },
    })

    if (!supplier) return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 })
    return NextResponse.json({ supplier })
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
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.supplier.findFirst({
      where: { id, storeId: session.storeId },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 })

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        notes: body.notes,
      },
    })

    return NextResponse.json({ supplier })
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
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { id } = await params
    const supplier = await prisma.supplier.findFirst({
      where: { id, storeId: session.storeId },
      select: { id: true },
    })
    if (!supplier) return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 })

    await prisma.$transaction([
      prisma.product.updateMany({
        where: { storeId: session.storeId, supplierId: id },
        data: { supplierId: null },
      }),
      prisma.supplier.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
