/**
 * Progress analysis: the trendline, the aim line, and the plain-language
 * verdict that turns them into a decision.
 *
 * The point of progress monitoring is not a chart. It is the question a parent
 * or an IEP team actually asks: is this plan working, and if not, when do we
 * change it? That question has a defensible answer only when it is built from
 * documented data points, compared against the aim line the goal implies, and
 * stated in words a non-statistician can check.
 *
 * So this module deliberately separates three things:
 *
 *   measure    what the numbers say (slope, projection, how far behind the aim)
 *   verdict    a status the app is willing to stand behind
 *   explain    that verdict as sentences, quoting the dates and values used
 *
 * Where there is not enough evidence to say anything, the verdict is
 * "insufficient-data" rather than a guess dressed up as an insight.
 */

import {
  aimValueAtRatio,
  formatGoalPoint,
  formatMeasurement,
  goalDirection,
  goalValue,
  measurementMeta,
  measurementTypeOf,
  normalizeGoalConfig,
  parseMeasurement,
  progressRatio,
  roundTo,
} from "./measurement";

const DAY_MS = 86400000;

/**
 * A goal with no progress check in three weeks has stopped being monitored.
 * Weekly checks are what most IEPs specify, so three missed weeks is the point
 * at which the silence itself is the finding.
 */
export const DEFAULT_STALE_DAYS = 21;

export const GOAL_STATUSES = [
  "met",
  "on-track",
  "at-risk",
  "off-track",
  "regressing",
  "no-recent-data",
  "insufficient-data",
];

/**
 * priority is the sort key for the caseload board: the higher it is, the more
 * a teacher needs to look at this goal this week.
 *
 * A goal that is visibly failing outranks one with no data at all, because the
 * failing goal is the one where a decision is already owed. A goal that has
 * simply gone quiet outranks "at risk", because silence is both a compliance
 * problem and the reason no one can tell whether the plan is working.
 */
export const STATUS_META = {
  met: {
    label: "Target met",
    tone: "green",
    priority: 0,
    short: "Met",
  },
  "on-track": {
    label: "On track",
    tone: "green",
    priority: 1,
    short: "On track",
  },
  "insufficient-data": {
    label: "Not enough data",
    tone: "slate",
    priority: 3,
    short: "No data",
  },
  "no-recent-data": {
    label: "No recent check",
    tone: "amber",
    priority: 4,
    short: "Stale",
  },
  "at-risk": {
    label: "At risk",
    tone: "amber",
    priority: 5,
    short: "At risk",
  },
  "off-track": {
    label: "Off track",
    tone: "red",
    priority: 6,
    short: "Off track",
  },
  regressing: {
    label: "Regressing",
    tone: "red",
    priority: 7,
    short: "Regressing",
  },
};

export function statusMeta(status) {
  return STATUS_META[status] ?? STATUS_META["insufficient-data"];
}

/* ------------------------------------------------------------------ dates -- */

/** Whole days since the epoch, so all date maths is integer arithmetic. */
export function toDayNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const text = String(value);
  const iso = /^\d{4}-\d{2}-\d{2}/.test(text) ? `${text.slice(0, 10)}T00:00:00Z` : text;
  const time = new Date(iso).getTime();
  // floor, not round: a timestamp of midday must belong to the same calendar
  // day as midnight, or every log dated today lands on tomorrow.
  return Number.isFinite(time) ? Math.floor(time / DAY_MS) : null;
}

