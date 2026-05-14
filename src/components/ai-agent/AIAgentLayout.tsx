"use client"

import { useState, type ReactNode } from "react"
import { AISidebar } from "./AISidebar"

interface AIAgentLayoutProps {
  children: ReactNode
  conversations: { id: string; title: string }[]
  currentId?: string
  onSelect: (id: string) => void
  onNew: () => void
  remaining: number
  limit: number
}

export function AIAgentLayout({
  children,
  conversations,
  currentId,
  onSelect,
  onNew,
  remaining,
  limit,
}: AIAgentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-full bg-background">
      <AISidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        conversations={conversations}
        currentId={currentId}
        onSelect={onSelect}
        onNew={onNew}
        remaining={remaining}
        limit={limit}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
