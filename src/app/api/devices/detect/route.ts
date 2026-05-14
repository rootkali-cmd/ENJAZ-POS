import { NextRequest, NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireStoreUser()
    const body = await request.json()

    const device = await prisma.storeDevice.create({
      data: {
        storeId: user.storeId,
        name: body.name || "جهاز مكتشف",
        type: body.type || "unknown",
        connectionType: body.connectionType || "keyboard",
        status: "connected",
        vendorId: body.vendorId || null,
        productId: body.productId || null,
        manufacturer: body.manufacturer || null,
        productName: body.productName || null,
        capabilities: body.capabilities || null,
        lastSeenAt: new Date(),
        lastTestAt: new Date(),
      },
    })

    await prisma.deviceEventLog.create({
      data: {
        storeId: user.storeId,
        deviceId: device.id,
        eventType: "DEVICE_DETECTED",
        status: "connected",
        message: `تم اكتشاف ${device.name}`,
        metadata: { vendorId: body.vendorId, productId: body.productId },
      },
    })

    return NextResponse.json({ device }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
