import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext({})

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
  const [selectedValue, setSelectedValue] = React.useState(value ?? defaultValue)
  const baseId = React.useId()

  const handleValueChange = React.useCallback((newValue) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
  }, [onValueChange])

  React.useEffect(() => {
    if (value !== undefined) setSelectedValue(value)
  }, [value])

  return (
    <TabsContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange, baseId }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

/**
 * Arrow-key roving focus, per the WAI-ARIA tabs pattern. Without this, keyboard
 * users have to tab through every trigger to reach the last panel.
 */
const TabsList = React.forwardRef(({ className, children, ...props }, ref) => {
  const innerRef = React.useRef(null)

  const handleKeyDown = (e) => {
    const keys = ["ArrowRight", "ArrowLeft", "Home", "End"]
    if (!keys.includes(e.key)) return

    const tabs = Array.from(
      innerRef.current?.querySelectorAll('[role="tab"]:not([disabled])') ?? []
    )
    if (!tabs.length) return

    const current = tabs.indexOf(document.activeElement)
    let next = current

    if (e.key === "ArrowRight") next = (current + 1) % tabs.length
    if (e.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length
    if (e.key === "Home") next = 0
    if (e.key === "End") next = tabs.length - 1

    e.preventDefault()
    tabs[next]?.focus()
    tabs[next]?.click()
  }

  return (
    <div
      ref={(node) => {
        innerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border bg-card/80 p-1.5 shadow-soft backdrop-blur-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
  const { value: selectedValue, onValueChange, baseId } = React.useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isSelected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isSelected ? 0 : -1}
      data-state={isSelected ? "active" : "inactive"}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold",
        "transition-all duration-200 ease-spring",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:size-4",
        isSelected
          ? "bg-primary text-primary-foreground shadow-soft"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, ...props }, ref) => {
  const { value: selectedValue, baseId } = React.useContext(TabsContext)
  if (selectedValue !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("mt-2 animate-fade-up focus-visible:outline-none", className)}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
