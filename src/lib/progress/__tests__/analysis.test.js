import { describe, it, expect } from "vitest";

import {
  DEFAULT_STALE_DAYS,
  GOAL_STATUSES,
  STATUS_META,
  analyzeCaseload,
  analyzeGoal,
  attentionCount,
  caseloadHeadline,
  evidencePoints,
  fromDayNumber,
  linearRegression,
  measureLogScore,
  statusMeta,
  summarizeStatuses,
  toDayNumber,
} from "../analysis";
import { goalToRow, rowToGoal, logToRow, rowToLog } from "../../supabaseMappers";

const NOW = new Date("2026-03-15T12:00:00Z");

function makeGoal(overrides = {}) {
  return {
    id: "g1",
    studentId: "s1",
    area: "Reading",
    description: "Read grade-level text fluently",
    baseline: "40",
    target: "80",
    measurementType: "percent",
    startDate: "2026-01-01",
    targetDate: "2026-04-01",
    ...overrides,
  };
}

/** Weekly observations starting 2026-02-01, oldest first. */
function makeLogs(values, { goalId = "g1", start = "2026-02-01", stepDays = 7 } = {}) {
  const base = Date.parse(`${start}T00:00:00Z`);
  return values.map((value, index) => ({
    id: `l${index}`,
    goalId,
    dateISO: new Date(base + index * stepDays * 86400000).toISOString().slice(0, 10),
    score: String(value),
  }));
}

describe("date helpers", () => {
  it("turns a date into whole days and back", () => {
    expect(fromDayNumber(toDayNumber("2026-02-01"))).toBe("2026-02-01");
    expect(toDayNumber("")).toBeNull();
    expect(toDayNumber(null)).toBeNull();
    expect(toDayNumber("not a date")).toBeNull();
  });

  it("reads a Date object as well as a string", () => {
    expect(toDayNumber(NOW)).toBe(toDayNumber("2026-03-15"));
  });
});

describe("linearRegression", () => {
  it("fits an exact line and reports a perfect r squared", () => {
    const fit = linearRegression([
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
    ]);
    expect(fit.slope).toBeCloseTo(2);
    expect(fit.intercept).toBeCloseTo(0);
    expect(fit.r2).toBeCloseTo(1);
  });

  it("returns null rather than a line through one point", () => {
    expect(linearRegression([{ x: 1, y: 1 }])).toBeNull();
    expect(linearRegression([])).toBeNull();
    expect(linearRegression(null)).toBeNull();
  });

  it("is not fooled by a flat series", () => {
    const fit = linearRegression([
      { x: 0, y: 5 },
      { x: 1, y: 5 },
      { x: 2, y: 5 },
    ]);
    expect(fit.slope).toBeCloseTo(0);
  });
});

describe("measureLogScore", () => {
  it("re-parses a trials reading so it lands on the percent-correct scale", () => {
    const goal = makeGoal({ measurementType: "trials", baseline: "2 of 5", target: "4 of 5" });
    expect(measureLogScore({ rawValue: "4 of 5", score: "4", measurementType: "trials" }, goal)).toBe(80);
  });

  it("falls back to the stored score when there is no raw value", () => {
    expect(measureLogScore({ score: "62" }, makeGoal())).toBe(62);
  });

  it("ignores an unreadable stored score instead of treating it as zero", () => {
    expect(measureLogScore({ score: "n/a" }, makeGoal())).toBeNull();
    expect(measureLogScore({}, makeGoal())).toBeNull();
  });
});

describe("evidencePoints", () => {
  it("orders observations oldest first and drops unusable rows", () => {
    const logs = [
      { goalId: "g1", dateISO: "2026-02-08", score: "50" },
      { goalId: "g1", dateISO: "2026-02-01", score: "45" },
      { goalId: "g1", dateISO: "2026-02-15", score: "" },
    ];
    const points = evidencePoints(makeGoal(), logs);
    expect(points.map(p => p.value)).toEqual([45, 50]);
  });
});

