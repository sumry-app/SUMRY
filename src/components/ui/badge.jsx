import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors [&_svg]:size-3",
  {
    variants: {
      variant: {
        // Tinted "soft" badges read as status; solid fills read as actions, so
        // status badges default to soft.
        default: "border-primary/20 bg-primary-soft text-primary-strong",
        solid: "border-transparent bg-primary text-primary-foreground",
        accent: "border-accent/25 bg-accent-soft text-accent",
        success: "border-success/25 bg-success-soft text-success",
        warning: "border-warning/30 bg-warning-soft text-warning-foreground",
        destructive: "border-destructive/25 bg-destructive-soft text-destructive",
        info: "border-info/25 bg-info-soft text-info",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
