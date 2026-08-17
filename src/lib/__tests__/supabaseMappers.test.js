import { describe, it, expect } from "vitest";
import {
  splitName,
  joinName,
  parseNumeric,
  coerceArea,
  coerceStatus,
  newId,
  isUuid,
  studentToRow,
  rowToStudent,
  goalToRow,
  rowToGoal,
  validateGoal,
  logToRow,
  rowToLog,
  validateLog,
  ensureUuids,
  GOAL_AREAS,
} from "../supabaseMappers";

describe("splitName / joinName", () => {
  it("splits a conventional name", () => {
    expect(splitName("Maya Thompson")).toEqual({ first: "Maya", last: "Thompson" });
  });

  it("keeps multi-part surnames together", () => {
    expect(splitName("Maya van der Berg")).toEqual({ first: "Maya", last: "van der Berg" });
  });

  it("handles a single-token name without producing null", () => {
    // last_name is NOT NULL, so this must be "" rather than null/undefined
    expect(splitName("Prince")).toEqual({ first: "Prince", last: "" });
  });

  it("tolerates empty and messy whitespace", () => {
    expect(splitName("")).toEqual({ first: "", last: "" });
    expect(splitName("   Ada   Lovelace  ")).toEqual({ first: "Ada", last: "Lovelace" });
  });

  it("round-trips", () => {
    const { first, last } = splitName("Maya van der Berg");
    expect(joinName(first, last)).toBe("Maya van der Berg");
  });
});

describe("parseNumeric", () => {
  it("reads the free text the UI accepts", () => {
    expect(parseNumeric("85%")).toBe(85);
    expect(parseNumeric("72 WPM")).toBe(72);
    expect(parseNumeric("4 of 5")).toBe(4);
    expect(parseNumeric("1,200")).toBe(1200);
    expect(parseNumeric("12.5")).toBe(12.5);
    expect(parseNumeric("-3")).toBe(-3);
    expect(parseNumeric(42)).toBe(42);
  });

  it("returns null rather than 0 when there is no number", () => {
    // 0 would silently corrupt every progress calculation
    expect(parseNumeric("mastered")).toBeNull();
    expect(parseNumeric("")).toBeNull();
    expect(parseNumeric(null)).toBeNull();
    expect(parseNumeric(undefined)).toBeNull();
    expect(parseNumeric(NaN)).toBeNull();
  });
});

describe("coerceArea", () => {
  it("passes through valid enum values", () => {
    GOAL_AREAS.forEach(a => expect(coerceArea(a)).toBe(a));
  });

  it("is case and whitespace insensitive", () => {
    expect(coerceArea("  reading ")).toBe("Reading");
    expect(coerceArea("SOCIAL SKILLS")).toBe("Social Skills");
  });

  it('maps the local "General" default onto a real enum value', () => {
    // "General" is not in the ENUM and would be rejected on insert
    expect(coerceArea("General")).toBe("Other");
    expect(GOAL_AREAS).toContain(coerceArea("General"));
  });

  it("falls back to Other for anything unrecognised", () => {
    expect(coerceArea("Underwater Basket Weaving")).toBe("Other");
    expect(coerceArea(undefined)).toBe("Other");
  });
});

describe("coerceStatus", () => {
  it("accepts known statuses and defaults the rest to active", () => {
    expect(coerceStatus("completed")).toBe("completed");
    expect(coerceStatus("ACTIVE")).toBe("active");
    expect(coerceStatus("nonsense")).toBe("active");
    expect(coerceStatus(undefined)).toBe("active");
  });
});

describe("newId / isUuid", () => {
  it("produces uuids the uuid column will accept", () => {
    const id = newId();
    expect(isUuid(id)).toBe(true);
  });

  it("rejects the old 8-character local id format", () => {
    expect(isUuid("a1b2c3d4")).toBe(false);
  });

  it("does not collide across many draws", () => {
    const seen = new Set(Array.from({ length: 500 }, () => newId()));
    expect(seen.size).toBe(500);
  });
});

describe("students", () => {
  it("maps to a row with both name columns populated", () => {
    const row = studentToRow(
      { id: "a1b2c3d4", name: "Maya Thompson", grade: "3rd", disability: "SLD" },
      { createdBy: "user-1", organization: "Springfield" }
    );
    expect(row.first_name).toBe("Maya");
    expect(row.last_name).toBe("Thompson");
    expect(row.grade_level).toBe("3rd");
    expect(row.created_by).toBe("user-1");
    // the legacy id must be replaced, not passed through
    expect(isUuid(row.id)).toBe(true);
    expect(row.id).not.toBe("a1b2c3d4");
  });

  it("preserves an id that is already a uuid", () => {
    const id = newId();
    expect(studentToRow({ id, name: "A B" }).id).toBe(id);
  });

  it("round-trips back into the UI shape", () => {
    const row = studentToRow({ name: "Eli Carter", grade: "5th", disability: "ASD" });
    const student = rowToStudent({ ...row, created_at: "2026-01-01T00:00:00Z" });
    expect(student.name).toBe("Eli Carter");
    expect(student.grade).toBe("5th");
    expect(student.disability).toBe("ASD");
  });

  it("never renders an empty name", () => {
    expect(rowToStudent({ id: "x", first_name: "", last_name: "" }).name).toBe("Unnamed Student");
  });
});

