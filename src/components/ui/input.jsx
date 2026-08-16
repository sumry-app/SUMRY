import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, invalid, ...props }, ref) => {
  return (
    <input
      type={type}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-11 w-full rounded-xl border bg-card px-3.5 py-2 text-sm text-foreground shadow-soft",
        "transition-all duration-200 ease-spring",
        "placeholder:text-muted-foreground/70",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
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
Input.displayName = "Input"

export { Input }
