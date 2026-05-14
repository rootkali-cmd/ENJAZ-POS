"use client"

import { Sparkles, TrendingUp, AlertTriangle, Package, Users, ShoppingCart, MessageSquare, BarChart3 } from "lucide-react"

const PROMPTS = [
  { icon: TrendingUp, label: "لخص مبيعات اليوم", message: "لخص مبيعات اليوم كاملة مع الأرباح والإيرادات" },
  { icon: AlertTriangle, label: "المنتجات اللي قربت تخلص", message: "عرض المنتجات اللي مخزونها قليل أو قرب يخلص" },
  { icon: ShoppingCart, label: "اقتراح للمنتجات الراكدة", message: "اقترح عرض أو خصم للمنتجات اللي مابتتباعش" },
  { icon: Users, label: "أفضل موظف مبيعات", message: "مين أحسن موظف في المبيعات الفترة دي؟" },
  { icon: BarChart3, label: "تقرير الأرباح", message: "عرض تقرير الأرباح والخسائر للشهر ده" },
  { icon: Package, label: "جرد المخزون", message: "عرض جرد سريع للمخزون الحالي" },
  { icon: MessageSquare, label: "رسالة للعملاء", message: "اقترح رسالة واتساب لعملاء المتجر" },
  { icon: Sparkles, label: "تحسين المتجر", message: "عندك اقتراحات لتحسين مبيعات المتجر؟" },
]

interface SuggestedPromptChipsProps {
  onSend: (msg: string) => void
  remaining: number
}

export function SuggestedPromptChips({ onSend }: SuggestedPromptChipsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {PROMPTS.map((prompt, i) => {
        const Icon = prompt.icon
        return (
          <button
            key={i}
            onClick={() => onSend(prompt.message)}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group text-center"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 group-hover:from-primary/20 group-hover:to-purple-500/20 transition-all duration-300">
              <Icon size={18} className="text-primary" />
            </div>
            <span className="text-[10px] leading-tight text-muted group-hover:text-foreground transition-colors line-clamp-2">
              {prompt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
