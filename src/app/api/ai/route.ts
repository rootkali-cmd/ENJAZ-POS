import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { STORE_TOOLS, storeActions } from "@/lib/ai-store-tools"

const DAILY_LIMIT = 10
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
const BASETEN_API_URL = "https://inference.baseten.co/v1"
const MAX_TOOL_STEPS = 5

type Provider = "groq" | "openrouter" | "baseten"

type ToolCall = {
  id: string
  function?: {
    name?: string
    arguments?: string
  }
}

type AiMessage = {
  role: string
  content?: string | null
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

function providerConfig(provider: Provider) {
  if (provider === "groq") return { apiKey: process.env.GROQ_API_KEY, apiUrl: GROQ_API_URL, model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" }
  if (provider === "openrouter") return { apiKey: process.env.OPENROUTER_API_KEY, apiUrl: OPENROUTER_API_URL, model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini" }
  if (provider === "baseten") return { apiKey: process.env.BASETEN_API_KEY, apiUrl: BASETEN_API_URL, model: process.env.BASETEN_MODEL || "nvidia/Nemotron-120B-A12B" }
  return { apiKey: "", apiUrl: "", model: "" }
}

function providerHeaders(provider: Provider, apiKey: string) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
    ...(provider === "openrouter" ? { "HTTP-Referer": "https://enjaz.one", "X-Title": "ENJAZ" } : {}),
  }
}

async function runToolCall(storeId: string, toolCall: ToolCall): Promise<AiMessage> {
  const name = toolCall.function?.name || ""
  const action = storeActions[name]

  if (!action) {
    return {
      role: "tool",
      content: JSON.stringify({ success: false, data: null, error: `الأداة ${name} غير متاحة لوكيل المتجر` }),
      tool_call_id: toolCall.id,
    }
  }

  let args: Record<string, unknown> = {}
  try {
    args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {}
  } catch {
    args = {}
  }

  try {
    const result = await action(storeId, args)
    return { role: "tool", content: JSON.stringify(result), tool_call_id: toolCall.id }
  } catch (error) {
    console.error(`[AI][tool:${name}]`, error)
    return {
      role: "tool",
      content: JSON.stringify({ success: false, data: null, error: "حدث خطأ أثناء تنفيذ أداة المتجر" }),
      tool_call_id: toolCall.id,
    }
  }
}

async function callAI(systemPrompt: string, messages: AiMessage[], storeId: string) {
  async function tryProvider(provider: Provider): Promise<{ content: string; provider: string } | null> {
    const { apiKey, apiUrl, model } = providerConfig(provider)
    if (!apiKey) return null

    const conversation: AiMessage[] = [{ role: "system", content: systemPrompt }, ...messages]

    try {
      for (let step = 0; step < MAX_TOOL_STEPS; step += 1) {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: providerHeaders(provider, apiKey),
          body: JSON.stringify({ model, messages: conversation, max_tokens: 1400, temperature: 0.2, tools: STORE_TOOLS, tool_choice: "auto" }),
        })

        if (!res.ok) { console.error(`[AI][${provider}] API error ${res.status}:`, await res.text()); return null }

        const data = await res.json()
        const choice = data.choices?.[0]
        const assistantMessage = choice?.message as AiMessage | undefined
        if (!assistantMessage) return null

        const toolCalls = assistantMessage.tool_calls || []
        if (toolCalls.length === 0) return { content: assistantMessage.content || "...", provider }

        conversation.push(assistantMessage)
        for (const toolCall of toolCalls) conversation.push(await runToolCall(storeId, toolCall))
      }
      return { content: "نفذت عدة خطوات", provider }
    } catch (error) {
      console.error(`[AI][${provider}] Fetch error:`, error)
      return null
    }
  }

  let result = await tryProvider("groq")
  if (!result) result = await tryProvider("openrouter")
  if (!result) result = await tryProvider("baseten")
  if (!result) return { content: "تعذر الاتصال بخدمات AI", provider: "none" }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    if (session.role !== "owner") return NextResponse.json({ error: "وكيل المتجر متاح لصاحب المتجر فقط" }, { status: 403 })

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      select: { aiEnabled: true, aiDailyLimit: true, name: true, currency: true },
    })
    if (!store?.aiEnabled) return NextResponse.json({ error: "AI Agent معطل في هذا المتجر" }, { status: 403 })

    let aiUsage = await prisma.aiUsage.findUnique({ where: { storeId: session.storeId } })
    if (!aiUsage) aiUsage = await prisma.aiUsage.create({ data: { storeId: session.storeId } })

    const today = new Date()
    const lastUsedDate = aiUsage.lastUsedAt
    const isNewDay = !lastUsedDate ||
      lastUsedDate.getDate() !== today.getDate() ||
      lastUsedDate.getMonth() !== today.getMonth() ||
      lastUsedDate.getFullYear() !== today.getFullYear()

    const usedToday = isNewDay ? 0 : aiUsage.usedToday
    const limit = store.aiDailyLimit || DAILY_LIMIT

    const body = await request.json()
    const { message, image } = body

    if (image) {
      return NextResponse.json({ response: "النموذج الحالي لا يدعم تحليل الصور", provider: "system", usedToday, limit, remaining: Math.max(0, limit - usedToday) })
    }

    if (!message || !message.trim()) return NextResponse.json({ error: "الرسالة مطلوبة" }, { status: 400 })
    if (message.length > 1000) return NextResponse.json({ error: "الرسالة طويلة جداً" }, { status: 400 })
    if (usedToday >= limit) return NextResponse.json({ error: "انتهت حصتك اليومية", remaining: 0 }, { status: 429 })

    const result = await callAI(
      `أنت AI Agent لـ ENJAZ. المتجر: ${store.name}. العملة: ${store.currency}. استخدم البيانات الحقيقية.`,
      [{ role: "user", content: message }],
      session.storeId
    )

    await prisma.aiUsage.update({
      where: { storeId: session.storeId },
      data: { usedToday: usedToday + 1, totalUsed: { increment: 1 }, lastUsedAt: new Date(), date: today },
    })

    return NextResponse.json({ response: result.content, provider: result.provider, usedToday: usedToday + 1, limit, remaining: limit - (usedToday + 1) })
  } catch (error) {
    console.error("[AI] Error:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || !session.storeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 })
    if (session.role !== "owner") return NextResponse.json({ error: "وكيل المتجر متاح لصاحب المتجر فقط" }, { status: 403 })

    const { searchParams } = request.nextUrl
    const conversationId = searchParams.get("conversationId")

    const store = await prisma.store.findUnique({
      where: { id: session.storeId },
      select: { aiEnabled: true, aiDailyLimit: true, name: true, currency: true },
    })

    const aiUsage = await prisma.aiUsage.findUnique({ where: { storeId: session.storeId } })
    const today = new Date()
    const isNewDay = !aiUsage?.lastUsedAt ||
      aiUsage.lastUsedAt.getDate() !== today.getDate() ||
      aiUsage.lastUsedAt.getMonth() !== today.getMonth() ||
      aiUsage.lastUsedAt.getFullYear() !== today.getFullYear()

    const usedToday = isNewDay ? 0 : (aiUsage?.usedToday || 0)
    const limit = store?.aiDailyLimit || DAILY_LIMIT

    const conversations = await prisma.aiConversation.findMany({
      where: { storeId: session.storeId },
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: { id: true, title: true },
    })

    let messages: any[] = []
    if (conversationId) {
      const conv = await prisma.aiConversation.findFirst({ where: { id: conversationId, storeId: session.storeId } })
      if (conv) {
        messages = await prisma.aiMessage.findMany({
          where: { conversationId: conv.id },
          orderBy: { createdAt: "desc" },
          take: 100,
        })
      }
    }

    return NextResponse.json({
      enabled: store?.aiEnabled ?? true,
      limit,
      usedToday,
      remaining: Math.max(0, limit - usedToday),
      storeName: store?.name,
      currency: store?.currency,
      conversations,
      messages,
    })
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
