import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Counts up to `value` on mount. Purely decorative, so it snaps straight to the
 * final number when the user prefers reduced motion.
 */
export function AnimatedNumber({ value, duration = 900, decimals = 0, className, suffix = "" }) {
  const target = Number(value) || 0
  const [display, setDisplay] = React.useState(target)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
    if (reduce || duration <= 0) {
      setDisplay(target)
      return
    }

    let frame
    const start = performance.now()
    const from = 0

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      // easeOutExpo - fast start, gentle settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(from + (target - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return (
    <span className={cn("tabular", className)}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/** Minimal inline sparkline - far lighter than pulling a chart library into a tile. */
export function Sparkline({ points = [], className, strokeClassName = "stroke-primary" }) {
  // Must run before any early return - hooks have to be called in the same
  // order on every render.
  const gradId = React.useId()

  const values = points.map(Number).filter(n => Number.isFinite(n))
  if (values.length < 2) return null

  const w = 100
  const h = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const coords = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / span) * (h - 4) - 2
    return [x, y]
  })

  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ")
  const area = `${d} L${w},${h} L0,${h} Z`
  const [lastX, lastY] = coords[coords.length - 1]

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-full overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        className={strokeClassName}
      />
      <circle cx={lastX} cy={lastY} r="2.5" className="fill-current" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const TONE_STYLES = {
  primary: { wrap: "text-primary", chip: "bg-primary-soft text-primary-strong" },
  accent:  { wrap: "text-accent",  chip: "bg-accent-soft text-accent" },
  success: { wrap: "text-success", chip: "bg-success-soft text-success" },
  info:    { wrap: "text-info",    chip: "bg-info-soft text-info" },
  warning: { wrap: "text-warning", chip: "bg-warning-soft text-warning-foreground" },
}

export function StatCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  hint,
  icon: Icon,
  tone = "primary",
  trend,
  spark,
  className,
  style,
}) {
  const t = TONE_STYLES[tone] ?? TONE_STYLES.primary
  const trendUp = typeof trend === "number" && trend > 0
  const trendDown = typeof trend === "number" && trend < 0

  return (
    <div
      style={style}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-card",
        "transition-all duration-300 ease-spring hover:-translate-y-1 hover:shadow-lifted",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="eyebrow">{label}</span>
        {Icon && (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", t.chip)}>
            <Icon className="size-4" strokeWidth={2.2} />
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-semibold leading-none text-foreground">
          <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
        </span>
        {typeof trend === "number" && trend !== 0 && (
          <span
            className={cn(
              "chip border-transparent px-1.5 py-0.5 text-2xs tracking-normal",
              trendUp && "bg-success-soft text-success",
              trendDown && "bg-destructive-soft text-destructive"
            )}
          >
            {trendUp ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {hint && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</p>}

      {spark?.length > 1 && (
        <div className={cn("mt-3 -mb-1", t.wrap)}>
          <Sparkline points={spark} strokeClassName="stroke-current" />
        </div>
      )}
    </div>
  )
}

/** Circular progress. Used for the headline "on track" figure. */
export function ProgressRing({ value = 0, size = 116, stroke = 10, tone = "primary", label, sublabel }) {
  const pct = Math.min(100, Math.max(0, Number(value) || 0))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const t = TONE_STYLES[tone] ?? TONE_STYLES.primary

  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-spring", t.wrap, "stroke-current")}
        />
      </svg>
      <div className="absolute grid place-items-center text-center">
        <span className="font-display text-2xl font-semibold leading-none text-foreground">
          <AnimatedNumber value={pct} suffix="%" />
        </span>
        {label && <span className="mt-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>}
        {sublabel && <span className="text-2xs text-muted-foreground">{sublabel}</span>}
      </div>
    </div>
  )
}
