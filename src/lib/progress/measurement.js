/**
 * Measurement-aware progress values.
 *
 * A goal is not always a percentage. Teachers record "4 of 5 trials",
 * "72 words correct per minute", "12 minutes of sustained attention",
 * "3 of 4 on the writing rubric". Storing all of that as one DECIMAL - which is
 * what the old progress_logs table did - destroys the meaning: 7 of 10 is worse
 * than 4 of 5, and 12 minutes is not comparable to 85%.
 *
 * Every value therefore carries two numbers:
 *
 *   value  what the teacher typed ("4" in "4 of 5")
 *   score  the canonical value on the goal's own scale, which is what the
 *          trendline, the aim line and every cross-goal comparison use
 *
 * For TRIALS the canonical scale is percent correct, because a raw count of
 * correct trials is not comparable between sessions where a different number
 * of trials was run. For every other type the two numbers are the same.
 *
 * The canonical scale is also what the database stores in goals.baseline_value,
 * goals.target_value and progress_logs.score, so a goal's baseline, target and
 * every one of its data points always live on one axis.
 */

/**
 * Mirrors supabaseMappers.MEASUREMENT_TYPES. Kept as its own copy so this
 * module has no database dependency, and pinned by a test in
 * __tests__/measurement.test.js so the two can never drift apart.
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

export const MEASUREMENT_META = {
  percent: {
    label: "Percent",
    unit: "%",
    short: "%",
    decimals: 0,
    placeholder: "e.g. 85",
    hint: "A score out of 100, as written in the IEP.",
  },
  trials: {
    label: "Trials correct",
    unit: "% correct",
    short: "%",
    decimals: 0,
    placeholder: "e.g. 4 of 5",
    hint: "Correct trials out of trials run. Stored as percent correct so 4 of 5 and 7 of 10 can be compared.",
  },
  rate: {
    label: "Rate",
    unit: "per minute",
    short: "per min",
    decimals: 1,
    placeholder: "e.g. 72",
    hint: "How many per minute, such as words read correctly per minute.",
  },
  duration: {
    label: "Duration",
    unit: "minutes",
    short: "min",
    decimals: 1,
    placeholder: "e.g. 12",
    hint: "How long the behaviour lasted, in minutes.",
  },
  rubric: {
    label: "Rubric score",
    unit: "points",
    short: "pts",
    decimals: 0,
    placeholder: "e.g. 3",
    hint: "A score on a rubric. Set the top of the scale on the goal.",
  },
  frequency: {
    label: "Frequency",
    unit: "times",
    short: "times",
    decimals: 0,
    placeholder: "e.g. 6",
    hint: "A count over the session, such as prompts needed.",
  },
  level: {
    label: "Prompt level",
    unit: "level",
    short: "level",
    decimals: 0,
    placeholder: "e.g. 2",
    hint: "1 = independent, higher numbers mean more support.",
  },
};

const CONFIG_KEYS = ["trialTotal", "rateUnit", "rubricScale", "frequencyUnit", "direction"];

const TRIALS_RE = /^\s*(\d+(?:\.\d+)?)\s*(?:of|\/|out\s+of)\s*(\d+(?:\.\d+)?)\s*$/i;
const NUMBER_RE = /-?\d+(?:\.\d+)?/;

/* ---------------------------------------------------------------- basics -- */

export function isMeasurementType(value) {
  return MEASUREMENT_TYPES.includes(value);
}

/** Anything unrecognised becomes percent, the format most IEP goals use. */
export function measurementTypeOf(value) {
  const key = String(value ?? "").trim().toLowerCase();
  return isMeasurementType(key) ? key : "percent";
}

export function measurementMeta(type) {
  return MEASUREMENT_META[measurementTypeOf(type)];
}

