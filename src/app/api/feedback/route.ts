import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })

    const { type, message, contact } = await request.json()
    if (!message) return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 })

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      select: { name: true, phone: true },
    })

    const feedback = await prisma.betaFeedback.create({
      data: {
        storeId: session.storeId,
        type: type || "feedback",
        message,
        contact,
      },
    })

    await sendTelegramMessage(
      `<b>📬 ENJAZ Beta Feedback</b>\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<b>🛒 المتجر:</b> ${store?.name || "غير معروف"}\n` +
      `<b>📞 الهاتف:</b> ${store?.phone || "غير مسجل"}\n` +
      `<b>📌 النوع:</b> ${type === "bug" ? "🐛 مشكلة" : "💡 اقتراح"}\n` +
      `<b>💬 الرسالة:</b>\n${message}\n` +
      `${contact ? `\n<b>✉️ للتواصل:</b> ${contact}` : ""}\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `<i>${new Date().toLocaleString("ar-SA")}</i>`
    )

    return NextResponse.json({ feedback }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
