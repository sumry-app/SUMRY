import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  Calendar,
  User,
  Menu,
  X,
  Plus,
  Settings,
  Bell,
  FileText,
} from "lucide-react"

const DEFAULT_TABS = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'profile', icon: User, label: 'Profile' },
]

const DEFAULT_MENU_ITEMS = [
  { id: 'settings', icon: Settings, label: 'Settings' },
  { id: 'notifications', icon: Bell, label: 'Notifications' },
  { id: 'documents', icon: FileText, label: 'Documents' },
]

const MobileNav = React.forwardRef(({
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  showFAB = true,
  fabIcon: FabIcon = Plus,
  onFabClick,
  fabLabel = "Add",
  showMenu = true,
  menuItems = DEFAULT_MENU_ITEMS,
  onMenuItemClick,
  badges = {},
  className,
  safeAreaInset = true,
  ...props
}, ref) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [fabExpanded, setFabExpanded] = React.useState(false)

  // Close menu when clicking outside
  React.useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = () => setIsMenuOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isMenuOpen])

  const handleTabClick = (tabId) => {
    onTabChange?.(tabId)
  }

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  const handleMenuItemClick = (itemId) => {
    onMenuItemClick?.(itemId)
    setIsMenuOpen(false)
  }

  const handleFabClick = (e) => {
    e.stopPropagation()
    onFabClick?.()
  }

  return (
    <>
      {/* Hamburger Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-background z-50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold">Menu</h2>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto p-4">
                  {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuItemClick(item.id)}
                        className={cn(
                          "flex items-center w-full p-4 rounded-lg",
                          "hover:bg-muted transition-colors",
                          "text-left"
                        )}
                      >
                        <Icon className="w-5 h-5 mr-4" />
                        <span className="font-medium">{item.label}</span>
                        {badges[item.id] && (
                          <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1">
                            {badges[item.id]}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {showFAB && (
        <motion.button
          onClick={handleFabClick}
          onHoverStart={() => setFabExpanded(true)}
          onHoverEnd={() => setFabExpanded(false)}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "fixed right-6 z-30 bg-primary text-primary-foreground",
            "rounded-full shadow-lg hover:shadow-xl transition-shadow",
            "flex items-center justify-center",
            safeAreaInset ? "bottom-24" : "bottom-6"
          )}
          style={{
            width: fabExpanded ? 'auto' : '56px',
            height: '56px',
            paddingLeft: fabExpanded ? '20px' : '0',
            paddingRight: fabExpanded ? '20px' : '0',
          }}
        >
          <FabIcon className="w-6 h-6" />
          <AnimatePresence>
            {fabExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="ml-2 font-medium whitespace-nowrap overflow-hidden"
              >
                {fabLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Bottom Tab Bar */}
      <nav
        ref={ref}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-30",
          "bg-background border-t shadow-lg",
          safeAreaInset && "pb-safe",
          className
        )}
        style={{
          paddingBottom: safeAreaInset ? 'max(env(safe-area-inset-bottom), 0.5rem)' : '0.5rem',
        }}
        {...props}
      >
        <div className="flex items-center justify-around px-2 pt-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const hasBadge = badges[tab.id]

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  "flex flex-col items-center justify-center",
                  "min-w-0 flex-1 relative py-2 px-1",
                  "transition-colors duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                )}
              >
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                  {hasBadge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "absolute -top-1 -right-1",
                        "bg-red-500 text-white",
                        "text-xs rounded-full",
                        "min-w-[18px] h-[18px]",
                        "flex items-center justify-center",
                        "font-bold"
                      )}
                    >
                      {badges[tab.id]}
                    </motion.span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs mt-1 font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}

          {/* Menu Button */}
          {showMenu && (
            <button
              onClick={handleMenuToggle}
              className={cn(
                "flex flex-col items-center justify-center",
                "min-w-0 flex-1 relative py-2 px-1",
                "transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              )}
            >
              <motion.div
                animate={{ rotate: isMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-primary" />
                ) : (
                  <Menu className="w-6 h-6 text-muted-foreground" />
                )}
              </motion.div>
              <span className={cn(
                "text-xs mt-1 font-medium transition-colors",
                isMenuOpen ? "text-primary" : "text-muted-foreground"
              )}>
                Menu
              </span>
            </button>
          )}
        </div>
      </nav>
    </>
  )
})

MobileNav.displayName = "MobileNav"

export { MobileNav, DEFAULT_TABS, DEFAULT_MENU_ITEMS }
