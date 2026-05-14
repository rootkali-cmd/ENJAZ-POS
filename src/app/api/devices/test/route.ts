import { NextRequest, NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireStoreUser()
    const body = await request.json()

    if (body.deviceId) {
      const existing = await prisma.storeDevice.findFirst({ where: { id: body.deviceId, storeId: user.storeId } })
      if (existing) {
        await prisma.storeDevice.update({
          where: { id: existing.id },
          data: { status: "connected", lastTestAt: new Date() },
        })
      }
    }

    await prisma.deviceEventLog.create({
      data: {
        storeId: user.storeId,
        deviceId: body.deviceId || null,
        eventType: "DEVICE_TESTED",
        status: body.success ? "connected" : "error",
        message: body.message || "تم اختبار الجهاز",
        metadata: { deviceType: body.deviceType },
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
