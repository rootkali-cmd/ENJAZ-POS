"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark disabled:bg-primary/50 shadow-sm hover:shadow-md",
  secondary: "bg-secondary text-white hover:bg-amber-600 disabled:bg-secondary/50 shadow-sm",
  danger: "bg-danger text-white hover:bg-red-600 disabled:bg-danger/50 shadow-sm",
  ghost: "bg-transparent hover:bg-card-hover text-foreground",
  outline: "border border-border bg-surface hover:bg-card-hover text-foreground",
}

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all 
          ${variants[variant]} ${sizes[size]} 
          disabled:cursor-not-allowed disabled:opacity-60
          ${className}`}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
