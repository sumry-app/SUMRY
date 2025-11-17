# SUMRY Notification Center

A comprehensive, enterprise-grade notification system for the SUMRY IEP Management platform.

## Features

### NotificationCenter Component
- **Dropdown panel** with smooth animations and backdrop blur
- **Badge count indicator** showing unread notifications
- **Mark as read/unread** functionality
- **Clear all** and **Clear read** buttons
- **Filter by type** with 6 notification categories
- **Search notifications** with real-time filtering
- **Pagination** for notification history (10 items per page)
- **Empty states** for different scenarios
- **Responsive design** works on mobile, tablet, and desktop

### NotificationItem Component
- **Type-based icons** with color coding
- **Relative timestamps** (e.g., "2 min ago", "3 hours ago")
- **Action buttons** (mark read/unread, delete)
- **Expandable details** showing metadata
- **Unread indicator** with visual accent
- **Click to navigate** support
- **Swipe to dismiss** on mobile devices
- **Priority indicators** for urgent notifications

### NotificationManager
Core notification engine with localStorage persistence:

- **Add notification** - Create new notifications
- **Mark as read/unread** - Update notification status
- **Delete notification** - Remove specific notifications
- **Get unread count** - Real-time unread count
- **Search** - Full-text search across notifications
- **Filter by type** - Get notifications by category
- **Pagination** - Paginated access to notifications
- **Auto-cleanup** - Removes notifications older than 30 days
- **localStorage persistence** - Survives page refreshes
- **Event listeners** - Subscribe to notification changes

## Notification Types

The system supports 12 notification types:

| Type | Description | Color | Icon |
|------|-------------|-------|------|
| **success** | Success confirmations | Green | CheckCircle |
| **info** | General information | Blue | Info |
| **warning** | Warning messages | Amber | AlertTriangle |
| **alert** | Critical alerts | Red | AlertOctagon |
| **mention** | User mentions | Purple | AtSign |
| **goal** | Goal-related updates | Indigo | TrendingUp |
| **student** | Student assignments | Sky | Users |
| **progress** | Progress updates | Teal | BarChart3 |
| **deadline** | Deadline reminders | Orange | Calendar |
| **achievement** | Achievements unlocked | Yellow | Award |
| **comment** | New comments | Slate | MessageSquare |
| **data_gap** | Data collection gaps | Rose | AlertCircle |

## Notification Priorities

- **LOW** - General updates, low urgency
- **MEDIUM** - Standard notifications (default)
- **HIGH** - Important notifications requiring attention
- **URGENT** - Critical notifications with visual indicator

## Automatic Notification Triggers

The system automatically creates notifications for:

### 1. Goal Created
Triggered when a new goal is added to a student's IEP.
```javascript
triggerNotifications.goalCreated(studentName, goalArea);
```

### 2. Goal Updated
Triggered when an existing goal is modified.
```javascript
triggerNotifications.goalUpdated(studentName, goalArea);
```

### 3. Progress Log Added
Triggered when new progress data is logged.
```javascript
triggerNotifications.progressLogAdded(studentName, goalArea, score);
```

### 4. Student Assigned
Triggered when a new student is added to the caseload.
```javascript
triggerNotifications.studentAssigned(studentName);
```

### 5. Achievement Unlocked
Triggered when a student reaches their goal target.
```javascript
triggerNotifications.achievementUnlocked(studentName, achievement);
```

### 6. Data Gap Detected
Automatically checks for goals without progress logs for 14+ days.
- Runs on Dashboard mount
- Checks daily via interval
- Prevents duplicate notifications using localStorage

### 7. IEP Deadline Approaching (Available)
Can be triggered for IEP review deadlines.
```javascript
triggerNotifications.iepDeadlineApproaching(studentName, daysRemaining);
```

### 8. Comment Added (Available)
Can be triggered when comments are added to goals or logs.
```javascript
triggerNotifications.commentAdded(author, context);
```

## Usage Examples

### Basic Usage

The NotificationCenter is already integrated into the app header:

```jsx
import NotificationCenter from "@/components/notifications/NotificationCenter";

// In your component
<NotificationCenter />
```

### Creating Custom Notifications

```javascript
import { triggerNotifications } from "@/lib/notificationManager";

// Success notification
triggerNotifications.success(
  "Data Saved",
  "Your changes have been saved successfully"
);

// Warning notification
triggerNotifications.warning(
  "Low Progress",
  "Student has only 2 data points this month"
);

// Alert notification
triggerNotifications.alert(
  "Deadline Missed",
  "IEP review was due yesterday"
);
```

### Advanced Usage with Metadata

