import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Bell,
  Search,
  X,
  CheckCheck,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  BellOff,
  Inbox
} from 'lucide-react';
import notificationManager, { NOTIFICATION_TYPES } from '@/lib/notificationManager';
import NotificationItem from './NotificationItem';

/**
 * NotificationCenter Component
 * A comprehensive notification panel with filtering, search, pagination, and actions
 */
export default function NotificationCenter({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const dropdownRef = useRef(null);

  // Load notifications and subscribe to changes
  useEffect(() => {
    const updateNotifications = (newNotifications) => {
      setNotifications(newNotifications);
    };

    // Initial load
    updateNotifications(notificationManager.getAll());

    // Subscribe to changes
    const unsubscribe = notificationManager.subscribe(updateNotifications);

    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'unread') {
        result = result.filter(n => !n.read);
      } else {
        result = result.filter(n => n.type === filterType);
      }
    }

    // Search
    if (searchQuery.trim()) {
      result = notificationManager.search(searchQuery);
      // Apply type filter to search results
      if (filterType !== 'all' && filterType !== 'unread') {
        result = result.filter(n => n.type === filterType);
      } else if (filterType === 'unread') {
        result = result.filter(n => !n.read);
      }
    }

    return result;
  }, [notifications, filterType, searchQuery]);

  // Pagination
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredNotifications.slice(start, end);
  }, [filteredNotifications, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);
  const unreadCount = notificationManager.getUnreadCount();

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // Handlers
  const handleMarkAsRead = (id) => {
    notificationManager.markAsRead(id);
  };

  const handleMarkAsUnread = (id) => {
    notificationManager.markAsUnread(id);
  };

  const handleDelete = (id) => {
    notificationManager.deleteNotification(id);
  };

  const handleDismiss = (id) => {
    notificationManager.dismissNotification(id);
  };

  const handleMarkAllAsRead = () => {
    notificationManager.markAllAsRead();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      notificationManager.clearAll();
      setIsOpen(false);
    }
  };

  const handleClearRead = () => {
    notificationManager.clearRead();
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Notification type counts
  const typeCounts = useMemo(() => {
    const counts = {};
    Object.values(NOTIFICATION_TYPES).forEach(type => {
      counts[type] = notifications.filter(n => n.type === type).length;
    });
    return counts;
  }, [notifications]);

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className={cn(
          'relative rounded-xl border-slate-200 hover:bg-slate-100 transition-all',
          isOpen && 'bg-slate-100'
        )}
      >
        <Bell className="h-5 w-5" strokeWidth={2} />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-bold rounded-full bg-red-500 text-white border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[480px] max-w-[calc(100vw-2rem)] z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="rounded-2xl border border-white/60 bg-white/95 backdrop-blur-xl shadow-2xl shadow-slate-900/10">
            {/* Header */}
            <div className="border-b border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        className="text-xs h-7 px-2"
                        title="Mark all as read"
                      >
                        <CheckCheck className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                        Mark all
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearRead}
                        className="text-xs h-7 px-2"
                        title="Clear read notifications"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" strokeWidth={2} />
                        Clear read
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" strokeWidth={2} />
                <Input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 h-9 text-sm bg-slate-50 border-slate-200 rounded-xl"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <Tabs value={filterType} onValueChange={setFilterType} className="w-full">
              <div className="border-b border-slate-200 px-4 pt-3">
                <TabsList className="w-full grid grid-cols-6 h-9 bg-slate-100 rounded-lg p-1">
                  <TabsTrigger
                    value="all"
                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    All
                    {notifications.length > 0 && (
                      <span className="ml-1 text-[10px] text-slate-500">({notifications.length})</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Unread
                    {unreadCount > 0 && (
                      <span className="ml-1 text-[10px] text-blue-600 font-semibold">({unreadCount})</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value={NOTIFICATION_TYPES.GOAL}
                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Goals
                  </TabsTrigger>
                  <TabsTrigger
                    value={NOTIFICATION_TYPES.PROGRESS}
                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Progress
                  </TabsTrigger>
                  <TabsTrigger
                    value={NOTIFICATION_TYPES.DEADLINE}
                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Deadlines
                  </TabsTrigger>
                  <TabsTrigger
                    value={NOTIFICATION_TYPES.ALERT}
                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
                  >
                    Alerts
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Notification List */}
              <div className="max-h-[480px] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      {searchQuery ? (
                        <Search className="h-8 w-8 text-slate-400" strokeWidth={2} />
                      ) : filterType === 'unread' ? (
                        <BellOff className="h-8 w-8 text-slate-400" strokeWidth={2} />
                      ) : (
                        <Inbox className="h-8 w-8 text-slate-400" strokeWidth={2} />
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                      {searchQuery
                        ? 'No results found'
                        : filterType === 'unread'
                        ? 'All caught up!'
                        : 'No notifications yet'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {searchQuery
                        ? 'Try adjusting your search'
                        : filterType === 'unread'
                        ? 'You have no unread notifications'
                        : 'New notifications will appear here'}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="p-3 space-y-2">
                      {paginatedNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkRead={handleMarkAsRead}
                          onMarkUnread={handleMarkAsUnread}
                          onDelete={handleDelete}
                          onDismiss={handleDismiss}
                          showActions={true}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="border-t border-slate-200 p-3 flex items-center justify-between bg-slate-50">
                        <div className="text-xs text-slate-600">
                          Showing {((currentPage - 1) * pageSize) + 1}-
                          {Math.min(currentPage * pageSize, filteredNotifications.length)} of{' '}
                          {filteredNotifications.length}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-7 w-7 p-0 rounded-lg"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                          <div className="text-xs text-slate-700 px-2">
                            {currentPage} / {totalPages}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-7 w-7 p-0 rounded-lg"
                          >
                            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Tabs>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-200 p-3 bg-slate-50 rounded-b-2xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" strokeWidth={2} />
                  Clear all notifications
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
