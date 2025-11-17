import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for mobile-specific utilities and device detection
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [orientation, setOrientation] = useState('portrait')
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      )
      setIsMobile(mobile)

      // Detect iOS
      const ios = /iphone|ipad|ipod/.test(userAgent.toLowerCase())
      setIsIOS(ios)

      // Detect Android
      const android = /android/.test(userAgent.toLowerCase())
      setIsAndroid(android)

      // Detect standalone mode (PWA)
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      setIsStandalone(standalone)
    }

    // Detect orientation
    const checkOrientation = () => {
      const orientation =
        window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
      setOrientation(orientation)
    }

    // Update screen size
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
      checkOrientation()
    }

    checkMobile()
    checkOrientation()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return {
    isMobile,
    isIOS,
    isAndroid,
    isStandalone,
    orientation,
    screenSize,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  }
}

/**
 * Hook for haptic feedback
 */
export function useHaptic() {
  const triggerHaptic = useCallback((style = 'light') => {
    if (typeof window === 'undefined' || !navigator.vibrate) return

    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [20, 50, 20],
      warning: [15, 40, 15],
    }

    navigator.vibrate(patterns[style] || patterns.light)
  }, [])

  return { triggerHaptic }
}

/**
 * Hook for detecting swipe gestures
 */
export function useSwipe(onSwipe, threshold = 50) {
  const touchStartRef = useRef(null)
  const touchEndRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    touchEndRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) return

    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = Date.now() - touchStartRef.current.time

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Determine swipe direction
    if (absX > threshold || absY > threshold) {
      const direction =
        absX > absY
          ? deltaX > 0
            ? 'right'
            : 'left'
          : deltaY > 0
          ? 'down'
          : 'up'

      const velocity = Math.sqrt(deltaX ** 2 + deltaY ** 2) / deltaTime

      onSwipe?.({
        direction,
        deltaX,
        deltaY,
        velocity,
        distance: Math.sqrt(deltaX ** 2 + deltaY ** 2),
      })
    }

    touchStartRef.current = null
    touchEndRef.current = null
  }, [onSwipe, threshold])

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}

/**
 * Hook for detecting long press
 */
export function useLongPress(callback, duration = 500) {
  const timeoutRef = useRef(null)
  const [isLongPress, setIsLongPress] = useState(false)

  const start = useCallback(() => {
    setIsLongPress(false)
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true)
      callback?.()
    }, duration)
  }, [callback, duration])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLongPress(false)
  }, [])

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    isLongPress,
  }
}

/**
 * Hook for keyboard awareness (mobile keyboard)
 */
export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const handleResize = () => {
      const viewport = window.visualViewport
      if (!viewport) return

      const keyboardOpen = viewport.height < window.innerHeight
      const height = keyboardOpen ? window.innerHeight - viewport.height : 0

      setKeyboardHeight(height)
      setIsKeyboardOpen(keyboardOpen)
    }

    window.visualViewport.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return { keyboardHeight, isKeyboardOpen }
}

/**
 * Hook for safe area insets (iOS notch, home indicator)
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)

    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}

/**
 * Hook for scroll lock (useful for modals on mobile)
 */
export function useScrollLock(locked = false) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const originalOverflow = document.body.style.overflow
    const originalPosition = document.body.style.position

    if (locked) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.position = originalPosition
      document.body.style.width = ''
    }
  }, [locked])
}

/**
 * Hook for detecting network status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [connectionType, setConnectionType] = useState('unknown')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    const updateConnection = () => {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection

      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    updateConnection()

    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection
    connection?.addEventListener('change', updateConnection)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      connection?.removeEventListener('change', updateConnection)
    }
  }, [])

  return { isOnline, connectionType }
}

/**
 * Hook for battery status (if available)
 */
export function useBattery() {
  const [battery, setBattery] = useState({
    level: null,
    charging: null,
    chargingTime: null,
    dischargingTime: null,
  })

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.getBattery) return

    let batteryManager = null

    const updateBattery = (battery) => {
      setBattery({
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      })
    }

    navigator.getBattery().then((battery) => {
      batteryManager = battery
      updateBattery(battery)

      battery.addEventListener('levelchange', () => updateBattery(battery))
      battery.addEventListener('chargingchange', () => updateBattery(battery))
    })

    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener('levelchange', updateBattery)
        batteryManager.removeEventListener('chargingchange', updateBattery)
      }
    }
  }, [])

  return battery
}

/**
 * Hook for device orientation (gyroscope)
 */
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState({
    alpha: null,
    beta: null,
    gamma: null,
    absolute: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
      })
    }

    window.addEventListener('deviceorientation', handleOrientation)
    return () => window.removeEventListener('deviceorientation', handleOrientation)
  }, [])

  return orientation
}

export default useMobile
