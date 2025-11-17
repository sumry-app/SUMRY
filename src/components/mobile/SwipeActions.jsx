import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"
import { Trash2, Edit, Archive, MoreHorizontal } from "lucide-react"

const ACTION_PRESETS = {
  delete: {
    icon: Trash2,
    label: 'Delete',
    color: 'bg-red-500',
    textColor: 'text-white',
    threshold: 80,
  },
  edit: {
    icon: Edit,
    label: 'Edit',
    color: 'bg-blue-500',
    textColor: 'text-white',
    threshold: 60,
  },
  archive: {
    icon: Archive,
    label: 'Archive',
    color: 'bg-orange-500',
    textColor: 'text-white',
    threshold: 60,
  },
  more: {
    icon: MoreHorizontal,
    label: 'More',
    color: 'bg-gray-500',
    textColor: 'text-white',
    threshold: 60,
  },
}

const SwipeActions = React.forwardRef(({
  children,
  leftActions = [],
  rightActions = ['delete'],
  onAction,
  className,
  autoReset = true,
  resetDelay = 300,
  hapticFeedback = true,
  ...props
}, ref) => {
  const [isRevealing, setIsRevealing] = React.useState(false)
  const [currentAction, setCurrentAction] = React.useState(null)
  const x = useMotionValue(0)
  const containerRef = React.useRef(null)

  // Convert action names to full action objects
  const getActions = (actionList, direction) => {
    return actionList.map(action => {
      if (typeof action === 'string') {
        return { ...ACTION_PRESETS[action], id: action, direction }
      }
      return { ...action, direction }
    })
  }

  const leftActionsData = getActions(leftActions, 'left')
  const rightActionsData = getActions(rightActions, 'right')

  // Calculate action zones for visual feedback
  const leftActionWidth = leftActionsData.length * 80
  const rightActionWidth = rightActionsData.length * 80

  // Transform for action button reveals
  const leftReveal = useTransform(x, [0, leftActionWidth], [0, 1])
  const rightReveal = useTransform(x, [-rightActionWidth, 0], [1, 0])

  // Haptic feedback (iOS)
  const triggerHaptic = (style = 'light') => {
    if (!hapticFeedback || typeof window === 'undefined') return
    if (window.navigator?.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
      }
      window.navigator.vibrate(patterns[style] || patterns.light)
    }
  }

  const handleDragEnd = (event, info) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Determine if we've crossed the threshold
    let triggeredAction = null

    if (offset > 0 && leftActionsData.length > 0) {
      // Swiping right (left actions)
      const actionIndex = Math.min(
        Math.floor(offset / 80),
        leftActionsData.length - 1
      )
      const action = leftActionsData[actionIndex]
      if (offset > action.threshold) {
        triggeredAction = action
      }
    } else if (offset < 0 && rightActionsData.length > 0) {
      // Swiping left (right actions)
      const actionIndex = Math.min(
        Math.floor(Math.abs(offset) / 80),
        rightActionsData.length - 1
      )
      const action = rightActionsData[actionIndex]
      if (Math.abs(offset) > action.threshold) {
        triggeredAction = action
      }
    }

    if (triggeredAction) {
      // Trigger action
      setCurrentAction(triggeredAction)
      triggerHaptic('medium')
      onAction?.(triggeredAction.id || triggeredAction.label)

      if (autoReset) {
        setTimeout(() => {
          animate(x, 0, { duration: 0.3 })
          setIsRevealing(false)
          setCurrentAction(null)
        }, resetDelay)
      }
    } else {
      // Reset to original position
      animate(x, 0, { duration: 0.3 })
      setIsRevealing(false)
    }
  }

  const handleDrag = (event, info) => {
    const offset = info.offset.x
    setIsRevealing(Math.abs(offset) > 20)

    // Light haptic at threshold points
    if (Math.abs(offset) > 60 && Math.abs(offset) < 65) {
      triggerHaptic('light')
    }
  }

  const renderActions = (actions, side) => {
    if (actions.length === 0) return null

    return (
      <div
        className={cn(
          "absolute top-0 bottom-0 flex items-stretch",
          side === 'left' ? 'left-0' : 'right-0'
        )}
      >
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.id || index}
              className={cn(
                "flex flex-col items-center justify-center w-20",
                "transition-all duration-200",
                action.color,
                action.textColor,
                currentAction?.id === action.id && "scale-110"
              )}
              style={{
                opacity: side === 'left' ? leftReveal : rightReveal,
              }}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{action.label}</span>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {/* Left Actions Background */}
      {renderActions(leftActionsData, 'left')}

      {/* Right Actions Background */}
      {renderActions(rightActionsData, 'right')}

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: -rightActionWidth,
          right: leftActionWidth,
        }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative bg-background",
          "cursor-grab active:cursor-grabbing",
          "touch-pan-y", // Allow vertical scrolling
          isRevealing && "shadow-lg"
        )}
      >
        {children}
      </motion.div>

      {/* Visual Feedback Indicators */}
      {isRevealing && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={cn(
            "absolute inset-y-0 w-1 transition-opacity",
            "bg-gradient-to-r from-transparent",
            x.get() > 0 ? "left-0 to-blue-500 opacity-50" : "right-0 from-blue-500 opacity-0"
          )} />
          <div className={cn(
            "absolute inset-y-0 w-1 transition-opacity",
            "bg-gradient-to-l from-transparent",
            x.get() < 0 ? "right-0 to-red-500 opacity-50" : "left-0 from-red-500 opacity-0"
          )} />
        </div>
      )}
    </div>
  )
})

SwipeActions.displayName = "SwipeActions"

export { SwipeActions, ACTION_PRESETS }
