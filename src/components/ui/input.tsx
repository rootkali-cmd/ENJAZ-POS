"use client"

import { InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  suffix?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1 opacity-80">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-lg border ${
              error ? "border-danger" : "border-border"
            } bg-input-bg text-sm text-foreground placeholder:text-muted 
            focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-primary transition-all
            ${icon ? "pr-10" : ""}
            ${suffix ? "pl-10" : ""}
            px-4 py-2
            ${className}`}
            {...props}
          />
          {suffix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
    )
  }
)
Input.displayName = "Input"
