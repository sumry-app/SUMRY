import { uid, createTimestamp } from './data';

const STORAGE_KEY = 'sumry_notifications_v1';
const MAX_NOTIFICATIONS = 100;
const AUTO_CLEANUP_DAYS = 30;

// Notification types with their icons and colors
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ALERT: 'alert',
  MENTION: 'mention',
  GOAL: 'goal',
  STUDENT: 'student',
  PROGRESS: 'progress',
  DEADLINE: 'deadline',
  ACHIEVEMENT: 'achievement',
  COMMENT: 'comment',
  DATA_GAP: 'data_gap'
};

// Notification priorities
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

/**
 * NotificationManager - Manages all notifications in the app
 * Provides methods to add, read, delete, and manage notifications
 */
class NotificationManager {
  constructor() {
    this.listeners = new Set();
    this.notifications = this.loadNotifications();
    this.cleanupOldNotifications();
  }

  /**
   * Load notifications from localStorage
   */
  loadNotifications() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];

      const notifications = JSON.parse(stored);
      if (!Array.isArray(notifications)) return [];

      return notifications.map(n => ({
        id: n.id || uid(),
        type: n.type || NOTIFICATION_TYPES.INFO,
        title: n.title || '',
        message: n.message || '',
        timestamp: n.timestamp || createTimestamp(),
        read: n.read || false,
        priority: n.priority || PRIORITY.MEDIUM,
        actionUrl: n.actionUrl || null,
        metadata: n.metadata || {},
        dismissed: n.dismissed || false
      }));
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  /**
   * Save notifications to localStorage
   */
  saveNotifications() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.notifications);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  /**
   * Add a new notification
   */
  addNotification({
    type = NOTIFICATION_TYPES.INFO,
    title,
    message,
    priority = PRIORITY.MEDIUM,
    actionUrl = null,
    metadata = {}
  }) {
    if (!title && !message) {
      console.warn('Notification must have a title or message');
      return null;
    }

    const notification = {
      id: uid(),
      type,
      title,
      message,
      timestamp: createTimestamp(),
      read: false,
      priority,
      actionUrl,
      metadata,
      dismissed: false
    };

    this.notifications.unshift(notification);

    // Keep only MAX_NOTIFICATIONS most recent
    if (this.notifications.length > MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, MAX_NOTIFICATIONS);
    }

    this.saveNotifications();
    return notification;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  /**
   * Mark notification as unread
   */
  markAsUnread(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = false;
      this.saveNotifications();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  /**
   * Clear all read notifications
   */
  clearRead() {
    this.notifications = this.notifications.filter(n => !n.read);
    this.saveNotifications();
  }

  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read && !n.dismissed).length;
  }

  /**
   * Get notifications by type
   */
  getByType(type) {
    return this.notifications.filter(n => n.type === type && !n.dismissed);
  }

  /**
   * Get notifications by priority
   */
  getByPriority(priority) {
    return this.notifications.filter(n => n.priority === priority && !n.dismissed);
  }

  /**
   * Search notifications
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.notifications.filter(n => {
      if (n.dismissed) return false;
      const searchText = `${n.title} ${n.message}`.toLowerCase();
      return searchText.includes(lowerQuery);
    });
  }

  /**
   * Get all notifications (excluding dismissed)
   */
  getAll() {
    return this.notifications.filter(n => !n.dismissed);
  }

  /**
   * Get paginated notifications
   */
  getPaginated(page = 1, pageSize = 20) {
    const active = this.notifications.filter(n => !n.dismissed);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      notifications: active.slice(start, end),
      total: active.length,
      page,
      pageSize,
      totalPages: Math.ceil(active.length / pageSize)
    };
  }

  /**
   * Cleanup old notifications (older than AUTO_CLEANUP_DAYS)
   */
  cleanupOldNotifications() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUTO_CLEANUP_DAYS);
    const cutoffISO = cutoffDate.toISOString();

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(n => {
      // Keep unread notifications regardless of age
      if (!n.read) return true;
      // Keep recent notifications
      return n.timestamp > cutoffISO;
    });

    if (this.notifications.length < initialCount) {
      this.saveNotifications();
    }
  }

  /**
   * Dismiss notification (soft delete)
   */
  dismissNotification(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.dismissed = true;
      this.saveNotifications();
    }
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Notification trigger helpers
export const triggerNotifications = {
  /**
   * Goal created notification
   */
  goalCreated(studentName, goalArea) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.GOAL,
      title: 'New Goal Created',
      message: `Goal created for ${studentName} in ${goalArea}`,
      priority: PRIORITY.MEDIUM,
      metadata: { studentName, goalArea }
    });
  },

  /**
   * Goal updated notification
   */
  goalUpdated(studentName, goalArea) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.GOAL,
      title: 'Goal Updated',
      message: `${goalArea} goal updated for ${studentName}`,
      priority: PRIORITY.LOW,
      metadata: { studentName, goalArea }
    });
  },

  /**
   * Progress log added notification
   */
  progressLogAdded(studentName, goalArea, score) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.PROGRESS,
      title: 'Progress Logged',
      message: `New progress entry for ${studentName} - ${goalArea}: ${score}`,
      priority: PRIORITY.MEDIUM,
      metadata: { studentName, goalArea, score }
    });
  },

  /**
   * Student assigned notification
   */
  studentAssigned(studentName) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.STUDENT,
      title: 'Student Added',
      message: `${studentName} has been added to your caseload`,
      priority: PRIORITY.MEDIUM,
      metadata: { studentName }
    });
  },

  /**
   * IEP deadline approaching notification
   */
  iepDeadlineApproaching(studentName, daysRemaining) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.DEADLINE,
      title: 'IEP Deadline Approaching',
      message: `${studentName}'s IEP review is due in ${daysRemaining} days`,
      priority: daysRemaining <= 7 ? PRIORITY.URGENT : PRIORITY.HIGH,
      metadata: { studentName, daysRemaining }
    });
  },

  /**
   * Data gap detected notification
   */
  dataGapDetected(studentName, goalArea, daysSinceLastLog) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.DATA_GAP,
      title: 'Data Gap Detected',
      message: `No progress data for ${studentName}'s ${goalArea} goal in ${daysSinceLastLog} days`,
      priority: PRIORITY.HIGH,
      metadata: { studentName, goalArea, daysSinceLastLog }
    });
  },

  /**
   * Achievement unlocked notification
   */
  achievementUnlocked(studentName, achievement) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.ACHIEVEMENT,
      title: 'Achievement Unlocked!',
      message: `${studentName} ${achievement}`,
      priority: PRIORITY.MEDIUM,
      metadata: { studentName, achievement }
    });
  },

  /**
   * Comment added notification
   */
  commentAdded(author, context) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.COMMENT,
      title: 'New Comment',
      message: `${author} commented on ${context}`,
      priority: PRIORITY.LOW,
      metadata: { author, context }
    });
  },

  /**
   * Generic success notification
   */
  success(title, message) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      priority: PRIORITY.LOW
    });
  },

  /**
   * Generic info notification
   */
  info(title, message) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      priority: PRIORITY.MEDIUM
    });
  },

  /**
   * Generic warning notification
   */
  warning(title, message) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      priority: PRIORITY.HIGH
    });
  },

  /**
   * Generic alert notification
   */
  alert(title, message) {
    return notificationManager.addNotification({
      type: NOTIFICATION_TYPES.ALERT,
      title,
      message,
      priority: PRIORITY.URGENT
    });
  }
};

export default notificationManager;
