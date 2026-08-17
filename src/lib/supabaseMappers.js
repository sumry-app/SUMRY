/**
 * Translation between the shape the UI works in and the shape the database
 * stores.
 *
 * These are not cosmetic renames. The local store was built for localStorage
 * and is far looser than the schema:
 *
 *   - a student has one `name`; the table has NOT NULL first_name/last_name
 *   - `area` is free text; the column is a Postgres ENUM that rejects anything
 *     outside its eight values (the local default "General" is not one of them)
 *   - baseline/target/score are free text ("85%", "4 of 5"); the columns are
 *     DECIMAL(10,2), and target_value is NOT NULL
 *   - ids are 8-character random strings; primary keys are uuid
 *
 * Anything that cannot be represented is reported through `validateGoal` rather
 * than silently coerced, because a goal whose target quietly became 0 would
 * corrupt every progress calculation built on top of it.
 */

export const GOAL_AREAS = [
  "Reading",
  "Math",
  "Writing",
  "Behavior",
  "Communication",
  "Social Skills",
  "Motor Skills",
  "Other",
];

const AREA_LOOKUP = new Map(GOAL_AREAS.map(a => [a.toLowerCase(), a]));

export const GOAL_STATUSES = ["active", "completed", "discontinued", "draft"];

/** uuid v4, falling back to a manual build where crypto.randomUUID is absent. */
export function newId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const hex = [...b].map(x => x.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last resort - still uuid-shaped so the column accepts it.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value) {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * Gives every record a uuid, rewriting foreign keys to match.
 *
 * Naively replacing ids one collection at a time silently breaks references:
 * a goal still points at the student's old 8-character id. That matters most on
 * import, where every id in the file is legacy, so the mapping is built first
 * and then applied across goals and logs.
 *
 * Records that already carry a uuid keep it, so this is safe to run on every
 * update rather than only on import.
 */
export function ensureUuids(store) {
  const studentIdMap = new Map();
  const goalIdMap = new Map();

  const students = (store?.students ?? []).map(s => {
    if (isUuid(s.id)) return s;
    const id = newId();
    studentIdMap.set(s.id, id);
    return { ...s, id };
  });

  const goals = (store?.goals ?? []).map(g => {
    const studentId = studentIdMap.get(g.studentId) ?? g.studentId;
    if (isUuid(g.id)) {
      return studentId === g.studentId ? g : { ...g, studentId };
    }
    const id = newId();
    goalIdMap.set(g.id, id);
    return { ...g, id, studentId };
  });

  const logs = (store?.logs ?? []).map(l => {
    const goalId = goalIdMap.get(l.goalId) ?? l.goalId;
    if (isUuid(l.id)) {
      return goalId === l.goalId ? l : { ...l, goalId };
    }
    return { ...l, id: newId(), goalId };
  });

  return { ...store, students, goals, logs };
}

/* ------------------------------------------------------------------ names -- */

/**
 * "Maya Thompson" -> { first: "Maya", last: "Thompson" }
 * "Maya van der Berg" -> { first: "Maya", last: "van der Berg" }
 * "Prince" -> { first: "Prince", last: "" }
 *
 * Everything after the first token is treated as the surname, which handles
 * multi-part surnames better than splitting on the last space. Empty string is
 * used rather than null because the column is NOT NULL.
 */
export function splitName(fullName) {
  const parts = String(fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function joinName(first, last) {
  return [first, last].map(p => String(p ?? "").trim()).filter(Boolean).join(" ");
}

/* ----------------------------------------------------------------- values -- */

/**
 * Pulls a number out of the free text the UI allows: "85%", "1,200",
 * "4 of 5" (-> 4), "72 WPM". Returns null when there is no number at all.
 */
export function parseNumeric(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const match = String(value).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;

  const num = Number(match[0]);
  return Number.isFinite(num) ? num : null;
}

/** Maps free-text area onto the ENUM, defaulting to "Other" (not "General"). */
export function coerceArea(area) {
  const key = String(area ?? "").trim().toLowerCase();
  return AREA_LOOKUP.get(key) ?? "Other";
}

export function coerceStatus(status) {
  const key = String(status ?? "").trim().toLowerCase();
  return GOAL_STATUSES.includes(key) ? key : "active";
}

/* --------------------------------------------------------------- students -- */

export function studentToRow(student, { createdBy, organization } = {}) {
  const { first, last } = splitName(student.name);
  return {
    id: isUuid(student.id) ? student.id : newId(),
    first_name: first,
    last_name: last,
    grade_level: student.grade?.trim() || null,
    disability_classification: student.disability?.trim() || null,
    created_by: createdBy ?? null,
    organization: organization ?? null,
    is_active: true,
  };
}

export function rowToStudent(row) {
  return {
    id: row.id,
    name: joinName(row.first_name, row.last_name) || "Unnamed Student",
    grade: row.grade_level ?? "",
    disability: row.disability_classification ?? "",
    createdAt: row.created_at ?? undefined,
  };
}

/* ------------------------------------------------------------------ goals -- */

/**
 * Reports what would stop this goal being stored, so the UI can say so instead
 * of the insert failing opaquely.
 */
export function validateGoal(goal) {
  const errors = [];

  if (!goal.studentId) errors.push("A goal must belong to a student.");
  if (!String(goal.description ?? "").trim()) errors.push("Add a description.");

  if (parseNumeric(goal.target) === null) {
    errors.push(
      `Target must contain a number (got ${JSON.stringify(goal.target ?? "")}).`
    );
  }

  if (goal.baseline !== "" && goal.baseline != null && parseNumeric(goal.baseline) === null) {
    errors.push(`Baseline must contain a number (got ${JSON.stringify(goal.baseline)}).`);
  }

  return errors;
}

export function goalToRow(goal, { createdBy } = {}) {
  const target = parseNumeric(goal.target);
  if (target === null) {
    // Guarded by validateGoal; throwing here prevents a silent 0 slipping in.
    throw new Error(`Goal target is not numeric: ${JSON.stringify(goal.target ?? "")}`);
  }

  return {
    id: isUuid(goal.id) ? goal.id : newId(),
    student_id: goal.studentId,
    area: coerceArea(goal.area),
    description: String(goal.description ?? "").trim(),
    baseline_value: parseNumeric(goal.baseline),
    // The original text is preserved so "85%" or "4 of 5" is not lost when the
    // numeric column keeps only 85 / 4.
    baseline_description: goal.baseline ? String(goal.baseline) : null,
    target_value: target,
    target_description: goal.target ? String(goal.target) : null,
    metric_unit: goal.metric?.trim() || null,
    status: coerceStatus(goal.status),
    ai_generated: Boolean(goal.aiGenerated),
    created_by: createdBy ?? null,
  };
}

export function rowToGoal(row) {
  return {
    id: row.id,
    studentId: row.student_id,
    area: row.area ?? "Other",
    description: row.description ?? "",
    // Prefer the original text so the UI shows what was typed.
    baseline: row.baseline_description ?? (row.baseline_value != null ? String(row.baseline_value) : ""),
    target: row.target_description ?? (row.target_value != null ? String(row.target_value) : ""),
    metric: row.metric_unit ?? "",
    status: row.status ?? "active",
    aiGenerated: Boolean(row.ai_generated),
    createdAt: row.created_at ?? undefined,
  };
}

/* ------------------------------------------------------------------- logs -- */

export function validateLog(log) {
  const errors = [];
  if (!log.goalId) errors.push("A progress entry must belong to a goal.");
  if (parseNumeric(log.score) === null) {
    errors.push(`Score must contain a number (got ${JSON.stringify(log.score ?? "")}).`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(log.dateISO ?? ""))) {
    errors.push("Entry needs a valid date.");
  }
  return errors;
}

export function logToRow(log, { loggedBy } = {}) {
  const score = parseNumeric(log.score);
  if (score === null) {
    throw new Error(`Progress score is not numeric: ${JSON.stringify(log.score ?? "")}`);
  }

  return {
    id: isUuid(log.id) ? log.id : newId(),
    goal_id: log.goalId,
    log_date: String(log.dateISO).slice(0, 10),
    score,
    notes: log.notes?.trim() || null,
    logged_by: loggedBy ?? null,
  };
}

export function rowToLog(row) {
  return {
    id: row.id,
    goalId: row.goal_id,
    dateISO: String(row.log_date).slice(0, 10),
    score: row.score != null ? String(row.score) : "",
    notes: row.notes ?? "",
    accommodationsUsed: [],
  };
}
