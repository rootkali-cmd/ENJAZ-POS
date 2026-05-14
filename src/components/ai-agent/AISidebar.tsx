"use client"

import { Bot, MessageSquare, Plus, Search, PanelLeftClose, PanelLeft, Settings, Sparkles, Zap } from "lucide-react"

interface AISidebarProps {
  open: boolean
  onToggle: () => void
  conversations: { id: string; title: string }[]
  currentId?: string
  onSelect: (id: string) => void
  onNew: () => void
  remaining: number
  limit: number
}

export function AISidebar({
  open,
  onToggle,
  conversations,
  currentId,
  onSelect,
  onNew,
  remaining,
  limit,
}: AISidebarProps) {
  return (
    <>
      {!open && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-20 z-40 p-2.5 rounded-xl bg-card border border-border shadow-lg hover:bg-card-hover transition-all"
          aria-label="فتح الشريط الجانبي"
        >
          <PanelLeft size={20} className="text-muted" />
        </button>
      )}

      <aside
        className={`${
          open ? "w-72" : "w-0"
        } transition-all duration-300 border-l border-border bg-card flex flex-col shrink-0 overflow-hidden`}
      >
        <div className={`${open ? "opacity-100" : "opacity-0"} transition-opacity duration-200 min-w-72 flex flex-col h-full`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shadow-sm">
                <Bot size={18} className="text-white" />
              </div>
              <span className="text-sm font-bold">ENJAZ AI</span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-card-hover transition-all"
              aria-label="إغلاق الشريط الجانبي"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>

          {/* New Chat */}
          <div className="px-3 pt-3 shrink-0">
            <button
              onClick={onNew}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-l from-primary to-purple-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={18} />
              محادثة جديدة
            </button>
          </div>

          {/* Search */}
          <div className="px-3 pt-3 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="بحث في المحادثات..."
                className="w-full rounded-xl border border-border bg-card-hover pr-9 px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-3 pt-3 pb-3 space-y-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare size={24} className="mx-auto mb-2 text-muted" />
                <p className="text-xs text-muted">لا توجد محادثات سابقة</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                    currentId === conv.id
                      ? "bg-primary/10 border border-primary/20 text-foreground"
                      : "text-muted hover:bg-card-hover hover:text-foreground border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate text-xs">{conv.title}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Bottom Stats */}
          <div className="border-t border-border p-3 space-y-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <Zap size={14} className="text-amber-500 shrink-0" />
              <div className="flex-1">
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">الرسائل المتبقية</p>
                <p className="text-[10px] text-amber-500/70">{remaining} من {limit} رسائل اليوم</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{remaining}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
