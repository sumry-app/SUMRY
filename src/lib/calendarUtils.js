import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  addWeeks,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  isFuture,
  parseISO,
  differenceInDays,
  addYears,
  startOfDay,
  endOfDay
} from 'date-fns';

/**
 * Calendar Utilities
 * Comprehensive calendar and IEP deadline tracking utilities
 */

// Event Types
export const EVENT_TYPES = {
  IEP_MEETING: 'iep_meeting',
  GOAL_DEADLINE: 'goal_deadline',
  PROGRESS_LOG: 'progress_log',
  ASSESSMENT: 'assessment',
  PARENT_MEETING: 'parent_meeting',
  REMINDER: 'reminder',
  CUSTOM: 'custom'
};

// Event Colors
export const EVENT_COLORS = {
  [EVENT_TYPES.IEP_MEETING]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  [EVENT_TYPES.GOAL_DEADLINE]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  [EVENT_TYPES.PROGRESS_LOG]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  [EVENT_TYPES.ASSESSMENT]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  [EVENT_TYPES.PARENT_MEETING]: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  [EVENT_TYPES.REMINDER]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  [EVENT_TYPES.CUSTOM]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' }
};

/**
 * Generate calendar month grid
 * Returns array of weeks, each containing 7 days
 */
export function generateMonthGrid(date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const weeks = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        date: currentDate,
        isCurrentMonth: isSameMonth(currentDate, date),
        isToday: isToday(currentDate),
        isPast: isPast(currentDate) && !isToday(currentDate),
        isFuture: isFuture(currentDate)
      });
      currentDate = addDays(currentDate, 1);
    }
    weeks.push(week);
  }

  return weeks;
}

/**
 * Generate week view
 * Returns 7 days starting from the given date
 */
export function generateWeekGrid(date) {
  const weekStart = startOfWeek(date);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = addDays(weekStart, i);
    days.push({
      date: currentDate,
      isToday: isToday(currentDate),
      isPast: isPast(currentDate) && !isToday(currentDate),
      isFuture: isFuture(currentDate)
    });
  }

  return days;
}

/**
 * Get events for a specific date
 */
export function getEventsForDate(events, date) {
  return events.filter(event => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, date);
  });
}

/**
 * Get events for a date range
 */
export function getEventsInRange(events, startDate, endDate) {
  return events.filter(event => {
    const eventDate = parseISO(event.date);
    return eventDate >= startOfDay(startDate) && eventDate <= endOfDay(endDate);
  });
}

/**
 * Create event from goal
 */
export function createEventFromGoal(goal, student) {
  if (!goal.target_date) return null;

  return {
    id: `goal-${goal.id}`,
    type: EVENT_TYPES.GOAL_DEADLINE,
    title: goal.description,
    description: `Goal deadline for ${student?.name || 'student'}`,
    date: goal.target_date,
    studentId: goal.student_id,
    goalId: goal.id,
    metadata: {
      goalType: goal.goal_type,
      currentValue: goal.current_value,
      targetValue: goal.target_value,
      status: goal.status
    }
  };
}

/**
 * Create event from progress log
 */
export function createEventFromProgressLog(log, goal, student) {
  return {
    id: `log-${log.id}`,
    type: EVENT_TYPES.PROGRESS_LOG,
    title: 'Progress Entry',
    description: log.notes || `Progress logged for ${goal?.description || 'goal'}`,
    date: log.date,
    studentId: goal?.student_id,
    goalId: log.goal_id,
    metadata: {
      score: log.score,
      notes: log.notes,
      goalDescription: goal?.description
    }
  };
}

/**
 * IEP Deadline Tracking
 */

// IEP meeting must occur at least annually
export const IEP_ANNUAL_DEADLINE_DAYS = 365;
// Warning threshold (60 days before deadline)
export const IEP_WARNING_THRESHOLD_DAYS = 60;
// Critical threshold (30 days before deadline)
export const IEP_CRITICAL_THRESHOLD_DAYS = 30;

/**
 * Calculate next IEP meeting deadline
 */
export function calculateIEPDeadline(lastMeetingDate) {
  if (!lastMeetingDate) return null;

  const lastDate = typeof lastMeetingDate === 'string' ? parseISO(lastMeetingDate) : lastMeetingDate;
  return addYears(lastDate, 1);
}

/**
 * Get IEP status (OK, WARNING, CRITICAL, OVERDUE)
 */
export function getIEPStatus(lastMeetingDate) {
  if (!lastMeetingDate) return { status: 'UNKNOWN', daysUntilDue: null };

  const deadline = calculateIEPDeadline(lastMeetingDate);
  const today = new Date();
  const daysUntilDue = differenceInDays(deadline, today);

  if (daysUntilDue < 0) {
    return { status: 'OVERDUE', daysUntilDue, deadline };
  } else if (daysUntilDue <= IEP_CRITICAL_THRESHOLD_DAYS) {
    return { status: 'CRITICAL', daysUntilDue, deadline };
  } else if (daysUntilDue <= IEP_WARNING_THRESHOLD_DAYS) {
    return { status: 'WARNING', daysUntilDue, deadline };
  } else {
    return { status: 'OK', daysUntilDue, deadline };
  }
}

/**
 * Get all IEP deadlines for students
 */
export function getIEPDeadlines(students) {
  return students
    .filter(student => student.iep_last_meeting)
    .map(student => {
      const status = getIEPStatus(student.iep_last_meeting);
      return {
        studentId: student.id,
        studentName: student.name,
        lastMeeting: student.iep_last_meeting,
        deadline: status.deadline,
        daysUntilDue: status.daysUntilDue,
        status: status.status
      };
    })
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
}

