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
    const customer = await prisma.customer.findFirst({
      where: { id, storeId: session.storeId },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { payments: true },
        },
      },
    })

    if (!customer) return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 })
    return NextResponse.json({ customer })
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

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        notes: body.notes,
      },
    })

    return NextResponse.json({ customer })
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
    const customer = await prisma.customer.findFirst({ where: { id, storeId: session.storeId } })
    if (!customer) return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 })

    await prisma.$transaction([
      prisma.sale.updateMany({ where: { storeId: session.storeId, customerId: id }, data: { customerId: null } }),
      prisma.customer.delete({ where: { id } }),
    ])

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
