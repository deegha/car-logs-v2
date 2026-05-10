import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "secondary"

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-secondary-100 text-secondary-800",
        variant === "primary" && "bg-primary-100 text-primary-800",
        variant === "success" && "bg-green-100 text-green-800",
        variant === "warning" && "bg-yellow-100 text-yellow-800",
        variant === "danger" && "bg-red-100 text-red-800",
        variant === "secondary" && "bg-secondary-100 text-secondary-700",
        className,
      )}
    >
      {children}
    </span>
  )
}
