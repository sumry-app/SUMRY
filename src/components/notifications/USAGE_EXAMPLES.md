# Notification Center - Quick Start Examples

## Testing the Notification System

The easiest way to see notifications in action:

1. **Open SUMRY** in your browser
2. **Add a Student** - Click "Add Student" → Fill form → Save
   - ✅ You'll see a notification: "Student Added"
3. **Create a Goal** - Go to Goals tab → Add Goal → Save
   - ✅ You'll see a notification: "New Goal Created"
4. **Log Progress** - Go to Progress tab → Select goal → Add score → Save
   - ✅ You'll see a notification: "Progress Logged"
5. **Click the Bell Icon** in the header to see all notifications

## Common Use Cases

### 1. Trigger a Success Notification

```javascript
import { triggerNotifications } from "@/lib/notificationManager";

// When data is saved
function handleSave() {
  // ... save logic
  triggerNotifications.success(
    "Saved Successfully",
    "Your changes have been saved"
  );
}
```

### 2. Trigger a Warning

```javascript
// When something needs attention
function checkProgress(student) {
  if (student.progressLogs.length < 3) {
    triggerNotifications.warning(
      "Low Data",
      `${student.name} has fewer than 3 progress logs this month`
    );
  }
}
```

### 3. Trigger an Alert

```javascript
// For critical issues
function validateIEP(student) {
  if (student.iepExpired) {
    triggerNotifications.alert(
      "IEP Expired",
      `${student.name}'s IEP expired on ${student.iepExpiryDate}`
    );
  }
}
```

### 4. Achievement Notification

```javascript
// Already integrated! Triggers automatically when score >= target
// Example: If target is 80% and student scores 85%, achievement triggers

// Manual trigger:
triggerNotifications.achievementUnlocked(
  "Sarah Johnson",
  "scored 90% on the reading fluency assessment!"
);
```

### 5. Custom Notification with Metadata

```javascript
import notificationManager from "@/lib/notificationManager";

function notifyParentLogin(parentName, studentName) {
  notificationManager.addNotification({
    type: "info",
    title: "Parent Portal Access",
    message: `${parentName} viewed ${studentName}'s progress`,
    priority: "low",
    metadata: {
      parentName,
      studentName,
      timestamp: new Date().toISOString(),
      action: "view_progress"
    }
  });
}
```

## Integration Examples

### Add to Custom Component

```jsx
import React from 'react';
import { triggerNotifications } from "@/lib/notificationManager";

function MyComponent() {
  const handleAction = () => {
    // Your logic here

    // Notify user
    triggerNotifications.success(
      "Action Complete",
      "The action was completed successfully"
    );
  };

  return (
    <button onClick={handleAction}>
      Do Something
    </button>
  );
}
```

### Subscribe to Notification Changes

```jsx
import React, { useEffect, useState } from 'react';
import notificationManager from "@/lib/notificationManager";

function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Subscribe to changes
    const unsubscribe = notificationManager.subscribe((notifications) => {
      setCount(notificationManager.getUnreadCount());
    });

    // Initial count
    setCount(notificationManager.getUnreadCount());

    // Cleanup
    return () => unsubscribe();
  }, []);

  return (
    <div>
      You have {count} unread notifications
    </div>
  );
}
```

### Real-time Data Gap Detection

```jsx
import { useEffect } from 'react';
import { triggerNotifications } from "@/lib/notificationManager";

