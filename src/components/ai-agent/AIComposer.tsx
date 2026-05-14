"use client"

import { useState, useRef } from "react"
import { Send, Plus, Zap } from "lucide-react"

interface AIComposerProps {
  onSend: (msg: string) => void
  loading: boolean
  remaining: number
  disabled?: boolean
}

export function AIComposer({ onSend, loading, remaining, disabled }: AIComposerProps) {
  const [input, setInput] = useState("")
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading || disabled) return
    onSend(text)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border bg-card shrink-0">
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-end gap-2">
          <button
            className="h-12 w-12 rounded-xl border border-border bg-card-hover flex items-center justify-center text-muted hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all shrink-0"
            aria-label="إرفاق ملف"
            title="قريباً"
          >
            <Plus size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل ENJAZ AI عن متجرك..."
              disabled={disabled || loading}
              rows={1}
              className="w-full rounded-2xl border border-border bg-card-hover px-5 py-3 text-sm text-foreground placeholder:text-muted resize-none
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-input-bg
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ minHeight: "48px", maxHeight: "120px" }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = "48px"
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || disabled}
            className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            aria-label="إرسال"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-[10px] text-muted">
            <Zap size={12} />
            <span>ENJAZ Thinking · {remaining} رسائل متبقية</span>
          </div>
          <button className="text-[10px] text-muted hover:text-primary transition-colors">
            تفريغ المحادثة
          </button>
        </div>
      </div>
    </div>
  )
}