describe("analyzeGoal verdicts", () => {
  it("reports insufficient data rather than inventing a trend", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: [], now: NOW });
    expect(analysis.status).toBe("insufficient-data");
    expect(analysis.dataPoints).toBe(0);
    expect(analysis.explanation).toMatch(/No progress checks/i);
    expect(analysis.nextAction).toMatch(/Collect/i);
  });

  it("will not call a trend on two data points", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([50, 60]), now: NOW });
    expect(analysis.status).toBe("insufficient-data");
    expect(analysis.dataPoints).toBe(2);
  });

  it("says the target is met when the latest check meets it", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([50, 60, 82]), now: NOW });
    expect(analysis.status).toBe("met");
    expect(analysis.explanation).toMatch(/meets it/i);
  });

  it("honours a goal whose target is met from below", () => {
    const goal = makeGoal({
      measurementType: "frequency",
      baseline: "10",
      target: "2",
      measurementConfig: { direction: "decrease", frequencyUnit: "prompts" },
    });
    const analysis = analyzeGoal({ goal, logs: makeLogs([9, 6, 2]), now: NOW });
    expect(analysis.status).toBe("met");
  });

  it("projects an improving goal as on track", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([50, 55, 60, 65, 70, 75]), now: NOW });
    expect(analysis.status).toBe("on-track");
    expect(analysis.projectedMeetsTarget).toBe(true);
    expect(analysis.slopePerWeek).toBeGreaterThan(4);
  });

  it("flags a goal that is behind the aim line but not lost", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([60, 62, 64, 66, 68]), now: NOW });
    expect(analysis.status).toBe("at-risk");
    expect(analysis.gap).toBeLessThan(0);
    expect(analysis.gap).toBeGreaterThan(-0.15);
  });

  it("flags a goal far behind the aim line as off track", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([50, 51, 50, 51, 50, 51]), now: NOW });
    expect(analysis.status).toBe("off-track");
    expect(analysis.gap).toBeLessThan(-0.15);
  });

  it("flags movement away from the goal as regressing", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([70, 66, 62, 58, 54]), now: NOW });
    expect(analysis.status).toBe("regressing");
    expect(analysis.movingAway).toBe(true);
    expect(analysis.nextAction).toMatch(/Review the intervention/i);
  });

  it("treats long silence as the finding", () => {
    const logs = [
      { goalId: "g1", dateISO: "2026-01-05", score: "45" },
      { goalId: "g1", dateISO: "2026-01-12", score: "48" },
      { goalId: "g1", dateISO: "2026-01-19", score: "50" },
    ];
    const analysis = analyzeGoal({ goal: makeGoal(), logs, now: NOW });
    expect(analysis.status).toBe("no-recent-data");
    expect(analysis.daysSinceLastLog).toBeGreaterThan(DEFAULT_STALE_DAYS);
    expect(analysis.explanation).toMatch(/last progress check/i);
  });

  it("respects a caller's own staleness threshold", () => {
    const logs = makeLogs([50, 55, 60], { start: "2026-02-20" });
    expect(analyzeGoal({ goal: makeGoal(), logs, now: NOW, staleAfterDays: 60 }).status).not.toBe(
      "no-recent-data"
    );
    expect(analyzeGoal({ goal: makeGoal(), logs, now: NOW, staleAfterDays: 5 }).status).toBe("no-recent-data");
  });

  it("applies the three-consecutive-points decision rule", () => {
    const logs = makeLogs([40, 40, 41], { start: "2026-01-05" });
    const analysis = analyzeGoal({ goal: makeGoal(), logs, now: new Date("2026-01-25T12:00:00Z") });
    expect(analysis.threeBelowAimLine).toBe(true);
    const healthy = analyzeGoal({ goal: makeGoal(), logs: makeLogs([70, 75, 78]), now: NOW });
    expect(healthy.threeBelowAimLine).toBe(false);
  });

  it("measures progress as a share of the distance to the target", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([60, 62, 64, 66, 68]), now: NOW });
    expect(analysis.ratio).toBeCloseTo(0.7, 2);
    expect(analysis.requiredRatio).toBeGreaterThan(0.8);
    expect(analysis.aimToday).toBeGreaterThan(70);
  });

  it("falls back to the annual review when a goal has no end date, and says so", () => {
    const analysis = analyzeGoal({ goal: makeGoal({ targetDate: "" }), logs: makeLogs([50, 55, 60]), now: NOW });
    expect(analysis.deadlineAssumed).toBe(true);
    expect(analysis.explanation).toMatch(/annual review/i);
  });

  it("says nothing it cannot support when the target is unreadable", () => {
    const analysis = analyzeGoal({ goal: makeGoal({ target: "" }), logs: makeLogs([50, 55, 60]), now: NOW });
    expect(analysis.status).toBe("insufficient-data");
    expect(analysis.explanation).toMatch(/baseline and a target/i);
  });

  it("quotes the values it used so a reader can check them", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([60, 62, 64, 66, 68]), now: NOW });
    expect(analysis.explanation).toContain("68%");
    expect(analysis.explanation).toContain("40%");
    expect(analysis.explanation).toMatch(/aim line/i);
  });

  it("reports its confidence honestly from the amount of evidence", () => {
    expect(analyzeGoal({ goal: makeGoal(), logs: makeLogs([50, 52]), now: NOW }).confidence).toBe("low");
    expect(
      analyzeGoal({ goal: makeGoal(), logs: makeLogs([50, 51, 52, 53, 54, 55]), now: NOW }).confidence
    ).toBe("moderate");
  });

  it("gives every status a label, a tone and a priority", () => {
    GOAL_STATUSES.forEach(status => {
      expect(STATUS_META[status]).toBeTruthy();
      expect(STATUS_META[status].label).toBeTruthy();
      expect(STATUS_META[status].tone).toBeTruthy();
      expect(Number.isFinite(STATUS_META[status].priority)).toBe(true);
    });
    expect(statusMeta("nonsense").label).toBe(STATUS_META["insufficient-data"].label);
  });

  it("works on a trials goal end to end", () => {
    const goal = makeGoal({
      measurementType: "trials",
      baseline: "2 of 5",
      target: "4 of 5",
      measurementConfig: { trialTotal: 5 },
    });
    const logs = [
      { goalId: "g1", dateISO: "2026-02-01", score: "60", rawValue: "3 of 5", measurementType: "trials" },
      { goalId: "g1", dateISO: "2026-02-08", score: "60", rawValue: "3 of 5", measurementType: "trials" },
      { goalId: "g1", dateISO: "2026-02-15", score: "80", rawValue: "4 of 5", measurementType: "trials" },
    ];
    const analysis = analyzeGoal({ goal, logs, now: NOW });
    expect(analysis.baseline).toBe(40);
    expect(analysis.target).toBe(80);
    expect(analysis.status).toBe("met");
    expect(analysis.latest.value).toBe(80);
  });

  it("survives a goal with no id and no logs array", () => {
    const analysis = analyzeGoal({ goal: {}, logs: undefined, now: NOW });
    expect(analysis.status).toBe("insufficient-data");
    expect(analysis.dataPoints).toBe(0);
  });

  it("does not flag noise as a regression", () => {
    const analysis = analyzeGoal({ goal: makeGoal(), logs: makeLogs([60, 61, 60, 61, 60, 61]), now: NOW });
    expect(analysis.movingAway).toBe(false);
    expect(analysis.status).not.toBe("regressing");
  });
});