export function roundTo(value, decimals) {
  if (!Number.isFinite(value)) return value;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/* ---------------------------------------------------------------- config -- */

/** Keeps only known keys and drops empties; always returns an object. */
export function normalizeGoalConfig(config) {
  const out = {};
  if (!config || typeof config !== "object") return out;

  for (const key of CONFIG_KEYS) {
    const value = config[key];
    if (value === null || value === undefined || value === "") continue;

    if (key === "direction") {
      if (value === "increase" || value === "decrease") out.direction = value;
      continue;
    }
    if (key === "rateUnit" || key === "frequencyUnit") {
      out[key] = String(value).trim();
      continue;
    }
    const num = Number(value);
    if (Number.isFinite(num) && num > 0) out[key] = num;
  }

  return out;
}

/**
 * A prompt level or a count of problem behaviours goes DOWN as the student
 * improves. Everything else goes up. Teachers override this per goal when the
 * measurement is unusual.
 */
export function goalDirection(goal) {
  const config = normalizeGoalConfig(goal?.measurementConfig);
  if (config.direction) return config.direction;
  return measurementTypeOf(goal?.measurementType) === "level" ? "decrease" : "increase";
}

/** For the goal form's radio buttons, where an unset value has to become one. */
export function coerceDirectionFallback(value) {
  return value === "decrease" ? "decrease" : "increase";
}

/* --------------------------------------------------------------- parsing -- */

/**
 * Turns what a teacher typed into a canonical score.
 *
 * Always returns { ok, score, value, error, display } and never throws, so a
 * half-typed value in a form does not take the view down with it.
 */
export function parseMeasurement(text, type, config = {}) {
  const kind = measurementTypeOf(type);
  const settings = normalizeGoalConfig(config);
  const raw = text === null || text === undefined ? "" : String(text).trim();

  if (!raw) {
    return { ok: false, score: null, value: null, error: "Enter a value.", display: "" };
  }

  if (kind === "trials") {
    const trials = raw.match(TRIALS_RE);
    if (trials) {
      const correct = Number(trials[1]);
      const total = Number(trials[2]);
      if (total <= 0) {
        return { ok: false, score: null, value: correct, error: "Trials run must be more than zero.", display: raw };
      }
      if (correct > total) {
        return {
          ok: false,
          score: null,
          value: correct,
          error: "Correct trials cannot be more than trials run.",
          display: raw,
        };
      }
      const score = (correct / total) * 100;
      return { ok: true, score, value: correct, error: null, display: `${correct} of ${total} (${roundTo(score, 0)}%)` };
    }
    // A bare number on a trials goal is read as percent correct.
    const bare = raw.match(NUMBER_RE);
    if (!bare) {
      return { ok: false, score: null, value: null, error: "Enter trials as \"4 of 5\".", display: raw };
    }
    const score = Number(bare[0]);
    return { ok: true, score, value: score, error: null, display: formatMeasurement(score, kind, settings) };
  }

  const match = raw.match(NUMBER_RE);
  if (!match) {
    return { ok: false, score: null, value: null, error: `Enter a number of ${measurementMeta(kind).unit}.`, display: raw };
  }

  const value = Number(match[0]);

  if (kind === "percent" && (value < 0 || value > 100)) {
    return { ok: false, score: null, value, error: "A percent must be between 0 and 100.", display: raw };
  }
  if (kind !== "percent" && value < 0) {
    return { ok: false, score: null, value, error: "This cannot be a negative number.", display: raw };
  }
  if (kind === "rubric" && settings.rubricScale && value > settings.rubricScale) {
    return {
      ok: false,
      score: null,
      value,
      error: `This rubric tops out at ${settings.rubricScale}.`,
      display: raw,
    };
  }

  return { ok: true, score: value, value, error: null, display: formatMeasurement(value, kind, settings) };
}

/* -------------------------------------------------------------- display --- */

/** Canonical score -> the string a teacher or parent should see. */
export function formatMeasurement(score, type, config = {}) {
  if (score === null || score === undefined || !Number.isFinite(Number(score))) return "";
  const kind = measurementTypeOf(type);
  const settings = normalizeGoalConfig(config);
  const number = Number(score);
  const meta = measurementMeta(kind);

  switch (kind) {
    case "percent":
      return `${roundTo(number, meta.decimals)}%`;
    case "trials":
      return `${roundTo(number, 0)}% correct`;
    case "rate":
      return `${roundTo(number, meta.decimals)} ${settings.rateUnit || meta.unit}`;
    case "duration":
      return `${roundTo(number, meta.decimals)} min`;
    case "rubric":
      return settings.rubricScale
        ? `${roundTo(number, meta.decimals)}/${settings.rubricScale} pts`
        : `${roundTo(number, meta.decimals)} pts`;
    case "frequency":
      return `${roundTo(number, meta.decimals)} ${settings.frequencyUnit || meta.unit}`;
    case "level":
      return `Level ${roundTo(number, meta.decimals)}`;
    default:
      return String(number);
  }
}

/** What to print in a table row: the typed value, with the canonical score. */
export function formatRecorded(log, goal) {
  const type = measurementTypeOf(log?.measurementType || goal?.measurementType);
  const config = normalizeGoalConfig(goal?.measurementConfig);
  const raw = log?.rawValue;
  if (raw && String(raw).trim()) {
    const parsed = parseMeasurement(raw, type, config);
    if (parsed.ok) return parsed.display;
    return String(raw).trim();
  }
  const score = Number(log?.score);
  return Number.isFinite(score) ? formatMeasurement(score, type, config) : "";
}

/**
 * True when the raw text already says everything the canonical score says
 * (i.e. printing both would just repeat the number twice).
 */
export function isRedundantDisplay(display, type) {
  const kind = measurementTypeOf(type);
  return kind === "percent" || kind === "trials";
}

/* ------------------------------------------------------------- goal scale -- */

/**
 * Canonical baseline or target for a goal, read from the text the teacher
 * typed. Falls back to the numeric column via rowToGoal's own fallback.
 */
export function goalValue(goal, key) {
  if (!goal) return null;
  const type = measurementTypeOf(goal.measurementType);
  const config = normalizeGoalConfig(goal.measurementConfig);
  const text = key === "baseline" ? goal.baseline : goal.target;
  const parsed = parseMeasurement(text, type, config);
  return parsed.ok ? parsed.score : null;
}

/** "4 of 5 (80%)" for a trials goal, "85%" for a percent goal. */
export function formatGoalPoint(goal, key) {
  const type = measurementTypeOf(goal.measurementType);
  const config = normalizeGoalConfig(goal.measurementConfig);
  const text = key === "baseline" ? goal.baseline : goal.target;
  const parsed = parseMeasurement(text, type, config);
  if (parsed.ok) return parsed.display;
  return text ? String(text).trim() : "";
}

/** Human description of what the goal measures, used in reports and headers. */
export function describeMeasurement(goal) {
  const type = measurementTypeOf(goal?.measurementType);
  const config = normalizeGoalConfig(goal?.measurementConfig);
  const meta = measurementMeta(type);
  if (type === "rate" && config.rateUnit && config.rateUnit !== meta.unit) {
    return `${config.rateUnit}`;
  }
  if (type === "rubric" && config.rubricScale) {
    return `${meta.label} (0-${config.rubricScale})`;
  }
  if (type === "trials" && config.trialTotal) {
    return `${meta.label} (${config.trialTotal} per probe)`;
  }
  return meta.label;
}

/* ---------------------------------------------------------- normalisation -- */

/**
 * Where a value sits between baseline (0) and target (1).
 *
 * This is the one number that makes an 85% goal and a 12-minutes goal
 * comparable, so it is what the caseload board sorts and groups on. Values
 * outside 0..1 are returned as they are - "below baseline" and "past target"
 * are both real and worth seeing.
 */
export function progressRatio(value, baseline, target, direction = "increase") {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || !Number.isFinite(target)) return null;

  const span = direction === "decrease" ? baseline - target : target - baseline;
  if (span === 0) return null;

  const travelled = direction === "decrease" ? baseline - value : value - baseline;
  return travelled / span;
}

