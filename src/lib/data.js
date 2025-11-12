const STORE_VERSION = 1;
const STORE_ARRAY_KEYS = [
  "students",
  "goals",
  "logs",
  "schedules",
  "accommodations",
  "behaviorLogs",
  "presentLevels",
  "serviceLogs",
  "parentAccounts",
  "teamMembers",
  "assessments",
  "compliance",
  "aiSuggestions"
];

export const storageKey = "sumry_complete_v1";

export const dateTimeFormatter = typeof Intl !== "undefined"
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })
  : null;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const createTimestamp = () => new Date().toISOString();

export function formatTimestamp(isoString) {
  if (!isoString || !dateTimeFormatter) return "";
  try {
    return dateTimeFormatter.format(new Date(isoString));
  } catch {
    return "";
  }
}

function ensureArray(value, expectObjects = true) {
  if (!Array.isArray(value)) return [];
  if (!expectObjects) {
    return value.filter(item => item !== null && item !== undefined);
  }
  return value.filter(item => item && typeof item === "object");
}

function dedupeById(list) {
  const seen = new Map();
  list.forEach(item => {
    if (item?.id && !seen.has(item.id)) {
      seen.set(item.id, item);
    }
  });
  return Array.from(seen.values());
}

function getEmptyStore() {
  const base = {
    version: STORE_VERSION,
    lastUpdated: createTimestamp()
  };
  STORE_ARRAY_KEYS.forEach(key => {
    base[key] = [];
  });
  return base;
}

export function normalizeStoreData(raw) {
  if (!raw || typeof raw !== "object") {
    return getEmptyStore();
  }

  const normalized = getEmptyStore();
  normalized.version = typeof raw.version === "number" ? raw.version : STORE_VERSION;
  normalized.lastUpdated = typeof raw.lastUpdated === "string" ? raw.lastUpdated : createTimestamp();

  normalized.students = dedupeById(
    ensureArray(raw.students).map(student => ({
      id: typeof student.id === "string" ? student.id : uid(),
      name: typeof student.name === "string" && student.name.trim() ? student.name.trim() : "Unnamed Student",
      grade: typeof student.grade === "string" ? student.grade.trim() : "",
      disability: typeof student.disability === "string" ? student.disability.trim() : "",
      createdAt: typeof student.createdAt === "string" ? student.createdAt : normalized.lastUpdated
    }))
  );

  const studentIds = new Set(normalized.students.map(s => s.id));

  normalized.goals = dedupeById(
    ensureArray(raw.goals).map(goal => {
      const studentId = typeof goal.studentId === "string" && studentIds.has(goal.studentId)
        ? goal.studentId
        : null;

      if (!studentId) return null;

      return {
        id: typeof goal.id === "string" ? goal.id : uid(),
        studentId,
        area: typeof goal.area === "string" ? goal.area.trim() || "General" : "General",
        description: typeof goal.description === "string" ? goal.description.trim() : "",
        baseline: typeof goal.baseline === "string" ? goal.baseline.trim() : "",
        target: typeof goal.target === "string" ? goal.target.trim() : "",
        metric: typeof goal.metric === "string" && goal.metric.trim() ? goal.metric.trim() : "",
        createdAt: typeof goal.createdAt === "string" ? goal.createdAt : normalized.lastUpdated,
        aiGenerated: Boolean(goal.aiGenerated)
      };
    }).filter(Boolean)
  );

  const goalIds = new Set(normalized.goals.map(g => g.id));

  normalized.logs = dedupeById(
    ensureArray(raw.logs).map(log => {
      const goalId = typeof log.goalId === "string" && goalIds.has(log.goalId) ? log.goalId : null;
      if (!goalId) return null;

      const dateISO = typeof log.dateISO === "string" && /\d{4}-\d{2}-\d{2}/.test(log.dateISO)
        ? log.dateISO.slice(0, 10)
        : createTimestamp().slice(0, 10);

      return {
        id: typeof log.id === "string" ? log.id : uid(),
        goalId,
        dateISO,
        score: typeof log.score === "string" || typeof log.score === "number" ? String(log.score).trim() : "",
        notes: typeof log.notes === "string" ? log.notes.trim() : "",
        accommodationsUsed: ensureArray(log.accommodationsUsed).map(item => String(item).trim()).filter(Boolean),
        evidence: typeof log.evidence === "string" ? log.evidence : undefined
      };
    }).filter(Boolean)
  );

  STORE_ARRAY_KEYS.forEach(key => {
    if (key === "students" || key === "goals" || key === "logs") return;
    normalized[key] = ensureArray(raw[key], false);
  });

  return normalized;
}

function getLocalStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadStore() {
  const storage = getLocalStorage();
  if (!storage) return getEmptyStore();
  const raw = storage.getItem(storageKey);
  if (!raw) return getEmptyStore();
  try {
    return normalizeStoreData(JSON.parse(raw));
  } catch {
    return getEmptyStore();
  }
}

export function saveStore(store) {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKey, JSON.stringify(normalizeStoreData(store)));
  } catch {
    // Ignore quota errors in non-persistent environments
  }
}

export function exportJSON(store) {
  if (typeof document === "undefined") return;
  const safeStore = normalizeStoreData(store);
  const blob = new Blob([JSON.stringify(safeStore, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sumry-complete-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(rows, filename) {
  if (typeof document === "undefined") return;
  const csv = rows.map(r => r.map(s => `"${String(s ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseScore(score) {
  const num = parseFloat(score);
  return isNaN(num) ? null : num;
}

export function calculateTrendline(data) {
  if (data.length < 2) return null;
  const points = data.map((d, i) => ({ x: i, y: parseScore(d.score) })).filter(p => p.y !== null);
  if (points.length < 2) return null;

  const n = points.length;
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

export function predictProgress(logs, target, baseline) {
  const sorted = [...logs].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const trendline = calculateTrendline(sorted);
  if (!trendline) return null;

  const projectedNext = trendline.slope * sorted.length + trendline.intercept;
  const targetNum = parseScore(target);
  const baselineNum = parseScore(baseline);
  if (targetNum === null || baselineNum === null) return null;

  const onTrack = projectedNext >= targetNum * 0.8;
  return {
    projected: projectedNext.toFixed(1),
    onTrack,
    trend: trendline.slope > 0 ? "improving" : trendline.slope < 0 ? "declining" : "stable"
  };
}

export function getProgressStatus(logs, baseline, target) {
  if (logs.length < 3) return { status: "insufficient", color: "gray", label: "Need more data" };
  const prediction = predictProgress(logs, target, baseline);
  if (!prediction) return { status: "insufficient", color: "gray", label: "Need more data" };

  if (prediction.onTrack) {
    return { status: "on-track", color: "green", label: "On track" };
  }

  return { status: "off-track", color: "red", label: "Off track - IEP team review needed" };
}

export function getEmptyNormalizedStore() {
  return getEmptyStore();
}

export { STORE_VERSION, STORE_ARRAY_KEYS };
