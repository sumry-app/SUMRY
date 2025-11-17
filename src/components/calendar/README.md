# Calendar and Timeline Components

Beautiful, comprehensive calendar and timeline views for SUMRY IEP tracking system.

## Components

### 1. Calendar (`Calendar.jsx`)

A full-featured calendar component with multiple view modes and event management.

#### Features

- **Multiple View Modes**: Month, Week, and Day views
- **Event Management**: Create, edit, and delete custom events
- **Automatic Event Generation**:
  - IEP meeting deadlines (auto-calculated from last meeting date)
  - Goal deadlines from target dates
  - Progress log entries
- **Drag-to-Reschedule**: Drag custom events to new dates
- **Color Coding**: Events color-coded by type
- **Today Indicator**: Clear visual indicator for current date
- **Event Filtering**: Filter by event type
- **iCal Export**: Export events to standard calendar format
- **Responsive Design**: Works on all screen sizes

#### Event Types

- `IEP_MEETING` - Annual IEP meeting deadlines (purple)
- `GOAL_DEADLINE` - Goal target dates (blue)
- `PROGRESS_LOG` - Progress entry dates (green)
- `ASSESSMENT` - Assessment dates (orange)
- `PARENT_MEETING` - Parent meeting dates (pink)
- `REMINDER` - Reminders (yellow)
- `CUSTOM` - User-created events (gray)

#### Usage

```jsx
import { Calendar } from '@/components/calendar';

function MyComponent() {
  const handleCreateEvent = (event) => {
    console.log('New event:', event);
  };

  const handleUpdateEvent = (eventId, eventData) => {
    console.log('Updated:', eventId, eventData);
  };

  const handleDeleteEvent = (eventId) => {
    console.log('Deleted:', eventId);
  };

  return (
    <Calendar
      students={students}
      goals={goals}
      progressLogs={progressLogs}
      onCreateEvent={handleCreateEvent}
      onUpdateEvent={handleUpdateEvent}
      onDeleteEvent={handleDeleteEvent}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `students` | Array | No | Array of student objects |
| `goals` | Array | No | Array of goal objects |
| `progressLogs` | Array | No | Array of progress log objects |
| `onCreateEvent` | Function | No | Callback when event is created |
| `onUpdateEvent` | Function | No | Callback when event is updated |
| `onDeleteEvent` | Function | No | Callback when event is deleted |

### 2. StudentTimeline (`StudentTimeline.jsx`)

A horizontal timeline showing a student's journey with milestones.

#### Features

- **Horizontal Timeline**: Visual timeline from first to last event
- **Milestone Detection**: Automatically detects achievement milestones at 50%, 75%, and 90%
- **Event Types**:
  - Goal creation events
  - Goal completion/deadline events
  - Progress log entries
  - Milestone achievements
- **Zoom Controls**: Zoom in/out for detail
- **Event Filtering**: Filter by Goals, Progress, or Milestones
- **Interactive Events**: Click events for detailed information
- **Scroll Navigation**: Navigate timeline with scroll buttons
- **Beautiful Animations**: Smooth animations using Framer Motion
- **Export**: Export timeline as image (requires html2canvas)

#### Usage

```jsx
import { StudentTimeline } from '@/components/timeline';

