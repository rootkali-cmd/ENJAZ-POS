import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { searchParams } = request.nextUrl
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const category = searchParams.get("category")

    const where: any = { storeId: session.storeId }
    if (from) where.date = { ...where.date, gte: new Date(from) }
    if (to) where.date = { ...where.date, lte: new Date(to) }
    if (category) where.category = category

    const expenses = await prisma.expense.findMany({
      where,
      include: { employee: { select: { name: true } } },
      orderBy: { date: "desc" },
    })

    const total = expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)
    return NextResponse.json({ expenses, total })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { category, amount, description, date } = await request.json()
    if (!category || !amount) {
      return NextResponse.json({ error: "نوع المصروف والمبلغ مطلوبان" }, { status: 400 })
    }

    const expense = await prisma.expense.create({
      data: {
        storeId: session.storeId,
        category,
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : new Date(),
      },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
