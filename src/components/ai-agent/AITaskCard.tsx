"use client"

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-500/10 text-red-400 border-red-500/20",
  medium: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  low: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

interface AITaskCardProps {
  task: {
    title: string
    priority: string
    description: string
    actionType: string
    cta: string
  }
}

export function AITaskCard({ task }: AITaskCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111114]/80 p-4 transition hover:-translate-y-0.5 hover:border-violet-500/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium">{task.title}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low}`}>
              {task.priority === "high" ? "عاجل" : task.priority === "medium" ? "مهم" : "اختياري"}
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{task.description}</p>
        </div>
        <button className="text-[11px] px-3 py-1.5 rounded-lg font-medium shrink-0 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition">
          {task.cta}
        </button>
      </div>
    </div>
  )
}