function StudentView() {
  const student = students.find(s => s.id === selectedId);
  const studentGoals = goals.filter(g => g.student_id === selectedId);
  const studentLogs = progressLogs.filter(log => {
    const goal = goals.find(g => g.id === log.goal_id);
    return goal && goal.student_id === selectedId;
  });

  return (
    <StudentTimeline
      student={student}
      goals={studentGoals}
      progressLogs={studentLogs}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `student` | Object | Yes | Student object |
| `goals` | Array | No | Array of goal objects for this student |
| `progressLogs` | Array | No | Array of progress log objects for this student |

### 3. ProgressTimeline (`ProgressTimeline.jsx`)

A vertical timeline showing all progress logs with trend analysis.

#### Features

- **Vertical Timeline**: Traditional timeline layout with all entries
- **Trend Line Overlay**: Linear regression trend line
- **Visual Chart**: Area chart showing score progression
- **Goal Filtering**: Filter by specific goals
- **Annotations**: Add notes/annotations to progress entries
- **Expandable Entries**: Click to see full details
- **Statistics Dashboard**: Shows average, min, max, and overall trend
- **Reference Lines**: Visual indicators at 50% and 80% thresholds
- **Color-Coded Scores**:
  - Green (80-100): Excellent
  - Yellow (60-79): Good
  - Red (0-59): Needs Improvement
- **Export**: Export as image for reports

#### Usage

```jsx
import { ProgressTimeline } from '@/components/timeline';

function ProgressView() {
  const handleAddAnnotation = (logId, text) => {
    console.log('Annotation added:', logId, text);
  };

  return (
    <ProgressTimeline
      goals={goals}
      progressLogs={progressLogs}
      students={students}
      onAddAnnotation={handleAddAnnotation}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `goals` | Array | No | Array of goal objects |
| `progressLogs` | Array | No | Array of progress log objects |
| `students` | Array | No | Array of student objects |
| `onAddAnnotation` | Function | No | Callback when annotation is added |

## Calendar Utilities (`calendarUtils.js`)

Comprehensive utility functions for calendar and IEP deadline tracking.

### Key Functions

#### Calendar Grid Generation
- `generateMonthGrid(date)` - Generate month view grid
- `generateWeekGrid(date)` - Generate week view grid

#### Event Management
- `getEventsForDate(events, date)` - Get all events for a specific date
- `getEventsInRange(events, startDate, endDate)` - Get events in date range
- `createEventFromGoal(goal, student)` - Convert goal to calendar event
- `createEventFromProgressLog(log, goal, student)` - Convert log to event

#### IEP Deadline Tracking
- `calculateIEPDeadline(lastMeetingDate)` - Calculate next IEP deadline
- `getIEPStatus(lastMeetingDate)` - Get status (OK, WARNING, CRITICAL, OVERDUE)
- `getIEPDeadlines(students)` - Get all IEP deadlines with status

#### Recurring Events
- `generateRecurringEvents(event, startDate, endDate)` - Generate recurring instances
- Supports: DAILY, WEEKLY, MONTHLY, YEARLY recurrence

#### iCal Export
- `generateICalString(events)` - Generate iCal format string
- `exportToICal(events, filename)` - Export events to .ics file

#### Reminder System
- `createReminder(event, daysBefore)` - Create reminder for event
- `getUpcomingReminders(events, daysAhead)` - Get reminders for next N days
- Reminder intervals: Same day, 1/3/7/14/30 days before

#### Navigation Helpers
- `getNextMonth(date)` / `getPreviousMonth(date)`
- `getNextWeek(date)` / `getPreviousWeek(date)`
- `getNextDay(date)` / `getPreviousDay(date)`

### IEP Deadline Configuration

```javascript
// IEP meeting must occur at least annually
IEP_ANNUAL_DEADLINE_DAYS = 365

// Warning threshold (60 days before deadline)
IEP_WARNING_THRESHOLD_DAYS = 60

// Critical threshold (30 days before deadline)
IEP_CRITICAL_THRESHOLD_DAYS = 30
```

### Example Usage

```javascript
import {
  generateMonthGrid,
  getIEPDeadlines,
  exportToICal,
  getUpcomingReminders
} from '@/lib/calendarUtils';

// Generate calendar month
const monthGrid = generateMonthGrid(new Date());

// Check IEP deadlines
const deadlines = getIEPDeadlines(students);
deadlines.forEach(deadline => {
  if (deadline.status === 'CRITICAL') {
    console.log(`URGENT: ${deadline.studentName} IEP due in ${deadline.daysUntilDue} days`);
  }
});

// Export events
exportToICal(events, 'my-calendar.ics');

// Get upcoming reminders
const reminders = getUpcomingReminders(events, 7); // Next 7 days
```

## Installation

All dependencies are already in the project:
- `date-fns` - Date manipulation
- `framer-motion` - Animations
- `lucide-react` - Icons
- `recharts` - Charts
- `@dnd-kit/*` - Drag and drop

Optional:
- `html2canvas` - For image export (install with `npm install html2canvas`)

## Styling

Components use Tailwind CSS with the SUMRY color scheme:
- Primary: `#65A39B` (teal)
- Secondary: `#E3866B` (coral)

## Animations

All components use Framer Motion for smooth animations:
- Fade in/out transitions
- Scale animations on hover
- Smooth height transitions
- Stagger animations for lists

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- High contrast colors for readability

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Memoized calculations
- Virtual scrolling for large datasets
- Debounced scroll handlers
- Lazy loading of heavy components

## Examples

See `CalendarDemo.jsx` for a complete integration example showing all three components working together.

## License

Part of the SUMRY IEP tracking system.
