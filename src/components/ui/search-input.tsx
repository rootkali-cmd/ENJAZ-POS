"use client"

import { Search, X } from "lucide-react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = "بحث..." }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border bg-input-bg pr-10 pl-10 py-2 text-sm text-foreground placeholder:text-muted
          focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-primary transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