export function fromDayNumber(day) {
  if (!Number.isFinite(day)) return "";
  return new Date(day * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  return to - from;
}

/* ------------------------------------------------------------- regression -- */

/**
 * Ordinary least squares over {x, y} points, plus r² so callers can tell a real
 * trend from noise.
 */
export function linearRegression(points) {
  const usable = (points || []).filter(p => Number.isFinite(p?.x) && Number.isFinite(p?.y));
  const n = usable.length;
  if (n < 2) return null;

  const sumX = usable.reduce((a, p) => a + p.x, 0);
  const sumY = usable.reduce((a, p) => a + p.y, 0);
  const sumXY = usable.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = usable.reduce((a, p) => a + p.x * p.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTot = usable.reduce((a, p) => a + (p.y - meanY) ** 2, 0);
  const ssRes = usable.reduce((a, p) => a + (p.y - (slope * p.x + intercept)) ** 2, 0);
  const r2 = ssTot === 0 ? (ssRes === 0 ? 1 : 0) : Math.max(0, 1 - ssRes / ssTot);

  return { slope, intercept, r2, n };
}

/* --------------------------------------------------------------- evidence -- */

/**
 * The canonical value of one observation.
 *
 * The stored score is already canonical, so it is used unless rawValue is
 * present. rawValue wins because it is exactly what the teacher typed: a
 * trials entry of "4 of 5" is only correctly placed on the percent-correct
 * scale by re-parsing it, and that keeps the record honest if the goal's own
 * measurement type is ever edited.
 */
export function measureLogScore(log, goal) {
  const raw = log?.rawValue;
  if (raw !== null && raw !== undefined && String(raw).trim()) {
    const type = measurementTypeOf(log?.measurementType || goal?.measurementType);
    const parsed = parseMeasurement(raw, type, goal?.measurementConfig);
    if (parsed.ok) return parsed.score;
  }

  const stored = log?.score;
  // Number("") and Number(null) are both 0, which would turn an empty entry
  // into a real score of zero and drag the trendline down with it.
  if (stored === null || stored === undefined || String(stored).trim() === "") return null;

  const value = Number(stored);
  return Number.isFinite(value) ? value : null;
}

/** Every usable observation, oldest first. */
export function evidencePoints(goal, logs) {
  return (logs || [])
    .map(log => ({
      log,
      day: toDayNumber(log?.dateISO),
      value: measureLogScore(log, goal),
    }))
    .filter(point => point.day !== null && Number.isFinite(point.value))
    .sort((a, b) => a.day - b.day);
}

/* ------------------------------------------------------------ explanation -- */

function friendly(day) {
  if (!Number.isFinite(day)) return "an unknown date";
  // UTC, because day numbers are whole UTC days: formatting them in the
  // viewer's zone would print the day before for anyone west of Greenwich.
  return new Date(day * DAY_MS).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function showValue(value, type, config) {
  return formatMeasurement(value, type, config);
}

/**
 * The sentences a teacher could paste into a progress report, quoting the
 * dates and numbers they rest on so a reader can check them.
 */
function buildExplanation(context) {
  const {
    status,
    points,
    baseline,
    target,
    type,
    config,
    direction,
    targetDay,
    staleAfterDays,
    slopePerWeek,
    neededPerWeek,
    requiredRatio,
    ratio,
    aimToday,
    deadlineAssumed,
  } = context;

  if (!Number.isFinite(baseline) || !Number.isFinite(target)) {
    return "This goal does not have both a baseline and a target that the app can read as a number, so no trend can be reported. Edit the goal to add them.";
  }

  if (points.length === 0) {
    return "No progress checks have been recorded for this goal yet. With nothing recorded there is no evidence either way, and the IEP's monitoring requirement is not being met.";
  }

  const latest = points[points.length - 1];
  const first = points[0];
  const latestText = showValue(latest.value, type, config);
  const baselineText = formatGoalPoint({ ...context.goal }, "baseline") || showValue(baseline, type, config);
  const targetText = formatGoalPoint({ ...context.goal }, "target") || showValue(target, type, config);
  const deadlineNote = deadlineAssumed
    ? ` No end date is recorded, so the aim line assumes the annual review on ${friendly(targetDay)}.`
    : "";

  switch (status) {
    case "met":
      return `The goal target was ${targetText}. The most recent check on ${friendly(latest.day)} recorded ${latestText}, which meets it. ${points.length} check${points.length === 1 ? "" : "s"} recorded since ${friendly(first.day)}, from a baseline of ${baselineText}.${deadlineNote}`;

    case "on-track": {
      const gain = slopePerWeek === null ? null : roundTo(Math.abs(slopePerWeek), 2);
      const trend = gain === null ? "not enough checks to fit a trend" : `gaining about ${gain} per week`;
      return `The most recent check on ${friendly(latest.day)} recorded ${latestText}, up from a baseline of ${baselineText}. Across ${points.length} checks the student is ${trend}, and the goal target is ${targetText}. That rate reaches the target by the aim line date.${deadlineNote}`;
    }

    case "at-risk":
    case "off-track": {
      const gain = slopePerWeek === null ? null : roundTo(Math.abs(slopePerWeek), 2);
      const need = neededPerWeek === null ? null : roundTo(Math.abs(neededPerWeek), 2);
      const progressNote =
        ratio === null || requiredRatio === null
          ? ""
          : ` The student is ${roundTo(ratio * 100, 0)}% of the way from baseline to target; the aim line for today is ${roundTo(requiredRatio * 100, 0)}%.`;
      const rateNote =
        gain === null
          ? " There are too few checks to fit a reliable trend."
          : ` The trend is ${gain} per week; reaching ${targetText} by the aim line needs about ${need} per week.`;
      return `The most recent check on ${friendly(latest.day)} recorded ${latestText}, against a baseline of ${baselineText}.${progressNote}${rateNote} The aim line value for today is ${aimToday === null ? "not available" : showValue(aimToday, type, config)}, and the student is ${direction === "decrease" ? "above" : "below"} it.${deadlineNote}`;
    }

    case "regressing": {
      const gain = slopePerWeek === null ? null : roundTo(Math.abs(slopePerWeek), 2);
      return `${points.length} checks have been recorded, and instead of moving toward ${targetText} the results are moving away from it: ${gain === null ? "the trend is downward" : `about ${gain} per week in the wrong direction`} since ${friendly(first.day)}. The most recent check on ${friendly(latest.day)} was ${latestText}, against a baseline of ${baselineText}.${deadlineNote}`;
    }

    case "no-recent-data": {
      const days = latest.day === null ? null : toDayNumber(new Date().toISOString()) - latest.day;
      const silence = Number.isFinite(days) ? `${days} days` : "some time";
      return `The last progress check was on ${friendly(latest.day)}, ${silence} ago (${latestText}). ${points.length} check${points.length === 1 ? "" : "s"} were recorded before that. Progress cannot be reported for a period with no data, and documented monitoring is itself part of the IEP.${deadlineNote}`;
    }

    case "insufficient-data":
    default: {
      const missing = Math.max(0, 3 - points.length);
      return `${points.length} progress check${points.length === 1 ? "" : "s"} recorded so far${points.length ? `, most recently ${latestText} on ${friendly(latest.day)}` : ""}. About three are needed before a trend line means anything, so no verdict is reported yet.${deadlineNote}`;
    }
  }
}

function buildNextAction(status, points) {
  switch (status) {
    case "met":
      return "Confirm with the team, then write the next goal or raise the target.";
    case "on-track":
      return "Keep the current plan and continue the scheduled checks.";
    case "at-risk":
      return "Watch the next two checks; if they stay below the aim line, change the intervention.";
    case "off-track":
      return "Bring this goal to the next team meeting - the current plan is not closing the gap.";
    case "regressing":
      return "Review the intervention now; performance is moving away from the goal.";
    case "no-recent-data":
      return "Collect a progress check this week.";
    case "insufficient-data":
    default: {
      const missing = Math.max(0, 3 - points.length);
      return `Collect ${missing} more progress check${missing === 1 ? "" : "s"} to establish a baseline trend.`;
    }
  }
}

/* ------------------------------------------------------------- the verdict -- */

/**
 * Everything the caseload board, the goal detail view and the printable report
 * need about one goal, from one pass over its logs.
 */
export function analyzeGoal({ goal, logs, now = new Date(), staleAfterDays = DEFAULT_STALE_DAYS } = {}) {
  const type = measurementTypeOf(goal?.measurementType);
  const config = normalizeGoalConfig(goal?.measurementConfig);
  const direction = goalDirection(goal);
  const typeInfo = measurementMeta(type);

  const baseline = goalValue(goal, "baseline");
  const target = goalValue(goal, "target");
  const baselineOk = Number.isFinite(baseline);
  const targetOk = Number.isFinite(target);

  const points = evidencePoints(goal, logs);
  const todayDay = toDayNumber(now) ?? toDayNumber(new Date().toISOString());
  const firstDay = points.length ? points[0].day : null;
  const latest = points.length ? points[points.length - 1] : null;

  const explicitStart = toDayNumber(goal?.startDate);
  const startDay = explicitStart ?? firstDay ?? todayDay;

  // An IEP goal runs to the annual review. When no end date was recorded the
  // aim line still has to go somewhere, so it uses that and says so.
  const explicitTarget = toDayNumber(goal?.targetDate);
  const deadlineAssumed = explicitTarget === null;
  const targetDay = explicitTarget ?? startDay + 365;

  const daysSinceLastLog = latest ? todayDay - latest.day : null;

  const span =
    baselineOk && targetOk ? (direction === "decrease" ? baseline - target : target - baseline) : null;

  const regression = points.length >= 2 ? linearRegression(points.map(p => ({ x: p.day, y: p.value }))) : null;
  const slopePerWeek = regression ? regression.slope * 7 : null;

  const ratio = baselineOk && targetOk && latest ? progressRatio(latest.value, baseline, target, direction) : null;

  const periodLength = targetDay - startDay;
  const requiredRatio =
    periodLength > 0 ? Math.min(1, Math.max(0, (todayDay - startDay) / periodLength)) : null;

  const aimAt = day => {
    if (!baselineOk || !targetOk || periodLength <= 0) return null;
    const r = Math.min(1, Math.max(0, (day - startDay) / periodLength));
    return aimValueAtRatio(baseline, target, r);
  };
  const aimToday = aimAt(todayDay);

  const gap = ratio !== null && requiredRatio !== null ? ratio - requiredRatio : null;

  const projection =
    regression && points.length >= 3 ? regression.slope * targetDay + regression.intercept : null;

  const meetsTarget =
    targetOk && latest ? (direction === "decrease" ? latest.value <= target : latest.value >= target) : false;

  const projectedMeetsTarget =
    targetOk && projection !== null
      ? direction === "decrease"
        ? projection <= target
        : projection >= target
      : false;

  // Moving away from the goal by more than 5% of the whole baseline->target
  // span over four weeks. Below that it is measurement noise, not a trend.
  const meaningfulDrift = span ? Math.abs(span) * 0.05 : null;
  const fourWeekDrift = regression ? regression.slope * 28 : null;
  const movingAway =
    regression !== null &&
    points.length >= 3 &&
    fourWeekDrift !== null &&
    meaningfulDrift !== null &&
    meaningfulDrift > 0 &&
    (direction === "decrease" ? fourWeekDrift >= meaningfulDrift : fourWeekDrift <= -meaningfulDrift);

  const remainingDays = targetDay - todayDay;
  const neededPerWeek =
    baselineOk && targetOk && remainingDays > 0
      ? ((direction === "decrease" ? baseline - target : target - baseline) -
          (latest ? (direction === "decrease" ? baseline - latest.value : latest.value - baseline) : 0)) /
        (remainingDays / 7)
      : null;

  let status;
  if (!baselineOk || !targetOk) status = "insufficient-data";
  else if (points.length === 0) status = "insufficient-data";
  else if (meetsTarget) status = "met";
  else if (points.length < 3) status = "insufficient-data";
  else if (daysSinceLastLog !== null && daysSinceLastLog > staleAfterDays) status = "no-recent-data";
  else if (movingAway) status = "regressing";
  else if (projectedMeetsTarget) status = "on-track";
  else if (gap === null || gap >= -0.15) status = "at-risk";
  else status = "off-track";

  // The decision rule most districts write into the IEP: three consecutive
  // data points below the aim line means the team reconvenes. Reported rather
  // than acted on, because the team is the one that decides.
  const aimLineBreaches = points.slice(-3).map(p => {
    const aim = aimAt(p.day);
    if (aim === null) return false;
    return direction === "decrease" ? p.value > aim : p.value < aim;
  });
  const threeBelowAimLine = points.length >= 3 && aimLineBreaches.length === 3 && aimLineBreaches.every(Boolean);

  const meta = statusMeta(status);

  return {
    goalId: goal?.id,
    studentId: goal?.studentId,
    area: goal?.area ?? "Other",
    description: goal?.description ?? "",
    status,
    statusLabel: meta.label,
    tone: meta.tone,
    priority: meta.priority,
    type,
    typeLabel: typeInfo.label,
    config,
    direction,
    baseline,
    target,
    baselineText: goal?.baseline ?? "",
    targetText: goal?.target ?? "",
    dataPoints: points.length,
    points,
    latest: latest ? { value: latest.value, day: latest.day, dateISO: fromDayNumber(latest.day), log: latest.log } : null,
    daysSinceLastLog,
    startDay,
    startDate: fromDayNumber(startDay),
    targetDay,
    targetDate: fromDayNumber(targetDay),
    deadlineAssumed,
    slopePerWeek,
    r2: regression?.r2 ?? null,
    ratio,
    requiredRatio,
    gap,
    aimToday,
    projection,
    projectedMeetsTarget,
    neededPerWeek,
    movingAway,
    threeBelowAimLine,
    confidence: points.length >= 8 && (regression?.r2 ?? 0) >= 0.5 ? "high" : points.length >= 5 ? "moderate" : "low",
    aimAt,
    explanation: buildExplanation({
      goal,
      status,
      points,
      baseline,
      target,
      type,
      config,
      direction,
      targetDay,
      staleAfterDays,
      slopePerWeek,
      neededPerWeek,
      requiredRatio,
      ratio,
      aimToday,
      deadlineAssumed,
    }),
    nextAction: buildNextAction(status, points),
  };
}

/** Short axis label for a day number, in UTC so it cannot slip a day. */
export function shortDayLabel(day) {
  if (!Number.isFinite(day)) return "";
  return new Date(day * DAY_MS).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

/**
 * The series a chart draws: the recorded points, the aim line underneath them,
 * and the trend line fitted through them extended to the goal's end date, so a
 * reader can see where the current rate is heading.
 */
export function buildChartSeries(analysis) {
  if (!analysis?.points?.length) return [];

  const { points, aimAt, targetDay } = analysis;
  const regression =
    points.length >= 2 ? linearRegression(points.map(p => ({ x: p.day, y: p.value }))) : null;

  const series = points.map(point => ({
    day: point.day,
    dateISO: fromDayNumber(point.day),
    label: shortDayLabel(point.day),
    value: point.value,
    aim: aimAt ? aimAt(point.day) : null,
    trend: regression ? regression.slope * point.day + regression.intercept : null,
  }));

  const lastDay = points[points.length - 1].day;
  if (Number.isFinite(targetDay) && targetDay > lastDay) {
    series.push({
      day: targetDay,
      dateISO: fromDayNumber(targetDay),
      label: shortDayLabel(targetDay),
      value: null,
      aim: aimAt ? aimAt(targetDay) : null,
      trend: regression ? regression.slope * targetDay + regression.intercept : null,
      projected: true,
    });
  }

  return series;
}

/* --------------------------------------------------------------- caseload -- */

export function summarizeStatuses(analyses) {
  const counts = {};
  for (const status of GOAL_STATUSES) counts[status] = 0;
  for (const analysis of analyses || []) {
    counts[analysis.status] = (counts[analysis.status] ?? 0) + 1;
  }
  return counts;
}

/** How many goals genuinely need a teacher's attention this week. */
export function attentionCount(counts) {
  return (counts.regressing ?? 0) + (counts["off-track"] ?? 0) + (counts["at-risk"] ?? 0) + (counts["no-recent-data"] ?? 0);
}

export function caseloadHeadline(counts, studentsAffected) {
  const attention = attentionCount(counts);
  const studentText = studentsAffected === 1 ? "1 student" : `${studentsAffected} students`;

  if (attention === 0 && (counts["insufficient-data"] ?? 0) === 0) {
    return "Every goal has current data and is on track or met.";
  }
  if (attention === 0) {
    return `Nothing off track across ${studentText}, but ${counts["insufficient-data"]} goal${counts["insufficient-data"] === 1 ? "" : "s"} still need a first data point.`;
  }
  return `${attention} goal${attention === 1 ? " needs" : "s need"} attention across ${studentText}.`;
}

/**
 * Ranks every goal in the caseload by how much it needs a human, and rolls the
 * same analyses up per student.
 *
 * Sorting is deliberately not by raw score: a goal that is 40 points behind the
 * aim line and a goal that has not been checked in six weeks are both urgent,
 * and the status priority is what decides between them.
 */
export function analyzeCaseload({ students = [], goals = [], logs = [], now = new Date(), staleAfterDays } = {}) {
  const logsByGoal = new Map();
  for (const log of logs) {
    if (!log?.goalId) continue;
    const list = logsByGoal.get(log.goalId);
    if (list) list.push(log);
    else logsByGoal.set(log.goalId, [log]);
  }

  const studentById = new Map(students.map(s => [s.id, s]));

  const analyses = goals.map(goal =>
    analyzeGoal({
      goal,
      logs: logsByGoal.get(goal.id) ?? [],
      now,
      ...(staleAfterDays === undefined ? {} : { staleAfterDays }),
    })
  );

  const ranked = [...analyses].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    // Same urgency: the further behind the aim line goes first.
    const aGap = a.gap === null ? 1 : a.gap;
    const bGap = b.gap === null ? 1 : b.gap;
    if (aGap !== bGap) return aGap - bGap;
    return (b.daysSinceLastLog ?? 0) - (a.daysSinceLastLog ?? 0);
  });

  const byStudent = students
    .map(student => {
      const own = analyses.filter(a => a.studentId === student.id);
      const worst = own.reduce(
        (acc, a) => (acc === null || a.priority > acc.priority ? a : acc),
        null
      );
      return {
        studentId: student.id,
        name: student.name,
        grade: student.grade ?? "",
        disability: student.disability ?? "",
        analyses: [...own].sort((a, b) => b.priority - a.priority),
        worst,
        counts: summarizeStatuses(own),
      };
    })
    .sort((a, b) => {
      const aPriority = a.worst?.priority ?? -1;
      const bPriority = b.worst?.priority ?? -1;
      if (bPriority !== aPriority) return bPriority - aPriority;
      return a.name.localeCompare(b.name);
    });

  const counts = summarizeStatuses(analyses);
  const studentsAffected = new Set(
    ranked.filter(a => a.priority >= STATUS_META["no-recent-data"].priority).map(a => a.studentId)
  ).size;

  return {
    analyses,
    ranked,
    byStudent,
    counts,
    studentsAffected,
    studentById,
    headline: caseloadHeadline(counts, studentsAffected),
  };
}

export { formatGoalPoint, showValue };
