"use client"

import { AlertTriangle, TrendingDown, ArrowUpRight, Package, Users, DollarSign, RotateCcw, TrendingUp } from "lucide-react"

const INSIGHT_ICONS: Record<string, React.ReactNode> = {
  sales: <TrendingUp size={16} />,
  inventory: <Package size={16} />,
  customers: <Users size={16} />,
  employees: <Users size={16} />,
  expenses: <DollarSign size={16} />,
  returns: <RotateCcw size={16} />,
  operations: <AlertTriangle size={16} />,
}

const SEVERITY_COLORS: Record<string, { border: string; bg: string; text: string; label: string }> = {
  high: { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-400", label: "عالية" },
  medium: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-400", label: "متوسطة" },
  low: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-400", label: "منخفضة" },
}

interface AIInsightCardProps {
  insight: {
    type: string
    title: string
    severity: string
    description: string
    recommendedAction: string
  }
}

export function AIInsightCard({ insight }: AIInsightCardProps) {
  const sc = SEVERITY_COLORS[insight.severity] || SEVERITY_COLORS.low
  return (
    <div className={`rounded-2xl border ${sc.border} ${sc.bg} p-4 transition hover:-translate-y-0.5`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sc.bg} ${sc.text}`}>
          {INSIGHT_ICONS[insight.type] || <AlertTriangle size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">{insight.title}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{insight.description}</p>
          {insight.recommendedAction && (
            <p className="text-[11px] text-violet-300 mt-2 flex items-center gap-1">
              <ArrowUpRight size={12} />
              {insight.recommendedAction}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