/**
 * Recurring Event Support
 */

export const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

/**
 * Generate recurring event instances
 */
export function generateRecurringEvents(event, startDate, endDate) {
  if (!event.recurrence || event.recurrence.type === RECURRENCE_TYPES.NONE) {
    return [event];
  }

  const instances = [];
  const eventDate = parseISO(event.date);
  let currentDate = eventDate;

  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      instances.push({
        ...event,
        id: `${event.id}-${format(currentDate, 'yyyy-MM-dd')}`,
        date: format(currentDate, 'yyyy-MM-dd'),
        isRecurring: true,
        originalEventId: event.id
      });
    }

    switch (event.recurrence.type) {
      case RECURRENCE_TYPES.DAILY:
        currentDate = addDays(currentDate, event.recurrence.interval || 1);
        break;
      case RECURRENCE_TYPES.WEEKLY:
        currentDate = addWeeks(currentDate, event.recurrence.interval || 1);
        break;
      case RECURRENCE_TYPES.MONTHLY:
        currentDate = addMonths(currentDate, event.recurrence.interval || 1);
        break;
      case RECURRENCE_TYPES.YEARLY:
        currentDate = addYears(currentDate, event.recurrence.interval || 1);
        break;
      default:
        return instances;
    }

    // Prevent infinite loops
    if (instances.length > 1000) break;
  }

  return instances;
}

/**
 * iCal Export
 */

/**
 * Generate iCal format string
 */
export function generateICalString(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SUMRY//IEP Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SUMRY IEP Calendar',
    'X-WR-TIMEZONE:America/New_York'
  ];

  events.forEach(event => {
    const eventDate = parseISO(event.date);
    const dateStr = format(eventDate, "yyyyMMdd'T'HHmmss");
    const uid = event.id || `${Date.now()}-${Math.random()}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}@sumry.app`);
    lines.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`);
    lines.push(`DTSTART:${dateStr}`);
    lines.push(`SUMMARY:${escapeICalText(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICalText(event.description)}`);
    }

    if (event.type) {
      lines.push(`CATEGORIES:${event.type.toUpperCase()}`);
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Escape special characters for iCal format
 */
function escapeICalText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Export events to iCal file
 */
export function exportToICal(events, filename = 'sumry-calendar.ics') {
  const icalString = generateICalString(events);
  const blob = new Blob([icalString], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Reminder System
 */

export const REMINDER_INTERVALS = {
  SAME_DAY: 0,
  ONE_DAY_BEFORE: 1,
  THREE_DAYS_BEFORE: 3,
  ONE_WEEK_BEFORE: 7,
  TWO_WEEKS_BEFORE: 14,
  ONE_MONTH_BEFORE: 30
};

/**
 * Create reminder for event
 */
export function createReminder(event, daysBefore = REMINDER_INTERVALS.ONE_DAY_BEFORE) {
  const eventDate = parseISO(event.date);
  const reminderDate = addDays(eventDate, -daysBefore);

  return {
    id: `reminder-${event.id}-${daysBefore}`,
    eventId: event.id,
    title: `Reminder: ${event.title}`,
    description: event.description,
    date: format(reminderDate, 'yyyy-MM-dd'),
    type: EVENT_TYPES.REMINDER,
    metadata: {
      originalEventDate: event.date,
      daysBefore,
      originalEvent: event
    }
  };
}

/**
 * Get upcoming reminders
 */
export function getUpcomingReminders(events, daysAhead = 7) {
  const today = new Date();
  const endDate = addDays(today, daysAhead);
  const reminders = [];

  events.forEach(event => {
    const eventDate = parseISO(event.date);
    if (eventDate > today && eventDate <= endDate) {
      const daysUntil = differenceInDays(eventDate, today);

      // Add reminders based on how far away the event is
      if (daysUntil <= 1) {
        reminders.push(createReminder(event, REMINDER_INTERVALS.SAME_DAY));
      } else if (daysUntil <= 3) {
        reminders.push(createReminder(event, REMINDER_INTERVALS.ONE_DAY_BEFORE));
      } else if (daysUntil <= 7) {
        reminders.push(createReminder(event, REMINDER_INTERVALS.THREE_DAYS_BEFORE));
      }
    }
  });

  return reminders.sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    return dateA - dateB;
  });
}

/**
 * Navigation helpers
 */
export function getNextMonth(date) {
  return addMonths(date, 1);
}

export function getPreviousMonth(date) {
  return addMonths(date, -1);
}

export function getNextWeek(date) {
  return addWeeks(date, 1);
}

export function getPreviousWeek(date) {
  return addWeeks(date, -1);
}

export function getNextDay(date) {
  return addDays(date, 1);
}

export function getPreviousDay(date) {
  return addDays(date, -1);
}

/**
 * Format helpers
 */
export function formatEventDate(date, includeTime = false) {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  if (includeTime) {
    return format(parsedDate, 'MMM d, yyyy h:mm a');
  }
  return format(parsedDate, 'MMM d, yyyy');
}

export function formatEventTime(date) {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'h:mm a');
}

/**
 * Validation helpers
 */
export function isValidEvent(event) {
  return !!(
    event &&
    event.title &&
    event.date &&
    event.type &&
    Object.values(EVENT_TYPES).includes(event.type)
  );
}

export function canRescheduleEvent(event) {
  // Some events might be locked from rescheduling
  return !event.locked && !isPast(parseISO(event.date));
}
