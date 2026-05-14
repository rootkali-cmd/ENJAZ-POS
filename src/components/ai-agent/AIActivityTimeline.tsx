"use client"

import { AlertTriangle, TrendingUp, Lightbulb, BarChart3 } from "lucide-react"

const TYPE_ICONS: Record<string, React.ReactNode> = {
  summary: <TrendingUp size={14} />,
  warning: <AlertTriangle size={14} />,
  suggestion: <Lightbulb size={14} />,
  analysis: <BarChart3 size={14} />,
}

const TYPE_COLORS: Record<string, string> = {
  summary: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-amber-500/10 text-amber-400",
  suggestion: "bg-violet-500/10 text-violet-300",
  analysis: "bg-blue-500/10 text-blue-400",
}

interface AIActivityTimelineProps {
  items: { title: string; type: string; timestampLabel: string }[]
}

export function AIActivityTimeline({ items }: AIActivityTimelineProps) {
  if (!items.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111114]/80 divide-y divide-white/[0.06]">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type] || TYPE_COLORS.analysis}`}>
            {TYPE_ICONS[item.type] || TYPE_ICONS.analysis}
          </div>
          <p className="text-sm flex-1">{item.title}</p>
          <span className="text-[11px] text-white/30 shrink-0">{item.timestampLabel}</span>
        </div>
      ))}
    </div>
  )
}
