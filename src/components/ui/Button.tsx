"use client"

import { type ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary-600 text-white hover:bg-primary-700",
        variant === "secondary" && "border border-border bg-background text-foreground hover:bg-background-subtle",
        variant === "ghost" && "text-foreground hover:bg-background-subtle",
        variant === "danger" && "bg-danger text-white hover:opacity-90",
        size === "sm" && "h-8 rounded-sm px-3 text-sm",
        size === "md" && "h-10 rounded-md px-4 text-sm",
        size === "lg" && "h-12 rounded-lg px-6 text-base",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
