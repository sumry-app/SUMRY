# Notification Center - Quick Start

## 🎉 What's New

SUMRY now has a **comprehensive notification center** like GitHub, Linear, and Slack!

## 📍 Location

Click the **bell icon** in the top-right header (next to the search bar).

## 🔔 Automatic Notifications

The system automatically notifies you when:

1. ✅ **Student Added** - New student assigned to caseload
2. ✅ **Goal Created** - New IEP goal added
3. ✅ **Goal Updated** - Existing goal modified
4. ✅ **Progress Logged** - New progress data entered
5. ✅ **Achievement Unlocked** - Student reaches goal target!
6. ✅ **Data Gap Detected** - No progress logged for 14+ days

## 🎨 Features

- **Badge Count** - Shows unread notification count
- **Search** - Find notifications quickly
- **Filters** - All, Unread, Goals, Progress, Deadlines, Alerts
- **Mark as Read/Unread** - Manage notification status
- **Clear All** - Remove all notifications
- **Pagination** - Navigate through notification history
- **Mobile Support** - Swipe to dismiss notifications

## 🚀 Quick Test

1. Go to **Students** tab
2. Click **Add Student**
3. Fill in name: "Test Student"
4. Click **Save**
5. Look at the **bell icon** - you'll see a red badge (1)
6. Click the **bell** - you'll see "Student Added" notification!

## 💡 Pro Tips

- **Unread count** appears as a red badge on the bell icon
- **Urgent notifications** have a special badge
- **Click a notification** to mark it as read
- **Search** works across all notification text
- **Notifications persist** across page refreshes
- **Auto-cleanup** removes read notifications after 30 days

## 📚 Documentation

- **Full docs**: `/src/components/notifications/README.md`
- **Examples**: `/src/components/notifications/USAGE_EXAMPLES.md`
- **Summary**: `/NOTIFICATION_CENTER_SUMMARY.md`

## 🎯 Common Actions

| Action | How |
|--------|-----|
| View notifications | Click bell icon |
| Mark as read | Click notification or "Mark read" button |
| Mark all as read | Click "Mark all" button |
| Delete notification | Click X button on notification |
| Clear all | Click "Clear all notifications" |
| Search | Type in search box |
| Filter by type | Click filter tabs (All, Unread, etc.) |

## 🎨 Notification Types & Colors

| Type | Color | When It Appears |
|------|-------|----------------|
| Success | Green | Actions completed successfully |
| Info | Blue | General information |
| Warning | Amber | Needs attention |
| Alert | Red | Critical issues |
| Goal | Indigo | Goal-related updates |
| Student | Sky | Student updates |
| Progress | Teal | Progress data |
| Deadline | Orange | Upcoming deadlines |
| Achievement | Yellow | Milestones reached |
| Data Gap | Rose | Missing data |

## 🔧 Customization

Want to add custom notifications? Use:

```javascript
import { triggerNotifications } from "@/lib/notificationManager";

// Success
triggerNotifications.success("Title", "Message");

// Warning
triggerNotifications.warning("Title", "Message");

// Alert
triggerNotifications.alert("Title", "Message");
```

## 📱 Mobile Experience

- Optimized for touch
- Swipe left/right to dismiss
- Responsive design
- Full-screen friendly

## ✨ What Makes It Special

- **GitHub-style** design and UX
- **Real-time updates** via event system
- **Persistent** across page refreshes
- **Intelligent** auto-cleanup
- **Fast** - no lag with 100+ notifications
- **Accessible** - keyboard and screen reader support

Enjoy your new notification center! 🚀
