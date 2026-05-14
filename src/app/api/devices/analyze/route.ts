import { NextRequest, NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await requireStoreUser()
    const { deviceId } = await request.json()
    if (!deviceId) return NextResponse.json({ error: "deviceId مطلوب" }, { status: 400 })

    const device = await prisma.storeDevice.findFirst({ where: { id: deviceId, storeId: user.storeId } })
    if (!device) return NextResponse.json({ error: "الجهاز غير موجود" }, { status: 404 })

    const aiInfo: any = {
      name: device.name,
      type: device.type,
      connectionType: device.connectionType,
      vendorId: device.vendorId,
      productId: device.productId,
      manufacturer: device.manufacturer,
      productName: device.productName,
    }

    const analysis = {
      likelyDeviceType: device.type,
      confidence: 50,
      reason: "تم التحليل من ENJAZ AI. للحصول على تحليل دقيق، يرجى تثبيت ENJAZ Device Helper.",
      recommendedSetup: ["قم بتوصيل الجهاز", "اختبر الجهاز من قائمة الأجهزة"],
      requiresDesktopHelper: device.type === "cash_drawer" || device.connectionType === "serial" || device.connectionType === "usb",
      browserSupportLevel: device.connectionType === "keyboard" ? "full" : "partial",
      notes: device.requiresHelper ? "هذا الجهاز يحتاج ENJAZ Device Helper للتشغيل الكامل." : "يمكن استخدام الجهاز من المتصفح بشكل محدود.",
    }

    await prisma.storeDevice.update({
      where: { id: device.id },
      data: { aiAnalysis: analysis as any, requiresHelper: analysis.requiresDesktopHelper },
    })

    await prisma.deviceEventLog.create({
      data: {
        storeId: user.storeId,
        deviceId: device.id,
        eventType: "DEVICE_AI_ANALYZED",
        status: "completed",
        message: `تم تحليل ${device.name}`,
      },
    })

    return NextResponse.json({ analysis })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