describe("analyzeCaseload", () => {
  const students = [
    { id: "s1", name: "Ava Reyes", grade: "4" },
    { id: "s2", name: "Ben Okafor", grade: "5" },
  ];

  const goals = [
    { ...makeGoal({ id: "g1", studentId: "s1" }) },
    { ...makeGoal({ id: "g2", studentId: "s1", description: "Math facts" }) },
    { ...makeGoal({ id: "g3", studentId: "s2", description: "Written expression" }) },
  ];

  const logs = [
    ...makeLogs([50, 55, 60, 65, 70, 75], { goalId: "g1" }),
    ...makeLogs([50, 51, 50, 51, 50, 51], { goalId: "g2" }),
    { goalId: "g3", dateISO: "2026-01-05", score: "45" },
  ];

  const caseload = analyzeCaseload({ students, goals, logs, now: NOW });

  it("sorts the goals that need a human to the top", () => {
    expect(caseload.ranked).toHaveLength(3);
    expect(caseload.ranked[0].goalId).toBe("g2");
    expect(caseload.ranked[0].status).toBe("off-track");
    expect(caseload.ranked[caseload.ranked.length - 1].goalId).toBe("g1");
  });

  it("counts every status", () => {
    expect(caseload.counts["on-track"]).toBe(1);
    expect(caseload.counts["off-track"]).toBe(1);
    expect(caseload.counts["insufficient-data"]).toBe(1);
    expect(attentionCount(caseload.counts)).toBe(1);
  });

  it("rolls the same analyses up per student, worst first", () => {
    expect(caseload.byStudent.map(s => s.studentId)).toEqual(["s1", "s2"]);
    const ben = caseload.byStudent.find(s => s.studentId === "s2");
    expect(ben.analyses).toHaveLength(1);
    expect(ben.worst.goalId).toBe("g3");
    expect(ben.name).toBe("Ben Okafor");
  });

  it("states the headline in the number of goals and students involved", () => {
    expect(caseload.headline).toMatch(/1 goal needs attention/);
    expect(caseload.headline).toMatch(/1 student/);
    expect(caseloadHeadline({}, 0)).toMatch(/Every goal/);
  });

  it("handles an empty caseload without dividing by anything", () => {
    const empty = analyzeCaseload({ students: [], goals: [], logs: [], now: NOW });
    expect(empty.ranked).toEqual([]);
    expect(empty.byStudent).toEqual([]);
    expect(empty.studentsAffected).toBe(0);
  });

  it("ignores logs pointing at goals that are not in the caseload", () => {
    const orphan = analyzeCaseload({
      students,
      goals: [goals[0]],
      logs: [...logs, { goalId: "missing", dateISO: "2026-02-01", score: "99" }],
      now: NOW,
    });
    expect(orphan.analyses).toHaveLength(1);
    expect(orphan.analyses[0].dataPoints).toBe(6);
  });

  it("keeps a goal whose student has been removed out of the per-student rollup", () => {
    const orphanStudent = analyzeCaseload({ students: [students[0]], goals, logs, now: NOW });
    expect(orphanStudent.byStudent).toHaveLength(1);
    expect(orphanStudent.analyses).toHaveLength(3);
  });
});

