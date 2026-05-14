import { NextRequest, NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await requireStoreUser()

    const devices = await prisma.storeDevice.findMany({
      where: { storeId: user.storeId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { eventLogs: true } } },
    })

    const total = devices.length
    const connected = devices.filter(d => d.status === "connected").length
    const needsSetup = devices.filter(d => d.status === "needs_setup" || d.status === "needs_helper").length
    const unsupported = devices.filter(d => d.status === "unsupported").length

    return NextResponse.json({ devices, summary: { total, connected, needsSetup, unsupported } })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireStoreUser()
    const body = await request.json()

    const device = await prisma.storeDevice.create({
      data: {
        storeId: user.storeId,
        name: body.name || "جهاز جديد",
        type: body.type || "unknown",
        connectionType: body.connectionType || "manual",
        status: body.status || "unknown",
        vendorId: body.vendorId || null,
        productId: body.productId || null,
        manufacturer: body.manufacturer || null,
        productName: body.productName || null,
        capabilities: body.capabilities || null,
        settings: body.settings || null,
      },
    })

    await prisma.deviceEventLog.create({
      data: {
        storeId: user.storeId,
        deviceId: device.id,
        eventType: "DEVICE_DETECTED",
        status: device.status,
        message: `تم إضافة الجهاز ${device.name}`,
      },
    })

    return NextResponse.json({ device }, { status: 201 })
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
