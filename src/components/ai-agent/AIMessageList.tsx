"use client"

import { AIMessageBubble } from "./AIMessageBubble"
import { AITypingIndicator } from "./AITypingIndicator"

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: string
}

interface AIMessageListProps {
  messages: Message[]
  loading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

export function AIMessageList({ messages, loading, messagesEndRef }: AIMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto space-y-5">
        {messages.map((msg) => (
          msg.role !== "system" && (
            <AIMessageBubble
              key={msg.id}
              role={msg.role as "user" | "assistant"}
              content={msg.content}
              createdAt={msg.createdAt}
            />
          )
        ))}

        {loading && <AITypingIndicator />}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
