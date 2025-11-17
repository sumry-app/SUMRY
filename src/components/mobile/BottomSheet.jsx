import * as React from "react"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

const SNAP_POINTS = {
  CLOSED: 0,
  HALF: 0.5,
  FULL: 0.9
}

const BottomSheet = React.forwardRef(({
  isOpen,
  onClose,
  children,
  className,
  title,
  snapPoints = SNAP_POINTS,
  initialSnap = 'HALF',
  showHandle = true,
  showBackdrop = true,
  closeOnBackdrop = true,
  keyboardAware = true,
  ...props
}, ref) => {
  const [currentSnap, setCurrentSnap] = React.useState(initialSnap)
  const [keyboardHeight, setKeyboardHeight] = React.useState(0)
  const sheetRef = React.useRef(null)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, 300], [1, 0])

  // Keyboard awareness for iOS/Android
  React.useEffect(() => {
    if (!keyboardAware || typeof window === 'undefined') return

    const handleResize = () => {
      const visualViewport = window.visualViewport
      if (visualViewport) {
        const keyboardOpen = visualViewport.height < window.innerHeight
        setKeyboardHeight(keyboardOpen ? window.innerHeight - visualViewport.height : 0)
      }
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [keyboardAware])

  const getSnapHeight = (snap) => {
    const height = window.innerHeight
    return height * (1 - snapPoints[snap]) - keyboardHeight
  }

  const handleDragEnd = (event, info) => {
    const velocity = info.velocity.y
    const offset = info.offset.y

    // Close if dragged down significantly
    if (offset > 150 || velocity > 500) {
      onClose?.()
      return
    }

    // Snap to nearest point
    const currentHeight = getSnapHeight(currentSnap)
    const snapKeys = Object.keys(snapPoints).filter(k => k !== 'CLOSED')

    let nearestSnap = currentSnap
    let minDistance = Infinity

    snapKeys.forEach(snap => {
      const snapHeight = getSnapHeight(snap)
      const distance = Math.abs(currentHeight + offset - snapHeight)
      if (distance < minDistance) {
        minDistance = distance
        nearestSnap = snap
      }
    })

    setCurrentSnap(nearestSnap)
  }

  const height = isOpen ? getSnapHeight(currentSnap) : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={closeOnBackdrop ? onClose : undefined}
            />
          )}

          {/* Bottom Sheet */}
          <motion.div
            ref={sheetRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{
              y,
              bottom: -keyboardHeight,
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300
            }}
            className={cn(
              "fixed left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl",
              "flex flex-col",
              className
            )}
            style={{
              height: `${height}px`,
              maxHeight: '90vh',
              touchAction: 'none',
            }}
            {...props}
          >
            {/* Drag Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain"
              style={{
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
              }}
            >
              {children}
            </div>

            {/* Snap Point Indicators (optional) */}
            <div className="absolute right-4 top-20 flex flex-col gap-2">
              {Object.keys(snapPoints).filter(k => k !== 'CLOSED').map(snap => (
                <button
                  key={snap}
                  onClick={() => setCurrentSnap(snap)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    currentSnap === snap
                      ? "bg-primary scale-125"
                      : "bg-muted-foreground/30"
                  )}
                  aria-label={`Snap to ${snap.toLowerCase()}`}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

BottomSheet.displayName = "BottomSheet"

export { BottomSheet, SNAP_POINTS }
