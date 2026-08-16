/**
 * Human-readable dates.
 *
 * Progress entries were rendering as raw ISO strings ("2026-08-09"), which is
 * how a database thinks about a date, not how a teacher does. These helpers
 * give the short, scannable form for display and keep the full date available
 * as a tooltip so nothing is actually lost.
 */

const MS_PER_DAY = 86400000;

const shortFormatter = tryFormatter({ month: "short", day: "numeric" });
const shortWithYearFormatter = tryFormatter({ month: "short", day: "numeric", year: "numeric" });
const fullFormatter = tryFormatter({ weekday: "long", month: "long", day: "numeric", year: "numeric" });

function tryFormatter(options) {
  try {
    return new Intl.DateTimeFormat(undefined, options);
  } catch {
    return null;
  }
}

function parse(value) {
  if (!value) return null;
  // Date-only strings are parsed as UTC, which can shift the day backwards for
  // anyone west of Greenwich. Pin them to local midnight instead.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole days between two dates, ignoring the time of day. */
function daysBetween(a, b) {
  const startA = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startB - startA) / MS_PER_DAY);
}

/**
 * "Today", "Yesterday", "4 days ago", then a calendar date once that stops
 * being the more useful description.
 */
export function formatRelativeDate(value, now = new Date()) {
  const date = parse(value);
  if (!date) return "";

  const diff = daysBetween(date, now);

  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff > 1 && diff < 7) return `${diff} days ago`;
  if (diff === 7) return "Last week";
  if (diff > 7 && diff < 28) {
    const weeks = Math.floor(diff / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
  }

  if (diff === -1) return "Tomorrow";
  if (diff < -1 && diff > -7) return `In ${Math.abs(diff)} days`;

  const sameYear = date.getFullYear() === now.getFullYear();
  const formatter = sameYear ? shortFormatter : shortWithYearFormatter;
  return formatter ? formatter.format(date) : value;
}

/** Compact calendar form - "Aug 9". Used where space is tight. */
export function formatShortDate(value, now = new Date()) {
  const date = parse(value);
  if (!date) return "";
  const sameYear = date.getFullYear() === now.getFullYear();
  const formatter = sameYear ? shortFormatter : shortWithYearFormatter;
  return formatter ? formatter.format(date) : value;
}

/** Unabbreviated form, for tooltips and print. */
export function formatFullDate(value) {
  const date = parse(value);
  if (!date) return "";
  return fullFormatter ? fullFormatter.format(date) : value;
}

/** Whole days since the given date; null when unparseable. */
export function daysSince(value, now = new Date()) {
  const date = parse(value);
  if (!date) return null;
  return daysBetween(date, now);
}
