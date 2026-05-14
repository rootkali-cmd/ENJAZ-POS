import { NextRequest, NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStoreUser()
    const { id } = await params
    const body = await request.json()

    const existing = await prisma.storeDevice.findFirst({ where: { id, storeId: user.storeId } })
    if (!existing) return NextResponse.json({ error: "الجهاز غير موجود" }, { status: 404 })

    const device = await prisma.storeDevice.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        type: body.type ?? existing.type,
        status: body.status ?? existing.status,
        settings: body.settings ?? existing.settings,
      },
    })

    return NextResponse.json({ device })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStoreUser()
    const { id } = await params

    const existing = await prisma.storeDevice.findFirst({ where: { id, storeId: user.storeId } })
    if (!existing) return NextResponse.json({ error: "الجهاز غير موجود" }, { status: 404 })

    await prisma.storeDevice.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
