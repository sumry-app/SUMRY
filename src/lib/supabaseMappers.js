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

/* ---------------------------------------------------------- measurements -- */

/**
 * The seven formats a goal can be measured in. This list is duplicated in the
 * database as the named check constraints `goals_measurement_type_check` and
 * `progress_logs_measurement_type_check` (migration 003); an insert outside it
 * is rejected, so the two must stay in step.
 */
export const MEASUREMENT_TYPES = [
  "percent",
  "trials",
  "rate",
  "duration",
  "rubric",
  "frequency",
  "level",
];

/**
 * Anything unrecognised becomes "percent", the format most IEP goals use.
 * Coercing rather than throwing matters: this runs on every save, and a typo
 * in a measurement picker should not make the whole goal un-saveable.
 */
export function coerceMeasurementType(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return MEASUREMENT_TYPES.includes(key) ? key : "percent";
}

/**
 * Reads a type out of the free text a goal already carries, so goals written
 * before measurement types existed are not all stored as bare percentages.
 * Mirrors the SQL backfill in migration 003 exactly - the two must agree, or a
 * legacy goal would get one type on save and another on backfill.
 *
 * The order matters: "80% on 4 of 5 trials" is a percent goal, and "words
 * correct per minute" contains the word "minute", so rate is tested before
 * duration.
 */
export function inferMeasurementType(goal) {
  const target = String(goal?.targetDescription ?? "");
  const unit = String(goal?.metricUnit ?? "").toLowerCase();

  if (target.includes("%") || unit.includes("%")) return "percent";
  if (/^\s*\d+(?:\.\d+)?\s+of\s+\d+(?:\.\d+)?\s*$/i.test(target)) return "trials";
  if (
    unit.includes("per minute") ||
    unit.includes("/min") ||
    unit.includes("wpm") ||
    unit.includes("words correct")
  ) {
    return "rate";
  }
  if (unit.includes("minute") || unit.includes("duration")) return "duration";
  return "percent";
}

/**
 * Keeps only the scale settings the JSONB column is documented to hold.
 * Unknown keys are dropped instead of stored: JSONB accepts anything, and a
 * config that accumulates shape drift is one later reader cannot trust.
 * Always returns an object, never null/undefined, so `goal.measurementConfig`
 * is safe to read directly.
 */
export function normalizeMeasurementConfig(cfg) {
  const out = {};
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) return out;

  for (const key of ["trialTotal", "rubricScale"]) {
    const raw = cfg[key];
    if (raw === "" || raw === null || raw === undefined) continue;
    const num = Number(raw);
    if (Number.isFinite(num)) out[key] = num;
  }

  for (const key of ["rateUnit", "frequencyUnit"]) {
    const text = typeof cfg[key] === "string" ? cfg[key].trim() : "";
    if (text) out[key] = text;
  }

  const direction = String(cfg.direction ?? "").trim().toLowerCase();
  if (direction === "increase" || direction === "decrease") out.direction = direction;

  return out;
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
    // An explicit pick always wins; inference covers goals written before the
    // measurement picker existed, so a "4 of 5" goal is not saved as a bare
    // percent.
    measurement_type: coerceMeasurementType(
      goal.measurementType ??
        inferMeasurementType({
          targetDescription: goal.target,
          baselineDescription: goal.baseline,
          metricUnit: goal.metric,
        })
    ),
    measurement_config: normalizeMeasurementConfig(goal.measurementConfig),
    // start_date/end_date already existed in the schema but were never written
    // from the UI; the progress report reads them for the service window.
    start_date: goal.startDate ? String(goal.startDate).slice(0, 10) : null,
    end_date: goal.targetDate ? String(goal.targetDate).slice(0, 10) : null,
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
    // Prefer the stored type; rows written before migration 003 have none, so
    // infer from the same free text the backfill reads.
    measurementType:
      row.measurement_type ??
      inferMeasurementType({
        targetDescription: row.target_description,
        baselineDescription: row.baseline_description,
        metricUnit: row.metric_unit,
      }),
    measurementConfig: normalizeMeasurementConfig(row.measurement_config),
    startDate: row.start_date ?? "",
    targetDate: row.end_date ?? "",
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
    // The teacher's own words, kept next to the parsed score: the trendline
    // reads score, the report prints raw_value when it is present.
    raw_value: log.rawValue?.trim() || null,
    // A snapshot, not a reference: editing the goal later must not relabel how
    // earlier data points were measured.
    measurement_type: log.measurementType ? coerceMeasurementType(log.measurementType) : null,
    context: log.context?.trim() || null,
    evidence_note: log.evidenceNote?.trim() || null,
    accommodations_used: Array.isArray(log.accommodationsUsed)
      ? log.accommodationsUsed.map(s => String(s).trim()).filter(Boolean)
      : [],
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
    // rawValue is null on rows logged before migration 003; the UI falls back
    // to displaying score rather than inventing wording.
    rawValue: row.raw_value ?? null,
    measurementType: row.measurement_type ?? null,
    context: row.context ?? "",
    evidenceNote: row.evidence_note ?? "",
    accommodationsUsed: Array.isArray(row.accommodations_used) ? row.accommodations_used : [],
  };
}
