import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * `tone` maps to semantic meaning rather than a raw colour, so a bar showing a
 * struggling goal is never accidentally green.
 */
const TONES = {
  primary: "bg-primary",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
}

const Progress = React.forwardRef(
  ({ className, value, max = 100, tone = "primary", label, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, ((Number(value) || 0) / max) * 100))

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className={cn("relative h-2 w-full overflow-hidden rounded-full bg-muted", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-spring",
            TONES[tone] ?? TONES.primary
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
