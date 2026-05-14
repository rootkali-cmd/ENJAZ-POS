import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { searchParams } = request.nextUrl
    const search = searchParams.get("search") || ""

    const where = {
      storeId: session.storeId,
      isActive: true,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        _count: { select: { sales: true } },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ employees })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const body = await request.json()
    const { name, phone, email, role, password, salary, salaryType, canGiveDiscount, canProcessReturns, canAccessProtected, permissions } = body

    if (!name) return NextResponse.json({ error: "اسم الموظف مطلوب" }, { status: 400 })

    const employee = await prisma.employee.create({
      data: {
        storeId: session.storeId,
        name,
        phone,
        email,
        role: role || "cashier",
        password: password ? await hashPassword(password) : null,
        salary: parseFloat(salary || 0),
        salaryType: salaryType || "monthly",
        canGiveDiscount: canGiveDiscount || false,
        canProcessReturns: canProcessReturns || false,
        canAccessProtected: canAccessProtected || false,
        permissions: permissions ? JSON.stringify(permissions) : null,
      },
    })

    return NextResponse.json({ employee }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
