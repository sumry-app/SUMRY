import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X, Filter, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const FilterChip = ({ label, value, isActive, onChange, count }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => onChange(!isActive)}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full",
        "border-2 transition-all duration-200",
        "text-sm font-medium whitespace-nowrap",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-md"
          : "bg-background text-foreground border-border hover:border-primary/50"
      )}
    >
      {isActive && <Check className="w-4 h-4" />}
      <span>{label}</span>
      {count !== undefined && (
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          isActive
            ? "bg-primary-foreground/20"
            : "bg-muted"
        )}>
          {count}
        </span>
      )}
    </motion.button>
  )
}

const FilterGroup = ({ title, children, collapsible = false, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded)

  return (
    <div className="mb-6">
      {collapsible ? (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full mb-3 group"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </h3>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.div>
        </button>
      ) : (
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          {title}
        </h3>
      )}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const MobileFilters = React.forwardRef(({
  isOpen,
  onClose,
  filters = {},
  onFiltersChange,
  onApply,
  onReset,
  className,
  title = "Filters",
  showActiveCount = true,
  position = "right", // "left" or "right"
  ...props
}, ref) => {
  const [localFilters, setLocalFilters] = React.useState(filters)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Update local filters when prop changes
  React.useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Calculate active filter count
  const activeCount = React.useMemo(() => {
    let count = 0
    Object.values(localFilters).forEach(group => {
      if (Array.isArray(group)) {
        count += group.length
      } else if (typeof group === 'object') {
        Object.values(group).forEach(values => {
          if (Array.isArray(values)) {
            count += values.length
          }
        })
      }
    })
    return count
  }, [localFilters])

  const handleFilterChange = (groupKey, itemValue, isActive) => {
    setLocalFilters(prev => {
      const group = prev[groupKey] || []
      const newGroup = isActive
        ? [...group, itemValue]
        : group.filter(v => v !== itemValue)

      const newFilters = {
        ...prev,
        [groupKey]: newGroup,
      }

      setHasChanges(true)
      onFiltersChange?.(newFilters)
      return newFilters
    })
  }

  const handleApply = () => {
    onApply?.(localFilters)
    setHasChanges(false)
    onClose?.()
  }

  const handleReset = () => {
    const resetFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = []
      return acc
    }, {})

    setLocalFilters(resetFilters)
    onFiltersChange?.(resetFilters)
    onReset?.()
    setHasChanges(true)
  }

  const handleClose = () => {
    // Revert to original filters if not applied
    if (hasChanges) {
      setLocalFilters(filters)
      setHasChanges(false)
    }
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black z-40"
            onClick={handleClose}
          />

          {/* Filter Panel */}
          <motion.div
            ref={ref}
            initial={{ x: position === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: position === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 bottom-0 z-50 bg-background shadow-2xl",
              "flex flex-col w-full max-w-md",
              position === 'right' ? 'right-0' : 'left-0',
              className
            )}
            {...props}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">{title}</h2>
                {showActiveCount && activeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1"
                  >
                    {activeCount}
                  </motion.span>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div
              className="flex-1 overflow-y-auto p-4"
              style={{
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Example Filter Groups - Can be customized via children */}
              {props.children || (
                <>
                  <FilterGroup title="Status">
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        label="Active"
                        value="active"
                        isActive={localFilters.status?.includes('active')}
                        onChange={(isActive) => handleFilterChange('status', 'active', isActive)}
                        count={12}
                      />
                      <FilterChip
                        label="In Progress"
                        value="in-progress"
                        isActive={localFilters.status?.includes('in-progress')}
                        onChange={(isActive) => handleFilterChange('status', 'in-progress', isActive)}
                        count={8}
                      />
                      <FilterChip
                        label="Completed"
                        value="completed"
                        isActive={localFilters.status?.includes('completed')}
                        onChange={(isActive) => handleFilterChange('status', 'completed', isActive)}
                        count={45}
                      />
                      <FilterChip
                        label="On Hold"
                        value="on-hold"
                        isActive={localFilters.status?.includes('on-hold')}
                        onChange={(isActive) => handleFilterChange('status', 'on-hold', isActive)}
                        count={3}
                      />
                    </div>
                  </FilterGroup>

                  <FilterGroup title="Priority" collapsible defaultExpanded={false}>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        label="High"
                        value="high"
                        isActive={localFilters.priority?.includes('high')}
                        onChange={(isActive) => handleFilterChange('priority', 'high', isActive)}
                      />
                      <FilterChip
                        label="Medium"
                        value="medium"
                        isActive={localFilters.priority?.includes('medium')}
                        onChange={(isActive) => handleFilterChange('priority', 'medium', isActive)}
                      />
                      <FilterChip
                        label="Low"
                        value="low"
                        isActive={localFilters.priority?.includes('low')}
                        onChange={(isActive) => handleFilterChange('priority', 'low', isActive)}
                      />
                    </div>
                  </FilterGroup>

                  <FilterGroup title="Category" collapsible defaultExpanded={false}>
                    <div className="flex flex-wrap gap-2">
                      <FilterChip
                        label="Academic"
                        value="academic"
                        isActive={localFilters.category?.includes('academic')}
                        onChange={(isActive) => handleFilterChange('category', 'academic', isActive)}
                      />
                      <FilterChip
                        label="Behavioral"
                        value="behavioral"
                        isActive={localFilters.category?.includes('behavioral')}
                        onChange={(isActive) => handleFilterChange('category', 'behavioral', isActive)}
                      />
                      <FilterChip
                        label="Social"
                        value="social"
                        isActive={localFilters.category?.includes('social')}
                        onChange={(isActive) => handleFilterChange('category', 'social', isActive)}
                      />
                    </div>
                  </FilterGroup>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t bg-muted/30 space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleApply}
                  className="flex-1 h-12 text-base font-semibold"
                  disabled={!hasChanges}
                >
                  Apply Filters
                  {activeCount > 0 && ` (${activeCount})`}
                </Button>
              </div>
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full h-11 text-base"
                disabled={activeCount === 0}
              >
                Reset All
              </Button>
            </div>

            {/* Safe Area Padding for iOS */}
            <div
              className="bg-muted/30"
              style={{
                paddingBottom: 'env(safe-area-inset-bottom)',
              }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

MobileFilters.displayName = "MobileFilters"

export { MobileFilters, FilterChip, FilterGroup }
