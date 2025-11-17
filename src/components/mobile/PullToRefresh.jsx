import * as React from "react"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"
import { RefreshCw, Check, X } from "lucide-react"

const STATUS = {
  IDLE: 'idle',
  PULLING: 'pulling',
  READY: 'ready',
  REFRESHING: 'refreshing',
  SUCCESS: 'success',
  ERROR: 'error',
}

const PullToRefresh = React.forwardRef(({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
  className,
  refreshingText = "Refreshing...",
  pullText = "Pull to refresh",
  readyText = "Release to refresh",
  successText = "Updated!",
  errorText = "Failed to refresh",
  hapticFeedback = true,
  showFeedback = true,
  feedbackDuration = 1500,
  ...props
}, ref) => {
  const [status, setStatus] = React.useState(STATUS.IDLE)
  const [isScrollable, setIsScrollable] = React.useState(true)
  const containerRef = React.useRef(null)
  const y = useMotionValue(0)

  // Transform for pull distance
  const pullDistance = useTransform(y, [0, maxPull], [0, maxPull])
  const iconRotation = useTransform(y, [0, threshold, maxPull], [0, 180, 360])
  const iconScale = useTransform(y, [0, threshold], [0.5, 1])
  const opacity = useTransform(y, [0, threshold], [0, 1])

  // Haptic feedback
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

  // Check if container is at top
  const isAtTop = () => {
    if (!containerRef.current) return false
    return containerRef.current.scrollTop <= 0
  }

  // Handle touch start
  const handleTouchStart = () => {
    setIsScrollable(isAtTop())
  }

  // Handle drag
  const handleDrag = (event, info) => {
    if (!isScrollable || status === STATUS.REFRESHING) return

    const currentY = info.offset.y

    if (currentY > 0) {
      if (currentY >= threshold && status !== STATUS.READY) {
        setStatus(STATUS.READY)
        triggerHaptic('medium')
      } else if (currentY < threshold && status === STATUS.READY) {
        setStatus(STATUS.PULLING)
      }
    }
  }

  // Handle drag end
  const handleDragEnd = async (event, info) => {
    if (!isScrollable || status === STATUS.REFRESHING) return

    const currentY = info.offset.y

    if (currentY >= threshold) {
      // Trigger refresh
      setStatus(STATUS.REFRESHING)
      triggerHaptic('heavy')

      // Snap to threshold position
      animate(y, threshold, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      })

      try {
        await onRefresh?.()

        if (showFeedback) {
          setStatus(STATUS.SUCCESS)
          triggerHaptic('medium')

          setTimeout(() => {
            animate(y, 0, { duration: 0.3 })
            setTimeout(() => setStatus(STATUS.IDLE), 300)
          }, feedbackDuration)
        } else {
          animate(y, 0, { duration: 0.3 })
          setTimeout(() => setStatus(STATUS.IDLE), 300)
        }
      } catch (error) {
        console.error('Refresh error:', error)

        if (showFeedback) {
          setStatus(STATUS.ERROR)
          triggerHaptic('heavy')

          setTimeout(() => {
            animate(y, 0, { duration: 0.3 })
            setTimeout(() => setStatus(STATUS.IDLE), 300)
          }, feedbackDuration)
        } else {
          animate(y, 0, { duration: 0.3 })
          setTimeout(() => setStatus(STATUS.IDLE), 300)
        }
      }
    } else {
      // Reset
      animate(y, 0, { duration: 0.3 })
      setStatus(STATUS.IDLE)
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case STATUS.SUCCESS:
        return <Check className="w-5 h-5 text-green-500" />
      case STATUS.ERROR:
        return <X className="w-5 h-5 text-red-500" />
      case STATUS.REFRESHING:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        )
      default:
        return (
          <motion.div style={{ rotate: iconRotation }}>
            <RefreshCw className="w-5 h-5" />
          </motion.div>
        )
    }
  }

  const getStatusText = () => {
    switch (status) {
      case STATUS.PULLING:
        return pullText
      case STATUS.READY:
        return readyText
      case STATUS.REFRESHING:
        return refreshingText
      case STATUS.SUCCESS:
        return successText
      case STATUS.ERROR:
        return errorText
      default:
        return pullText
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full overflow-y-auto", className)}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehaviorY: 'contain',
      }}
      {...props}
    >
      {/* Pull Indicator */}
      <motion.div
        style={{
          y: pullDistance,
          opacity,
        }}
        className={cn(
          "absolute top-0 left-0 right-0 -mt-20",
          "flex flex-col items-center justify-center",
          "h-20 z-10"
        )}
      >
        <motion.div
          style={{ scale: iconScale }}
          className={cn(
            "flex items-center justify-center mb-2",
            "w-10 h-10 rounded-full",
            status === STATUS.SUCCESS && "bg-green-100",
            status === STATUS.ERROR && "bg-red-100",
            (status === STATUS.PULLING || status === STATUS.READY) && "bg-muted",
            status === STATUS.REFRESHING && "bg-primary/10"
          )}
        >
          {getStatusIcon()}
        </motion.div>
        <motion.p
          style={{ opacity }}
          className="text-sm text-muted-foreground font-medium"
        >
          {getStatusText()}
        </motion.p>
      </motion.div>

      {/* Draggable Container */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onTouchStart={handleTouchStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        className="min-h-full"
      >
        {children}
      </motion.div>

      {/* Progress Bar (optional) */}
      {status === STATUS.REFRESHING && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="fixed top-0 left-0 right-0 h-1 bg-primary z-50 origin-left"
        />
      )}
    </div>
  )
})

PullToRefresh.displayName = "PullToRefresh"

export { PullToRefresh, STATUS }
