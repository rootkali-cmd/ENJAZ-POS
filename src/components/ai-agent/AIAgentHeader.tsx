"use client"

import { RefreshCw, Shield, Clock, Bot } from "lucide-react"

interface AIAgentHeaderProps {
  onRefresh: () => void
  refreshing: boolean
  lastUpdated: string | null
}

export function AIAgentHeader({ onRefresh, refreshing, lastUpdated }: AIAgentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <Bot size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold">ENJAZ AI Agent</h1>
          <p className="text-[11px] text-white/50 max-w-md">
            رؤى تشغيلية ذكية مبنية على بيانات متجرك لمساعدتك في اتخاذ قرارات أسرع.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-violet-300 bg-violet-500/5 border border-violet-500/10 rounded-full px-3 py-1.5">
          <Shield size={12} />
          متصل بمتجرك فقط
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Clock size={12} />
            آخر تحديث: {lastUpdated}
          </div>
        )}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white text-xs font-medium hover:bg-violet-600 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          تحديث الرؤى
        </button>
      </div>
    </div>
  )
}
