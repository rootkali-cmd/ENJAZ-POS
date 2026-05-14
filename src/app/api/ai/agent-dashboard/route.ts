import { NextResponse } from "next/server"
import { requireStoreUser } from "@/lib/auth/session"
import { prisma } from "@/lib/prisma"
import { buildStoreContext, generateFallbackDashboard } from "@/lib/ai/agent"
import type { AgentDashboardData } from "@/lib/ai/agent"

export async function GET() {
  try {
    const user = await requireStoreUser()

    const cached = await prisma.aiAgentSnapshot.findFirst({
      where: { storeId: user.storeId },
      orderBy: { createdAt: "desc" },
    })

    if (cached) {
      const age = Date.now() - cached.createdAt.getTime()
      if (age < 15 * 60 * 1000 && cached.status === "completed") {
        const data = typeof cached.payload === "string" ? JSON.parse(cached.payload) : cached.payload
        return NextResponse.json(data)
      }
    }

    const ctx = await buildStoreContext(user.storeId)
    const hasData = ctx.todaySales > 0 || ctx.totalProducts > 0

    let dashboard: AgentDashboardData

    if (!hasData) {
      dashboard = {
        generatedAt: new Date().toISOString(),
        overallStatus: "good",
        metrics: [],
        insights: [],
        tasks: [],
        activity: [],
      }
    } else {
      dashboard = generateFallbackDashboard(ctx as any)
    }

    if (hasData) {
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
        data: dashboard.activity.map(a => ({
          storeId: user.storeId,
          userId: user.id,
          title: a.title,
          type: a.type,
          status: "completed",
        })),
      })
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error("[AI Agent Dashboard] Error:", error)
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      overallStatus: "good",
      metrics: [],
      insights: [],
      tasks: [],
      activity: [],
    })
  }
}
