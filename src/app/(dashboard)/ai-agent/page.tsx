"use client"

import { useEffect, useState } from "react"
import { OwnerGuard } from "@/components/layout/owner-guard"
import { AIAgentHeader } from "@/components/ai-agent/AIAgentHeader"
import { AIMetricCard } from "@/components/ai-agent/AIMetricCard"
import { AIInsightCard } from "@/components/ai-agent/AIInsightCard"
import { AITaskCard } from "@/components/ai-agent/AITaskCard"
import { AIActivityTimeline } from "@/components/ai-agent/AIActivityTimeline"
import { AISecureContextCard } from "@/components/ai-agent/AISecureContextCard"
import { AIEmptyState } from "@/components/ai-agent/AIEmptyState"
import toast from "react-hot-toast"

interface DashboardData {
  generatedAt: string
  overallStatus: string
  metrics: any[]
  insights: any[]
  tasks: any[]
  activity: any[]
}

export default function AiAgentPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchDashboard = async (force = false) => {
    try {
      const url = force ? "/api/ai/agent-dashboard/regenerate" : "/api/ai/agent-dashboard"
      const res = await fetch(url, { method: force ? "POST" : "GET", headers: { "Content-Type": "application/json" } })
      const d = await res.json()

      if (d.error) {
        if (d.error === "لا توجد بيانات كافية بعد") {
          setData({ generatedAt: "", overallStatus: "good", metrics: [], insights: [], tasks: [], activity: [] })
        }
        if (force) toast.error(d.error)
        return
      }

      setData(d)
      if (d.generatedAt) {
        const mins = Math.floor((Date.now() - new Date(d.generatedAt).getTime()) / 60000)
        setLastUpdated(mins < 1 ? "منذ لحظات" : `منذ ${mins} دقائق`)
      }
      if (force) toast.success("تم تحديث الرؤى")
    } catch {
      if (force) toast.error("حدث خطأ")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboard(true)
  }

  const hasData = data && (data.metrics.length > 0 || data.insights.length > 0)

  return (
    <OwnerGuard>
      <div className="h-full flex flex-col bg-[#0a0a0c] text-white overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 [scrollbar-width:none]">
          <div className="max-w-6xl mx-auto">
            <AIAgentHeader
              onRefresh={handleRefresh}
              refreshing={refreshing}
              lastUpdated={lastUpdated}
            />

            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#111114]/80 p-4 animate-pulse">
                      <div className="w-9 h-9 rounded-xl bg-white/5 mb-3" />
                      <div className="h-3 w-20 bg-white/5 rounded mb-2" />
                      <div className="h-6 w-32 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-2xl border border-white/10 bg-[#111114]/80 p-4 animate-pulse">
                      <div className="h-4 w-24 bg-white/5 rounded mb-3" />
                      <div className="h-3 w-full bg-white/5 rounded mb-2" />
                      <div className="h-3 w-3/4 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            ) : !hasData ? (
              <AIEmptyState />
            ) : (
              <div className="space-y-6">
                {/* Metrics */}
                {data!.metrics.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {data!.metrics.map((m) => (
                      <AIMetricCard key={m.key} metric={m} />
                    ))}
                  </div>
                )}

                {/* Insights + Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {data!.insights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">رؤى تشغيلية</h3>
                      <div className="space-y-3">
                        {data!.insights.map((ins: any) => (
                          <AIInsightCard key={ins.id} insight={ins} />
                        ))}
                      </div>
                    </div>
                  )}
                  {data!.tasks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">اقتراحات قابلة للتنفيذ</h3>
                      <div className="space-y-3">
                        {data!.tasks.map((t: any) => (
                          <AITaskCard key={t.id} task={t} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity */}
                {data!.activity.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3">آخر نشاط</h3>
                    <AIActivityTimeline items={data!.activity} />
                  </div>
                )}

                {/* Security */}
                <AISecureContextCard />
              </div>
            )}
          </div>
        </div>
      </div>
    </OwnerGuard>
  )
}