describe("summarizeStatuses", () => {
  it("returns a zero count for every status", () => {
    const counts = summarizeStatuses([]);
    GOAL_STATUSES.forEach(status => expect(counts[status]).toBe(0));
  });
});

/**
 * The analysis is only as good as what survives the trip through the database.
 * A trials goal whose "4 of 5" comes back as the number 4 would silently chart
 * the wrong thing, so the whole path is exercised rather than each half.
 */
describe("storage round trip", () => {
  it("keeps a trials goal and its data interpretable after goalToRow/rowToGoal", () => {
    const goal = makeGoal({
      measurementType: "trials",
      baseline: "2 of 5",
      target: "4 of 5",
      metric: "trials",
      measurementConfig: { trialTotal: 5, direction: "increase" },
      startDate: "2026-01-01",
      targetDate: "2026-04-01",
    });

    const restored = rowToGoal(goalToRow(goal, { createdBy: null }));

    expect(restored.measurementType).toBe("trials");
    expect(restored.measurementConfig).toEqual({ trialTotal: 5, direction: "increase" });
    expect(restored.startDate).toBe("2026-01-01");
    expect(restored.targetDate).toBe("2026-04-01");
    // The text is what the analysis parses, so it has to survive even though the
    // numeric column can only hold 2 and 4.
    expect(restored.target).toBe("4 of 5");

    const analysis = analyzeGoal({
      goal: restored,
      logs: [
        rowToLog(logToRow({ goalId: "g1", dateISO: "2026-02-01", score: "60", rawValue: "3 of 5", measurementType: "trials" })),
        rowToLog(logToRow({ goalId: "g1", dateISO: "2026-02-08", score: "60", rawValue: "3 of 5", measurementType: "trials" })),
        rowToLog(logToRow({ goalId: "g1", dateISO: "2026-02-15", score: "80", rawValue: "4 of 5", measurementType: "trials" })),
      ],
      now: NOW,
    });

    expect(analysis.baseline).toBe(40);
    expect(analysis.target).toBe(80);
    expect(analysis.status).toBe("met");
  });

  it("keeps the evidence and context a report has to print", () => {
    const restored = rowToLog(
      logToRow({
        goalId: "g1",
        dateISO: "2026-02-15",
        score: "80",
        rawValue: "4 of 5",
        measurementType: "trials",
        context: "1:1, quiet room",
        evidenceNote: "running record probe 12",
        notes: "settled quickly",
        accommodationsUsed: ["extended time", "read aloud"],
      })
    );

    expect(restored.rawValue).toBe("4 of 5");
    expect(restored.context).toBe("1:1, quiet room");
    expect(restored.evidenceNote).toBe("running record probe 12");
    expect(restored.accommodationsUsed).toEqual(["extended time", "read aloud"]);
  });
});