/** The aim line: where the student should be on any given day. */
export function aimValueAtRatio(baseline, target, ratio) {
  if (!Number.isFinite(baseline) || !Number.isFinite(target) || !Number.isFinite(ratio)) return null;
  return baseline + (target - baseline) * ratio;
}

/* ------------------------------------------------------------- inference -- */

/**
 * Reads a measurement type out of the free text an existing goal already has,
 * so goals written before measurement types existed are not all assumed to be
 * percentages. Mirrors the SQL backfill in migration 003.
 */
export function inferMeasurementType(goal) {
  const target = String(goal?.targetDescription ?? goal?.target ?? "").toLowerCase();
  const baseline = String(goal?.baselineDescription ?? goal?.baseline ?? "").toLowerCase();
  const metric = String(goal?.metricUnit ?? goal?.metric ?? "").toLowerCase();
  const text = `${target} ${baseline} ${metric}`;

  if (/%/.test(text)) return "percent";
  if (/\b\d+\s*(?:of|\/)\s*\d+\b/.test(text)) return "trials";
  if (/(per minute|\/min\b|wpm|words correct|correct per)/.test(metric)) return "rate";
  if (/(minute|duration|sustained)/.test(metric)) return "duration";
  if (/(rubric|points?)/.test(metric)) return "rubric";
  return "percent";
}

/** A sensible starting config when a teacher picks a measurement type. */
export function defaultConfigFor(type) {
  const kind = measurementTypeOf(type);
  if (kind === "trials") return { trialTotal: 5, direction: "increase" };
  if (kind === "level") return { direction: "decrease" };
  return { direction: "increase" };
}

/** Short label for the goal form's picker. */
export function measurementChoices() {
  return MEASUREMENT_TYPES.map(value => ({
    value,
    label: MEASUREMENT_META[value].label,
    hint: MEASUREMENT_META[value].hint,
  }));
}
