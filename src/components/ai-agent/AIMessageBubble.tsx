"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Bot, Store } from "lucide-react"

interface AIMessageBubbleProps {
  role: "user" | "assistant"
  content: string
  createdAt?: string
}

export function AIMessageBubble({ role, content, createdAt }: AIMessageBubbleProps) {
  return (
    <div className={`flex ${role === "user" ? "justify-start flex-row-reverse" : "justify-start"} items-start gap-3`}>
      {role === "assistant" && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center shrink-0 shadow-sm mt-1">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div
        className={`${
          role === "user"
            ? "bg-primary text-white rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[80%]"
            : "max-w-[85%]"
        }`}
      >
        {role === "assistant" ? (
          <div className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-1 [&_ul]:mt-1 [&_ul]:mb-1 [&_li]:mb-0.5 text-sm leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{content}</p>
        )}
        {createdAt && (
          <p className={`text-[10px] mt-1 ${role === "user" ? "text-white/60" : "text-muted"}`}>
            {new Date(createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>

      {role === "user" && (
        <div className="w-8 h-8 rounded-xl bg-card-hover flex items-center justify-center shrink-0 mt-1 border border-border">
          <Store size={16} className="text-muted" />
        </div>
      )}
    </div>
  )
}
