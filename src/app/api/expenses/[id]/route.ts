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
    const expense = await prisma.expense.findFirst({ where: { id, storeId: session.storeId } })
    if (!expense) return NextResponse.json({ error: "المصروف غير موجود" }, { status: 404 })

    return NextResponse.json({ expense })
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
    const expense = await prisma.expense.findFirst({ where: { id, storeId: session.storeId } })
    if (!expense) return NextResponse.json({ error: "المصروف غير موجود" }, { status: 404 })

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        ...(body.category !== undefined && { category: body.category }),
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
      },
    })

    return NextResponse.json({ expense: updated })
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
    const expense = await prisma.expense.findFirst({ where: { id, storeId: session.storeId } })
    if (!expense) return NextResponse.json({ error: "المصروف غير موجود" }, { status: 404 })

    await prisma.expense.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