```javascript
import notificationManager from "@/lib/notificationManager";

notificationManager.addNotification({
  type: "goal",
  title: "New Reading Goal",
  message: "Sarah Johnson - Fluency goal created",
  priority: "medium",
  actionUrl: "/goals/abc123",
  metadata: {
    studentId: "stu_123",
    goalId: "goal_456",
    area: "Reading",
    createdBy: "Jane Doe"
  }
});
```

### Subscribing to Changes

```javascript
import notificationManager from "@/lib/notificationManager";

const unsubscribe = notificationManager.subscribe((notifications) => {
  console.log("Notifications updated:", notifications);
  // Update your UI
});

// Cleanup when component unmounts
return () => unsubscribe();
```

### Manual Management

```javascript
import notificationManager from "@/lib/notificationManager";

// Get unread count
const count = notificationManager.getUnreadCount();

// Mark all as read
notificationManager.markAllAsRead();

// Clear read notifications
notificationManager.clearRead();

// Search notifications
const results = notificationManager.search("reading");

// Get by type
const goalNotifications = notificationManager.getByType("goal");

// Paginated access
const page = notificationManager.getPaginated(2, 20);
```

## Integration Points

### Current Integrations

1. **GoalsView** - Triggers notifications on goal create/update
2. **ProgressView** - Triggers notifications on progress log add + achievement detection
3. **StudentsView** - Triggers notifications on student assignment
4. **Dashboard** - Automatic data gap detection

### Recommended Future Integrations

1. **IEP Meeting Prep** - Notify when meetings are scheduled
2. **Parent Portal** - Notify when parents view/comment on progress
3. **Team Collaboration** - Notify on team member comments/mentions
4. **Assessment Results** - Notify when new assessments are added
5. **Compliance Alerts** - Notify about missing documentation

## Styling

The notification system uses:
- **Tailwind CSS** for styling
- **Glass morphism** design (backdrop blur)
- **Color-coded** notification types
- **Smooth animations** with Tailwind's animate-in utilities
- **Responsive design** with mobile-first approach

## Accessibility

- **Keyboard navigation** support
- **Screen reader** friendly labels
- **Focus management** for dropdown
- **Color contrast** meets WCAG AA standards
- **Touch targets** sized appropriately for mobile

## Performance

- **Local storage** caching for instant load
- **Pagination** prevents rendering large lists
- **Event-based updates** for real-time changes
- **Auto-cleanup** prevents unbounded growth (max 100 notifications)
- **Memoization** for expensive computations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Storage

Notifications are stored in localStorage under the key:
```
sumry_notifications_v1
```

Maximum storage:
- 100 notifications total
- 30 days retention for read notifications
- Unread notifications never auto-deleted

## Testing

To test the notification system:

1. **Add a student** - Should see "Student Added" notification
2. **Create a goal** - Should see "New Goal Created" notification
3. **Log progress** - Should see "Progress Logged" notification
4. **Reach target** - Should see "Achievement Unlocked" notification
5. **Wait 14 days** (or modify threshold) - Should see "Data Gap Detected"

## Customization

### Modify Notification Colors

Edit `getNotificationColors()` in `NotificationItem.jsx`:

```javascript
const colorMap = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
    iconBg: 'bg-green-100'
  },
  // ... add more types
};
```

### Modify Auto-cleanup Settings

Edit constants in `notificationManager.js`:

```javascript
const MAX_NOTIFICATIONS = 100; // Maximum notifications to store
const AUTO_CLEANUP_DAYS = 30; // Days before cleanup
```

### Add New Notification Types

1. Add type to `NOTIFICATION_TYPES` in `notificationManager.js`
2. Add icon mapping in `getNotificationIcon()` in `NotificationItem.jsx`
3. Add color mapping in `getNotificationColors()` in `NotificationItem.jsx`
4. Create trigger function in `triggerNotifications` object

## API Reference

### NotificationManager Methods

```typescript
class NotificationManager {
  // Add notification
  addNotification(config: NotificationConfig): Notification

  // Mark operations
  markAsRead(id: string): void
  markAsUnread(id: string): void
  markAllAsRead(): void

  // Delete operations
  deleteNotification(id: string): void
  clearAll(): void
  clearRead(): void
  dismissNotification(id: string): void

  // Query operations
  getUnreadCount(): number
  getByType(type: string): Notification[]
  getByPriority(priority: string): Notification[]
  search(query: string): Notification[]
  getAll(): Notification[]
  getPaginated(page: number, pageSize: number): PaginatedResult

  // Subscribe to changes
  subscribe(callback: (notifications: Notification[]) => void): () => void
}
```

### Notification Interface

```typescript
interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  priority: Priority;
  actionUrl?: string;
  metadata: Record<string, any>;
  dismissed: boolean;
}
```

## License

Part of the SUMRY IEP Management System.
