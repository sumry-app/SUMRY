import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext({})

const Select = ({ value, onValueChange, children, ...props }) => {
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef(null)

  // Items register their display text so the trigger can show a readable label
  // ("All goals") rather than the raw stored value ("all" / a uuid).
  const [labels, setLabels] = React.useState({})
  const registerLabel = React.useCallback((itemValue, label) => {
    if (itemValue == null || !label) return
    setLabels(prev => (prev[itemValue] === label ? prev : { ...prev, [itemValue]: label }))
  }, [])

  // Close on Escape or on a click landing outside the control.
  React.useEffect(() => {
    if (!open) return

    const onKey = (e) => { if (e.key === "Escape") setOpen(false) }
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }

    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onDown)
    }
  }, [open])

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labels, registerLabel }}>
      <div ref={rootRef} className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const { setOpen, open } = React.useContext(SelectContext)

  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="listbox"
      aria-expanded={open}
      className={cn(
        "flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-card px-3.5 py-2 text-sm text-foreground shadow-soft",
        "transition-all duration-200 ease-spring",
        "hover:border-primary/30",
        "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      onClick={() => setOpen(prev => !prev)}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        strokeWidth={2.2}
      />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  const { value, labels } = React.useContext(SelectContext)
  const label = value != null ? labels?.[value] : undefined
  const shown = label ?? (value || "")
  return (
    <span className={cn("truncate", !shown && "text-muted-foreground")}>
      {shown || placeholder}
    </span>
  )
}

const SelectContent = ({ className, children, ...props }) => {
  const { open } = React.useContext(SelectContext)

  // While closed, still mount the items (display:none, so no layout cost and
  // invisible to assistive tech) purely so each one can register its label.
  // Without this the trigger would show the raw value until first open.
  if (!open) {
    return (
      <div className="hidden" aria-hidden="true">
        {children}
      </div>
    )
  }

  return (
    <div
      role="listbox"
      className={cn(
        "absolute z-50 mt-2 max-h-64 w-full animate-scale-in overflow-auto rounded-2xl border bg-popover p-1.5 text-popover-foreground shadow-float",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const SelectItem = React.forwardRef(({ className, children, value, ...props }, ref) => {
  const { onValueChange, setOpen, value: selectedValue, registerLabel } = React.useContext(SelectContext)
  const isSelected = selectedValue === value
  const labelRef = React.useRef(null)

  // Publish this item's text so SelectValue can render it on the trigger, even
  // while the list is closed and this item is unmounted.
  React.useEffect(() => {
    const text = labelRef.current?.textContent?.trim()
    if (text) registerLabel?.(value, text)
  }, [value, children, registerLabel])

  const choose = () => {
    onValueChange?.(value)
    setOpen(false)
  }

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm outline-none",
        "transition-colors duration-150",
        "hover:bg-muted focus-visible:bg-muted",
        isSelected && "bg-primary-soft font-semibold text-primary-strong",
        className
      )}
      onClick={choose}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          choose()
        }
      }}
      {...props}
    >
      <span ref={labelRef} className="truncate">{children}</span>
      {isSelected && <Check className="size-4 shrink-0" strokeWidth={2.4} />}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
