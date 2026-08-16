import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold transition-all duration-200 ease-spring",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    // A small press response makes the whole app feel responsive on touch.
    "active:translate-y-px",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-soft hover:bg-primary-strong hover:shadow-glow",
        accent:
          "bg-accent text-accent-foreground shadow-soft hover:brightness-105 hover:shadow-glow-accent",
        success:
          "bg-success text-success-foreground shadow-soft hover:brightness-105",
        destructive:
          "bg-destructive text-destructive-foreground shadow-soft hover:brightness-105",
        outline:
          "border bg-card text-foreground shadow-soft hover:border-primary/40 hover:bg-primary-soft hover:text-primary-strong",
        soft:
          "bg-primary-soft text-primary-strong hover:bg-primary/15",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-muted",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-8 rounded-lg px-2.5 text-xs [&_svg]:size-3.5",
        sm: "h-9 rounded-lg px-3 text-sm [&_svg]:size-4",
        default: "h-10 rounded-xl px-4 text-sm [&_svg]:size-4",
        lg: "h-12 rounded-2xl px-6 text-[0.95rem] [&_svg]:size-[1.125rem]",
        icon: "h-10 w-10 rounded-xl [&_svg]:size-4",
        "icon-sm": "h-8 w-8 rounded-lg [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Spinner = () => (
  <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-90" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2Z" />
  </svg>
)

const Button = React.forwardRef(
  ({ className, variant, size, loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-busy={loading || undefined}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
