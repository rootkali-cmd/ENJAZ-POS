import { NextRequest, NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"

const DAILY_LIMIT = 10

export async function POST(request: NextRequest) {
  try {
    const user = await requireStoreUser()
    const { conversationId, message } = await request.json()

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 })
    }

    // Get or create usage
    let usage = await prisma.aiUsage.findUnique({ where: { storeId: user.storeId } })
    if (!usage) {
      usage = await prisma.aiUsage.create({ data: { storeId: user.storeId } })
    }

    const today = new Date()
    const isNewDay = !usage.lastUsedAt ||
      usage.lastUsedAt.getDate() !== today.getDate() ||
      usage.lastUsedAt.getMonth() !== today.getMonth() ||
      usage.lastUsedAt.getFullYear() !== today.getFullYear()

    const usedToday = isNewDay ? 0 : usage.usedToday
    if (usedToday >= DAILY_LIMIT) {
      return NextResponse.json({
        error: "لقد استنفدت حصتك اليومية من AI Agent",
        remaining: 0,
        limit: DAILY_LIMIT,
      }, { status: 429 })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, storeId: user.storeId },
      })
    }

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          storeId: user.storeId,
          userId: user.id,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : ""),
        },
      })
    }

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        storeId: user.storeId,
        userId: user.id,
        role: "user",
        content: message,
      },
    })

    // Build AI context
    const [todaySales, lowStock, topProducts, employeePerf, expenses] = await Promise.all([
      prisma.sale.aggregate({
        where: { storeId: user.storeId, createdAt: { gte: new Date(today.setHours(0, 0, 0, 0)) }, status: "completed" },
        _sum: { total: true, profit: true },
        _count: true,
      }),
      prisma.product.count({
        where: { storeId: user.storeId, isActive: true, quantity: { lte: prisma.product.fields.lowStockThreshold } },
      }),
      prisma.saleItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
        where: { sale: { storeId: user.storeId, status: "completed" } },
      }),
      prisma.employee.findMany({
        where: { storeId: user.storeId, isActive: true },
        include: { _count: { select: { sales: true } }, sales: { select: { total: true } } },
        take: 5,
      }),
      prisma.expense.aggregate({
        where: { storeId: user.storeId, date: { gte: new Date(today.setHours(0, 0, 0, 0)) } },
        _sum: { amount: true },
      }),
    ])

    const systemPrompt = `أنت مساعد ENJAZ AI لإدارة المتجر.
أنت تعمل داخل متجر: ${user.storeId}
لديك صلاحية قراءة البيانات فقط.

مهمتك:
- الرد باللغة العربية الفصحى البسيطة
- استخدم البيانات الحقيقية من المتجر
- اعرض الأرقام بشكل منظم
- اقترح تحسينات بناءً على البيانات

تعليمات صارمة:
- لا تنشئ فواتير
- لا تحذف منتجات
- لا تغير أسعار
- لا تعدل رواتب
- أنت مساعد استشاري فقط

بيانات المتجر الحالية:
مبيعات اليوم: ${todaySales._sum.total || 0} ريال
أرباح اليوم: ${todaySales._sum.profit || 0} ريال
عدد المعاملات: ${todaySales._count}
منتجات منخفضة المخزون: ${lowStock}
مصروفات اليوم: ${expenses._sum.amount || 0} ريال`

    // Call AI
    const aiResponse = await callAI(systemPrompt, message)

    // Save AI message
    await prisma.aiMessage.create({
      data: {
        conversationId: conversation.id,
        storeId: user.storeId,
        role: "assistant",
        content: aiResponse,
      },
    })

    // Update usage
    await prisma.aiUsage.update({
      where: { id: usage.id },
      data: {
        usedToday: usedToday + 1,
        totalUsed: { increment: 1 },
        lastUsedAt: new Date(),
        date: today,
      },
    })

    // Update conversation title if first message
    const msgCount = await prisma.aiMessage.count({ where: { conversationId: conversation.id } })
    if (msgCount <= 2 && message.length < 100) {
      await prisma.aiConversation.update({
        where: { id: conversation.id },
        data: { title: message.slice(0, 50) },
      })
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      conversationId: conversation.id,
      remainingMessages: DAILY_LIMIT - usedToday - 1,
    })
  } catch (error) {
    console.error("[AI Chat] Error:", error)
    return NextResponse.json({
      success: false,
      error: "الذكاء الاصطناعي مشغول حاليًا، حاول مرة أخرى بعد قليل.",
      message: "الذكاء الاصطناعي مشغول حاليًا، حاول مرة أخرى بعد قليل.",
    }, { status: 200 })
  }
}

async function callAI(systemPrompt: string, userMessage: string): Promise<string> {
  const providers = [
    {
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    },
    {
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
    },
    {
      name: "baseten",
      url: "https://inference.baseten.co/v1",
      key: process.env.BASETEN_API_KEY,
      model: process.env.BASETEN_MODEL || "nvidia/Nemotron-120B-A12B",
    },
  ]

  for (const provider of providers) {
    if (!provider.key) continue

    try {
      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
          ...(provider.name === "openrouter" ? { "HTTP-Referer": "https://enjaz.one", "X-Title": "ENJAZ" } : {}),
        },
        body: JSON.stringify({
          model: provider.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1024,
          temperature: 0.3,
        }),
      })

      if (!res.ok) continue

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content
      if (content) return content
    } catch {
      continue
    }
  }

  return "عذراً، الذكاء الاصطناعي مشغول حاليًا. حاول مرة أخرى بعد قليل."
}
