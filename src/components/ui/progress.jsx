import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-teal-600 transition-all duration-300 ease-out"
      style={{ transform: `translateX(-${100 - ((value || 0) / max) * 100}%)` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
