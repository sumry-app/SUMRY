import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  Info,
  AlertTriangle,
  AlertCircle,
  AtSign,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  Award,
  MessageSquare,
  AlertOctagon,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

/**
 * Get icon component for notification type
 */
const getNotificationIcon = (type) => {
  const iconMap = {
    success: CheckCircle,
    info: Info,
    warning: AlertTriangle,
    alert: AlertOctagon,
    mention: AtSign,
    goal: TrendingUp,
    student: Users,
    progress: BarChart3,
    deadline: Calendar,
    achievement: Award,
    comment: MessageSquare,
    data_gap: AlertCircle
  };

  return iconMap[type] || Info;
};

/**
 * Get color classes for notification type
 */
const getNotificationColors = (type, read) => {
  const baseOpacity = read ? 'opacity-60' : 'opacity-100';

  const colorMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100'
    },
    alert: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    mention: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-100'
    },
    goal: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-100'
    },
    student: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      icon: 'text-sky-600',
      iconBg: 'bg-sky-100'
    },
    progress: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      icon: 'text-teal-600',
      iconBg: 'bg-teal-100'
    },
    deadline: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-100'
    },
    achievement: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      iconBg: 'bg-yellow-100'
    },
    comment: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      icon: 'text-slate-600',
      iconBg: 'bg-slate-100'
    },
    data_gap: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      icon: 'text-rose-600',
      iconBg: 'bg-rose-100'
    }
  };

  return colorMap[type] || colorMap.info;
};

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (timestamp) => {
  try {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) === 1 ? '' : 's'} ago`;

    return date.toLocaleDateString();
  } catch {
    return 'Unknown';
  }
};

/**
 * NotificationItem Component
 * Displays a single notification with icon, content, actions, and expandable details
 */
export default function NotificationItem({
  notification,
  onMarkRead,
  onMarkUnread,
  onDelete,
  onDismiss,
  onClick,
  showActions = true
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const Icon = getNotificationIcon(notification.type);
  const colors = getNotificationColors(notification.type, notification.read);
  const hasMetadata = notification.metadata && Object.keys(notification.metadata).length > 0;
  const hasActionUrl = !!notification.actionUrl;

  // Swipe to dismiss on mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      if (onDismiss) {
        onDismiss(notification.id);
      }
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
    if (!notification.read && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-200',
        colors.bg,
        colors.border,
        notification.read ? 'bg-opacity-40' : 'bg-opacity-100',
        onClick && 'cursor-pointer hover:shadow-md',
        'touch-pan-y'
      )}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />
      )}

      <div className="p-4 pl-5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm',
              colors.iconBg
            )}
          >
            <Icon className={cn('h-5 w-5', colors.icon)} strokeWidth={2} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                {notification.title && (
                  <h4 className="text-sm font-semibold text-slate-900 mb-0.5">
                    {notification.title}
                  </h4>
                )}
                {notification.message && (
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {notification.message}
                  </p>
                )}
              </div>

              {/* Close button */}
              {showActions && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(notification.id);
                  }}
                  className="flex-shrink-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </Button>
              )}
            </div>

            {/* Timestamp and actions */}
            <div className="flex items-center justify-between gap-3 mt-2">
              <span className="text-xs text-slate-500 font-medium">
                {formatRelativeTime(notification.timestamp)}
              </span>

              {showActions && (
                <div className="flex items-center gap-1">
                  {/* Expand/Collapse button for metadata */}
                  {hasMetadata && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                      className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" strokeWidth={2} />
                          Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" strokeWidth={2} />
                          More
                        </>
                      )}
                    </Button>
                  )}

                  {/* Action URL button */}
                  {hasActionUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                      className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" strokeWidth={2} />
                      View
                    </Button>
                  )}

                  {/* Mark as read/unread */}
                  {notification.read ? (
                    onMarkUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkUnread(notification.id);
                        }}
                        className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Mark unread
                      </Button>
                    )
                  ) : (
                    onMarkRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkRead(notification.id);
                        }}
                        className="h-6 px-2 text-xs text-slate-600 hover:text-slate-900"
                      >
                        Mark read
                      </Button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Expanded metadata details */}
            {isExpanded && hasMetadata && (
              <div className="mt-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-slate-200">
                <h5 className="text-xs font-semibold text-slate-700 mb-2">Details</h5>
                <dl className="space-y-1">
                  {Object.entries(notification.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-start text-xs">
                      <dt className="font-medium text-slate-600 w-24 flex-shrink-0 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </dt>
                      <dd className="text-slate-700 flex-1">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Priority indicator (optional) */}
      {notification.priority === 'urgent' && (
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wide rounded-full">
            Urgent
          </span>
        </div>
      )}
    </div>
  );
}