function useDataGapDetection(goals, logs, students) {
  useEffect(() => {
    const checkGaps = () => {
      goals.forEach(goal => {
        const goalLogs = logs.filter(l => l.goalId === goal.id);
        const student = students.find(s => s.id === goal.studentId);

        if (goalLogs.length === 0) return;

        const latestLog = goalLogs.sort((a, b) =>
          b.dateISO.localeCompare(a.dateISO)
        )[0];

        const daysSince = Math.floor(
          (Date.now() - new Date(latestLog.dateISO)) / (1000 * 60 * 60 * 24)
        );

        if (daysSince > 14 && student) {
          triggerNotifications.dataGapDetected(
            student.name,
            goal.area,
            daysSince
          );
        }
      });
    };

    checkGaps();
    const interval = setInterval(checkGaps, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [goals, logs, students]);
}
```

## Practical Scenarios

### Scenario 1: IEP Meeting Reminder

```javascript
// Check for upcoming IEP meetings
function checkIEPMeetings(students) {
  const today = new Date();

  students.forEach(student => {
    if (!student.nextIEPDate) return;

    const iepDate = new Date(student.nextIEPDate);
    const daysUntil = Math.ceil((iepDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntil <= 7 && daysUntil > 0) {
      triggerNotifications.iepDeadlineApproaching(
        student.name,
        daysUntil
      );
    }
  });
}
```

### Scenario 2: Team Collaboration

```javascript
// When a team member adds a comment
function handleComment(comment, goal, student) {
  // Save comment...

  // Notify other team members
  triggerNotifications.commentAdded(
    comment.author,
    `${student.name}'s ${goal.area} goal`
  );
}
```

### Scenario 3: Bulk Operations

```javascript
// Notify about bulk import results
function handleBulkImport(results) {
  const { successful, failed } = results;

  if (successful.length > 0) {
    triggerNotifications.success(
      "Import Complete",
      `Successfully imported ${successful.length} records`
    );
  }

  if (failed.length > 0) {
    triggerNotifications.warning(
      "Import Issues",
      `${failed.length} records failed to import`
    );
  }
}
```

### Scenario 4: Progress Milestones

```javascript
// Celebrate progress milestones
function checkMilestones(student, logs) {
  const totalLogs = logs.length;
  const milestones = [10, 25, 50, 100];

  if (milestones.includes(totalLogs)) {
    triggerNotifications.achievementUnlocked(
      student.name,
      `reached ${totalLogs} progress logs!`
    );
  }
}
```

## Advanced Patterns

### Conditional Notifications

```javascript
// Only notify during business hours
function smartNotify(type, title, message) {
  const hour = new Date().getHours();
  const isBusinessHours = hour >= 8 && hour <= 17;

  if (!isBusinessHours) {
    // Queue for later or skip non-critical notifications
    return;
  }

  triggerNotifications[type](title, message);
}
```

### Notification Throttling

```javascript
// Prevent notification spam
const notificationCache = new Map();

function throttledNotify(key, type, title, message, cooldownMs = 60000) {
  const lastNotified = notificationCache.get(key);
  const now = Date.now();

  if (lastNotified && (now - lastNotified) < cooldownMs) {
    return; // Skip, too soon
  }

  notificationCache.set(key, now);
  triggerNotifications[type](title, message);
}

// Usage
throttledNotify(
  `data-gap-${goalId}`,
  'dataGapDetected',
  'Data Gap',
  'No progress logged in 14 days'
);
```

### Priority-based Routing

```javascript
// Handle notifications based on priority
function handleNotification(notification) {
  switch (notification.priority) {
    case 'urgent':
      // Show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png'
        });
      }
      break;
    case 'high':
      // Play sound
      new Audio('/notification.mp3').play();
      break;
    default:
      // Just add to notification center
      break;
  }
}
```

## Quick Reference

```javascript
// Import
import { triggerNotifications } from "@/lib/notificationManager";
import notificationManager from "@/lib/notificationManager";

// Quick triggers
triggerNotifications.success(title, message)
triggerNotifications.info(title, message)
triggerNotifications.warning(title, message)
triggerNotifications.alert(title, message)
triggerNotifications.goalCreated(studentName, area)
triggerNotifications.goalUpdated(studentName, area)
triggerNotifications.progressLogAdded(studentName, area, score)
triggerNotifications.studentAssigned(studentName)
triggerNotifications.achievementUnlocked(studentName, achievement)
triggerNotifications.iepDeadlineApproaching(studentName, days)
triggerNotifications.dataGapDetected(studentName, area, days)
triggerNotifications.commentAdded(author, context)

// Management
notificationManager.getUnreadCount()
notificationManager.markAllAsRead()
notificationManager.clearRead()
notificationManager.clearAll()
notificationManager.search(query)
notificationManager.getByType(type)
notificationManager.subscribe(callback)
```

## Tips & Best Practices

1. **Use appropriate types** - Match notification type to content
2. **Be concise** - Keep titles short, messages brief
3. **Avoid spam** - Don't notify for every minor action
4. **Use metadata** - Store context for future reference
5. **Handle cleanup** - System auto-cleans after 30 days
6. **Test thoroughly** - Verify notifications work as expected
7. **Consider timing** - Don't overwhelm users with notifications
8. **Provide context** - Include student/goal names in messages
9. **Use priorities** - Mark urgent items appropriately
10. **Subscribe wisely** - Unsubscribe in cleanup functions

## Troubleshooting

**Notifications not appearing?**
- Check browser console for errors
- Verify NotificationCenter is mounted
- Check localStorage quota

**Too many notifications?**
- Adjust AUTO_CLEANUP_DAYS
- Reduce MAX_NOTIFICATIONS
- Implement throttling

**Slow performance?**
- Enable pagination
- Clear old notifications
- Optimize subscriptions

**Notifications disappearing?**
- Check auto-cleanup settings
- Verify localStorage persistence
- Check for conflicting code
