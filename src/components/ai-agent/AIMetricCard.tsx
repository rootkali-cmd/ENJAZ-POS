"use client"

import { TrendingUp, Package, Users, Lightbulb } from "lucide-react"

const ICON_MAP: Record<string, React.ReactNode> = {
  sales_today: <TrendingUp size={18} />,
  low_stock: <Package size={18} />,
  opportunities: <Users size={18} />,
  suggestions: <Lightbulb size={18} />,
}

const COLOR_MAP: Record<string, string> = {
  sales_today: "from-emerald-500 to-green-600",
  low_stock: "from-amber-500 to-orange-600",
  opportunities: "from-blue-500 to-indigo-600",
  suggestions: "from-violet-500 to-purple-600",
}

const BORDER_MAP: Record<string, string> = {
  sales_today: "border-emerald-500/20",
  low_stock: "border-amber-500/20",
  opportunities: "border-blue-500/20",
  suggestions: "border-violet-500/20",
}

interface AIMetricCardProps {
  metric: {
    key: string
    label: string
    value: string
    trend: string
    description: string
  }
}

export function AIMetricCard({ metric }: AIMetricCardProps) {
  return (
    <div className={`rounded-2xl border bg-[#111114]/80 p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${BORDER_MAP[metric.key] || "border-white/10"}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${COLOR_MAP[metric.key] || "from-violet-500 to-purple-600"} flex items-center justify-center`}>
          {ICON_MAP[metric.key] || <Lightbulb size={18} className="text-white" />}
        </div>
        <span className="text-[11px] text-white/50">{metric.label}</span>
      </div>
      <p className="text-xl font-bold tracking-tight mb-1">{metric.value}</p>
      <p className="text-[11px] text-white/40">{metric.description}</p>
    </div>
  )
}
