import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { hashPassword } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { id } = await params
    const employee = await prisma.employee.findFirst({
      where: { id, storeId: session.storeId },
      include: {
        sales: { orderBy: { createdAt: "desc" }, take: 20 },
        salaryPayments: { orderBy: { date: "desc" } },
        incentives: { orderBy: { date: "desc" } },
      },
    })

    if (!employee) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 })
    return NextResponse.json({ employee })
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
    const { name, phone, role, password, salary, salaryType, isActive, canGiveDiscount, canProcessReturns, canAccessProtected, permissions } = body

    const existing = await prisma.employee.findFirst({
      where: { id, storeId: session.storeId },
      select: { id: true },
    })
    if (!existing) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 })

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(role !== undefined && { role }),
        ...(password && { password: await hashPassword(password) }),
        ...(salary !== undefined && { salary: parseFloat(salary) }),
        ...(salaryType !== undefined && { salaryType }),
        ...(isActive !== undefined && { isActive }),
        ...(canGiveDiscount !== undefined && { canGiveDiscount }),
        ...(canProcessReturns !== undefined && { canProcessReturns }),
        ...(canAccessProtected !== undefined && { canAccessProtected }),
        ...(permissions !== undefined && { permissions: JSON.stringify(permissions) }),
      },
    })

    return NextResponse.json({ employee })
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
    const employee = await prisma.employee.findFirst({
      where: { id, storeId: session.storeId },
      select: { id: true },
    })
    if (!employee) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 })

    await prisma.employee.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
