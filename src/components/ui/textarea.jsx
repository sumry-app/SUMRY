import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, invalid, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-[92px] w-full rounded-xl border bg-card px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-soft",
        "transition-all duration-200 ease-spring",
        "placeholder:text-muted-foreground/70",
        "hover:border-primary/30",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60",
        "aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/15",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
