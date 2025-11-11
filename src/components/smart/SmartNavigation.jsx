import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  FileText,
  Settings,
  Zap,
  GraduationCap,
  Shield,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Command
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { designTokens } from '@/design/tokens';

/**
 * SmartNavigation - Apple/Claude-inspired sidebar navigation
 *
 * Features:
 * - Beautiful animations and transitions
 * - Collapsible for power users
 * - Smart notification badges
 * - Keyboard shortcuts
 * - Context-aware highlighting
 * - Responsive design
 */
export default function SmartNavigation({
  currentTab,
  onTabChange,
  userRole = 'teacher',
  notifications = {},
  isCollapsed: externalCollapsed,
  onCollapsedChange
}) {
  const [isCollapsed, setIsCollapsed] = useState(externalCollapsed ?? false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Sync with external state if provided
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setIsCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        shortcut: '⌘1',
        roles: ['teacher', 'admin', 'para', 'parent']
      },
      {
        id: 'students',
        label: 'Students',
        icon: Users,
        shortcut: '⌘2',
        roles: ['teacher', 'admin', 'para'],
        notificationKey: 'students'
      },
      {
        id: 'goals',
        label: 'Goals',
        icon: Target,
        shortcut: '⌘3',
        roles: ['teacher', 'admin', 'para']
      },
      {
        id: 'progress',
        label: 'Progress',
        icon: TrendingUp,
        shortcut: '⌘4',
        roles: ['teacher', 'admin', 'para'],
        notificationKey: 'progress'
      }
    ];

    const roleSpecific = {
      para: [
        {
          id: 'my-work',
          label: 'My Work',
          icon: Zap,
          shortcut: '⌘W',
          highlight: true,
          notificationKey: 'myWork'
        }
      ],
      teacher: [
        {
          id: 'reports',
          label: 'Reports',
          icon: FileText,
          shortcut: '⌘R'
        },
        {
          id: 'caseload',
          label: 'Caseload',
          icon: GraduationCap,
          shortcut: '⌘C',
          notificationKey: 'caseload'
        }
      ],
      admin: [
        {
          id: 'analytics',
          label: 'Analytics',
          icon: TrendingUp,
          shortcut: '⌘A'
        },
        {
          id: 'compliance',
          label: 'Compliance',
          icon: Shield,
          shortcut: '⌘M',
          notificationKey: 'compliance'
        }
      ]
    };

    const bottomItems = [
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        shortcut: '⌘,',
        roles: ['teacher', 'admin', 'para', 'parent'],
        section: 'bottom'
      }
    ];

    return [
      ...baseItems.filter(item => item.roles.includes(userRole)),
      ...(roleSpecific[userRole] || []),
      ...bottomItems.filter(item => item.roles.includes(userRole))
    ];
  };

  const navigationItems = getNavigationItems();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey) {
        const item = navigationItems.find(item => {
          const shortcut = item.shortcut?.replace('⌘', '').toLowerCase();
          return shortcut === e.key.toLowerCase();
        });

        if (item) {
          e.preventDefault();
          onTabChange(item.id);
        }

        // Toggle collapse with Cmd+B
        if (e.key === 'b') {
          e.preventDefault();
          handleCollapse();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationItems, onTabChange]);

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    const notificationCount = notifications[item.notificationKey] || 0;
    const isHovered = hoveredItem === item.id;

    return (
      <motion.button
        onClick={() => onTabChange(item.id)}
        onHoverStart={() => setHoveredItem(item.id)}
        onHoverEnd={() => setHoveredItem(null)}
        className={`
          relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          transition-all duration-200 group
          ${isActive
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'text-gray-700 hover:bg-gray-100'
          }
          ${item.highlight && !isActive ? 'bg-purple-50 hover:bg-purple-100' : ''}
        `}
        whileHover={{ x: isCollapsed ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        )}

        {/* Icon */}
        <div className={`
          flex-shrink-0 relative
          ${isActive ? 'text-white' : item.highlight ? 'text-purple-600' : 'text-gray-600'}
        `}>
          <Icon className={`w-5 h-5 transition-transform ${isHovered ? 'scale-110' : ''}`} />

          {/* Notification badge */}
          {notificationCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-[10px] text-white font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            </motion.div>
          )}
        </div>

        {/* Label and shortcut */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex items-center justify-between overflow-hidden"
            >
              <span className={`
                text-sm font-medium whitespace-nowrap
                ${isActive ? 'text-white' : ''}
              `}>
                {item.label}
              </span>

              {item.shortcut && (
                <kbd className={`
                  hidden lg:block px-1.5 py-0.5 text-xs rounded
                  ${isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                  }
                `}>
                  {item.shortcut}
                </kbd>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip for collapsed state */}
        {isCollapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-50"
          >
            {item.label}
            {item.shortcut && (
              <span className="ml-2 text-gray-400">{item.shortcut}</span>
            )}
          </motion.div>
        )}
      </motion.button>
    );
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative h-screen bg-white border-r border-gray-200 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">SUMRY</h1>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 space-y-2"
        >
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
            <Command className="w-4 h-4" />
            <span className="text-sm font-medium">Command Palette</span>
            <kbd className="ml-auto text-xs bg-white px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </motion.div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems
          .filter(item => item.section !== 'bottom')
          .map(item => (
            <NavItem key={item.id} item={item} />
          ))}
      </nav>

      {/* Bottom Items */}
      <div className="px-3 py-4 space-y-1 border-t border-gray-200">
        {navigationItems
          .filter(item => item.section === 'bottom')
          .map(item => (
            <NavItem key={item.id} item={item} />
          ))}
      </div>

      {/* Collapse Toggle */}
      <motion.button
        onClick={handleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-gray-600" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-gray-600" />
        )}
      </motion.button>
    </motion.div>
  );
}

// Hook to manage navigation state
export function useSmartNavigation(defaultTab = 'dashboard') {
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState({});

  const updateNotifications = (key, count) => {
    setNotifications(prev => ({
      ...prev,
      [key]: count
    }));
  };

  const clearNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: 0
    }));
  };

  return {
    currentTab,
    setCurrentTab,
    isCollapsed,
    setIsCollapsed,
    notifications,
    updateNotifications,
    clearNotification
  };
}
