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
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = { storeId: session.storeId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { totalPurchases: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ])

    return NextResponse.json({ customers, total, page, totalPages: Math.ceil(total / limit) })
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

    const { name, phone, address, notes } = await request.json()
    if (!name) {
      return NextResponse.json({ error: "اسم العميل مطلوب" }, { status: 400 })
    }

    const customer = await prisma.customer.create({
      data: { storeId: session.storeId, name, phone, address, notes },
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
