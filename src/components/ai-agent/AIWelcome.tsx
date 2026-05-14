"use client"

import { Bot, Sparkles } from "lucide-react"
import { SuggestedPromptChips } from "./SuggestedPromptChips"

interface AIWelcomeProps {
  onSend: (msg: string) => void
  remaining: number
  limit: number
}

export function AIWelcome({ onSend, remaining }: AIWelcomeProps) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="relative inline-flex mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-purple-400 to-primary-light flex items-center justify-center shadow-2xl shadow-primary/30">
            <Bot size={40} className="text-white" />
          </div>
          <div className="absolute -top-1 -right-1">
            <Sparkles size={16} className="text-purple-400" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3">
          كيف أقدر أساعدك في متجرك اليوم؟
        </h1>
        <p className="text-muted text-sm md:text-base mb-8 leading-relaxed">
          اسأل عن المبيعات، المخزون، الموظفين، العملاء، أو اطلب اقتراحات ذكية.
        </p>

        <SuggestedPromptChips onSend={onSend} remaining={remaining} />
      </div>
    </div>
  )
}