describe("goals", () => {
  const base = {
    studentId: "s1",
    area: "Reading",
    description: "Read 80 WPM",
    baseline: "45",
    target: "80",
    metric: "WPM",
  };

  it("maps text values into numeric columns", () => {
    const row = goalToRow(base, { createdBy: "u1" });
    expect(row.baseline_value).toBe(45);
    expect(row.target_value).toBe(80);
    expect(row.metric_unit).toBe("WPM");
    expect(row.area).toBe("Reading");
  });

  it("keeps the original text so units are not lost", () => {
    const row = goalToRow({ ...base, target: "85%", baseline: "50%" });
    expect(row.target_value).toBe(85);
    expect(row.target_description).toBe("85%");
    expect(row.baseline_description).toBe("50%");
  });

  it("refuses to invent a target rather than storing 0", () => {
    expect(() => goalToRow({ ...base, target: "mastery" })).toThrow(/not numeric/i);
  });

  it("allows a missing baseline, which is nullable", () => {
    const row = goalToRow({ ...base, baseline: "" });
    expect(row.baseline_value).toBeNull();
  });

  it("round-trips, preferring the original text", () => {
    const row = goalToRow({ ...base, target: "85%" });
    const goal = rowToGoal(row);
    expect(goal.target).toBe("85%");
    expect(goal.metric).toBe("WPM");
    expect(goal.studentId).toBe("s1");
  });
});

describe("validateGoal", () => {
  const ok = { studentId: "s1", description: "Read more", target: "80", baseline: "45" };

  it("passes a usable goal", () => {
    expect(validateGoal(ok)).toEqual([]);
  });

  it("explains a non-numeric target instead of failing at insert time", () => {
    const errors = validateGoal({ ...ok, target: "mastery" });
    expect(errors.join(" ")).toMatch(/target must contain a number/i);
  });

  it("flags a non-numeric baseline but tolerates a blank one", () => {
    expect(validateGoal({ ...ok, baseline: "lots" }).join(" ")).toMatch(/baseline/i);
    expect(validateGoal({ ...ok, baseline: "" })).toEqual([]);
  });

  it("requires a student and a description", () => {
    expect(validateGoal({ ...ok, studentId: null }).join(" ")).toMatch(/student/i);
    expect(validateGoal({ ...ok, description: "  " }).join(" ")).toMatch(/description/i);
  });
});

describe("logs", () => {
  it("maps dateISO onto log_date and score onto a numeric column", () => {
    const row = logToRow(
      { goalId: "g1", dateISO: "2026-08-09", score: "65", notes: "Good session" },
      { loggedBy: "u1" }
    );
    expect(row.log_date).toBe("2026-08-09");
    expect(row.score).toBe(65);
    expect(row.goal_id).toBe("g1");
    expect(row.logged_by).toBe("u1");
  });

  it("refuses a non-numeric score", () => {
    expect(() => logToRow({ goalId: "g1", dateISO: "2026-08-09", score: "great" }))
      .toThrow(/not numeric/i);
  });

  it("round-trips", () => {
    const row = logToRow({ goalId: "g1", dateISO: "2026-08-09", score: "65" });
    const log = rowToLog(row);
    expect(log.dateISO).toBe("2026-08-09");
    expect(log.score).toBe("65");
    expect(log.goalId).toBe("g1");
  });

  it("validates date and score", () => {
    expect(validateLog({ goalId: "g1", dateISO: "nope", score: "5" }).join(" ")).toMatch(/date/i);
    expect(validateLog({ goalId: "g1", dateISO: "2026-08-09", score: "x" }).join(" ")).toMatch(/score/i);
    expect(validateLog({ goalId: "g1", dateISO: "2026-08-09", score: "5" })).toEqual([]);
  });
});

describe("ensureUuids", () => {
  it("rewrites foreign keys when parent ids are replaced", () => {
    const legacy = {
      students: [{ id: "abc12345", name: "Maya Thompson" }],
      goals: [{ id: "def67890", studentId: "abc12345", target: "80" }],
      logs: [{ id: "ghi11111", goalId: "def67890", score: "5" }],
    };

    const out = ensureUuids(legacy);

    expect(isUuid(out.students[0].id)).toBe(true);
    expect(isUuid(out.goals[0].id)).toBe(true);
    expect(isUuid(out.logs[0].id)).toBe(true);

    // the graph must still hang together
    expect(out.goals[0].studentId).toBe(out.students[0].id);
    expect(out.logs[0].goalId).toBe(out.goals[0].id);
  });

  it("leaves records that already have uuids untouched", () => {
    const sid = newId();
    const gid = newId();
    const input = {
      students: [{ id: sid, name: "A B" }],
      goals: [{ id: gid, studentId: sid, target: "1" }],
      logs: [],
    };
    const out = ensureUuids(input);
    expect(out.students[0].id).toBe(sid);
    expect(out.goals[0].id).toBe(gid);
    expect(out.goals[0].studentId).toBe(sid);
  });

  it("handles a mixed store, as adding one student to imported data would", () => {
    const sid = newId();
    const out = ensureUuids({
      students: [{ id: sid, name: "Existing" }, { id: "legacy01", name: "New One" }],
      goals: [{ id: "legacy02", studentId: "legacy01", target: "5" }],
      logs: [],
    });
    expect(out.students[0].id).toBe(sid);
    expect(isUuid(out.students[1].id)).toBe(true);
    expect(out.goals[0].studentId).toBe(out.students[1].id);
  });

  it("tolerates empty and missing collections", () => {
    expect(ensureUuids({}).students).toEqual([]);
    expect(ensureUuids({}).goals).toEqual([]);
    expect(ensureUuids({}).logs).toEqual([]);
  });
});
