import { describe, it, expect } from "vitest";
import {
  formatRelativeDate,
  formatShortDate,
  formatFullDate,
  daysSince,
} from "../dates";

// Fixed reference point so these never drift with the wall clock.
const NOW = new Date(2026, 7, 20, 14, 30); // 20 Aug 2026, local time

const iso = (y, m, d) =>
  `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

describe("formatRelativeDate", () => {
  it("labels today and yesterday", () => {
    expect(formatRelativeDate(iso(2026, 8, 20), NOW)).toBe("Today");
    expect(formatRelativeDate(iso(2026, 8, 19), NOW)).toBe("Yesterday");
  });

  it("counts days within the last week", () => {
    expect(formatRelativeDate(iso(2026, 8, 18), NOW)).toBe("2 days ago");
    expect(formatRelativeDate(iso(2026, 8, 15), NOW)).toBe("5 days ago");
  });

  it("switches to weeks, with correct pluralisation", () => {
    expect(formatRelativeDate(iso(2026, 8, 13), NOW)).toBe("Last week");
    // 10 days ago floors to one week - must not read "1 weeks ago"
    expect(formatRelativeDate(iso(2026, 8, 10), NOW)).toBe("1 week ago");
    expect(formatRelativeDate(iso(2026, 8, 4), NOW)).toBe("2 weeks ago");
  });

  it("falls back to a calendar date beyond four weeks", () => {
    expect(formatRelativeDate(iso(2026, 6, 1), NOW)).toMatch(/Jun/);
  });

  it("includes the year once it differs from the current one", () => {
    expect(formatRelativeDate(iso(2024, 3, 9), NOW)).toMatch(/2024/);
  });

  it("handles future dates", () => {
    expect(formatRelativeDate(iso(2026, 8, 21), NOW)).toBe("Tomorrow");
    expect(formatRelativeDate(iso(2026, 8, 23), NOW)).toBe("In 3 days");
  });

  it("returns an empty string for unusable input", () => {
    expect(formatRelativeDate("", NOW)).toBe("");
    expect(formatRelativeDate(null, NOW)).toBe("");
    expect(formatRelativeDate("not-a-date", NOW)).toBe("");
  });

  it("treats a date-only string as local, not UTC", () => {
    // Parsed as UTC this would land on the 19th for anyone west of Greenwich
    // and wrongly render as "Yesterday".
    expect(formatRelativeDate("2026-08-20", NOW)).toBe("Today");
  });
});

describe("formatShortDate", () => {
  it("omits the year within the current year", () => {
    expect(formatShortDate(iso(2026, 8, 9), NOW)).toBe("Aug 9");
  });

  it("includes the year otherwise", () => {
    expect(formatShortDate(iso(2025, 8, 9), NOW)).toMatch(/2025/);
  });
});

describe("formatFullDate", () => {
  it("spells the date out for tooltips", () => {
    const out = formatFullDate(iso(2026, 8, 9));
    expect(out).toMatch(/August/);
    expect(out).toMatch(/2026/);
  });
});

describe("daysSince", () => {
  it("counts whole days regardless of time of day", () => {
    expect(daysSince(iso(2026, 8, 20), NOW)).toBe(0);
    expect(daysSince(iso(2026, 8, 6), NOW)).toBe(14);
  });

  it("returns null when the value cannot be parsed", () => {
    expect(daysSince("nope", NOW)).toBeNull();
  });
});
