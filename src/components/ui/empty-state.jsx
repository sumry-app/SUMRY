import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * A blank screen is where most people decide a tool isn't for them. These are
 * written to tell someone exactly what to do next, in plain language, rather
 * than announcing that there is "No data".
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  onAction,
  secondaryAction,
  onSecondaryAction,
  tone = "primary",
  className,
  children,
}) {
  const toneChip = {
    primary: "bg-primary-soft text-primary-strong",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
  }[tone] ?? "bg-primary-soft text-primary-strong"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-dashed bg-card/60 px-6 py-14 text-center",
        className
      )}
    >
      {/* soft wash so the panel still feels designed rather than unfinished */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-70"
        style={{
          background:
            "radial-gradient(28rem 10rem at 50% 0%, hsl(var(--primary) / 0.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        {Icon && (
          <span className={cn("mb-5 grid size-14 place-items-center rounded-2xl shadow-soft", toneChip)}>
            <Icon className="size-7" strokeWidth={1.9} />
          </span>
        )}

        <h3 className="headline text-xl">{title}</h3>

        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        )}

        {children && <div className="mt-5 w-full">{children}</div>}

        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {action && (
              <Button size="lg" onClick={onAction}>
                {action}
              </Button>
            )}
            {secondaryAction && (
              <Button size="lg" variant="outline" onClick={onSecondaryAction}>
                {secondaryAction}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** Compact inline variant for empty regions inside an already-populated page. */
export function EmptyHint({ icon: Icon, children, className }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-dashed bg-muted/40 px-4 py-3.5 text-sm text-muted-foreground",
        className
      )}
    >
      {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />}
      <span className="leading-relaxed">{children}</span>
    </div>
  )
}
