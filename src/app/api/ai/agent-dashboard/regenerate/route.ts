import { NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { buildStoreContext, generateFallbackDashboard } from "@/lib/ai/agent"

export async function POST() {
  try {
    const user = await requireStoreUser()
    const ctx = await buildStoreContext(user.storeId)
    const hasData = ctx.todaySales > 0 || ctx.totalProducts > 0

    if (!hasData) {
      return NextResponse.json({ error: "لا توجد بيانات كافية بعد" }, { status: 400 })
    }

    const dashboard = generateFallbackDashboard(ctx as any)

    await prisma.aiAgentSnapshot.create({
      data: {
        storeId: user.storeId,
        userId: user.id,
        payload: dashboard as any,
        status: "completed",
        fallbackCount: 1,
      },
    })

    await prisma.aiAgentActivity.createMany({
      data: [
        { storeId: user.storeId, userId: user.id, title: "تم تحديث الرؤى التشغيلية", type: "analysis", status: "completed" },
        ...dashboard.activity.map(a => ({ storeId: user.storeId, userId: user.id, title: a.title, type: a.type, status: "completed" })),
      ],
    })

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("[AI Agent Regenerate] Error:", error)
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 })
  }
}
