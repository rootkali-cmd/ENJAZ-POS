"use client"

import { SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1 opacity-80">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-lg border ${
            error ? "border-danger" : "border-border"
          } bg-input-bg px-4 py-2 text-sm text-foreground
          focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-primary transition-all
          ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    )
  }
)
Select.displayName = "Select"
