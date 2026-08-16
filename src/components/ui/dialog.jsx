import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const DialogContext = React.createContext({ onOpenChange: () => {} })

/**
 * Lightweight modal. Deliberately handles the things a dialog has to get right
 * and previously didn't: Escape to close, focus moved in and restored on close,
 * focus trapped while open, background scroll locked, and the correct ARIA
 * roles so screen readers announce it as a dialog.
 */
const Dialog = ({ open, onOpenChange, children }) => {
  const panelRef = React.useRef(null)
  const restoreFocusRef = React.useRef(null)

  React.useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement

    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        onOpenChange?.(false)
        return
      }

      if (e.key !== "Tab" || !panelRef.current) return

      const focusables = panelRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusables.length) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown, true)

    // Move focus into the dialog once it has rendered.
    const raf = requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector(
        '[autofocus], input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
      )
      target?.focus()
    })

    return () => {
      document.removeEventListener("keydown", onKeyDown, true)
      document.body.style.overflow = overflow
      cancelAnimationFrame(raf)
      restoreFocusRef.current?.focus?.()
    }
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <DialogContext.Provider value={{ onOpenChange, panelRef }}>
      <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center">
        <div
          className="fixed inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
          onClick={() => onOpenChange?.(false)}
          aria-hidden="true"
        />
        {children}
      </div>
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ children, ...props }) => <div {...props}>{children}</div>

const DialogContent = React.forwardRef(({ className, children, showClose = true, ...props }, ref) => {
  const { onOpenChange, panelRef } = React.useContext(DialogContext)
  const titleId = React.useId()

  return (
    <div
      ref={(node) => {
        if (panelRef) panelRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-dialog-title-id={titleId}
      className={cn(
        "relative z-50 grid w-full max-w-lg animate-scale-in gap-5 rounded-3xl border bg-card p-6 shadow-float",
        "max-h-[90vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {showClose && (
        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          aria-label="Close dialog"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" strokeWidth={2.2} />
        </button>
      )}
      {children}
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-1.5 pr-8 text-left", className)} {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end", className)}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => {
  // Pair the heading with the dialog's aria-labelledby target.
  const [id, setId] = React.useState(undefined)
  const localRef = React.useRef(null)

  React.useEffect(() => {
    const panel = localRef.current?.closest('[role="dialog"]')
    const found = panel?.getAttribute("data-dialog-title-id")
    if (found) setId(found)
  }, [])

  return (
    <h2
      ref={(node) => {
        localRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      id={id}
      className={cn("headline text-xl", className)}
      {...props}
    />
  )
})
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm leading-relaxed text-muted-foreground", className)} {...props} />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
