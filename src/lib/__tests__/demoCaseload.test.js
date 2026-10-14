import { describe, expect, it } from "vitest";

import { buildDemoStore } from "@/lib/demoCaseload";
import { analyzeGoal } from "@/lib/progress/analysis";

/**
 * The demo caseload is a feature, not a fixture: it is what a preview
 * deployment and a first-time visitor actually see. These tests exist because
 * the sample data has already been wrong once in a way that looked like a bug
 * in the analysis: an inverted sign put every goal's end date in the past, so
 * every aim line read "100% of the period elapsed" and the report claimed each
 * student had already reached the target.
 *
 * Fixed local-time instant, because both the generator and the analysis work in
 * local calendar days.
 */
const NOW = new Date(2026, 9, 13, 12, 0, 0);

const store = buildDemoStore(NOW);

function analysisFor(goalId) {
  return analyzeGoal({
    goal: store.goals.find(g => g.id === goalId),
    logs: store.logs.filter(l => l.goalId === goalId),
    now: NOW,
  });
}

describe("demo caseload", () => {
  it("is internally consistent", () => {
    const studentIds = new Set(store.students.map(s => s.id));
    const goalIds = new Set(store.goals.map(g => g.id));

    expect(store.students).toHaveLength(4);
    expect(store.goals).toHaveLength(6);

    for (const goal of store.goals) {
      expect(studentIds.has(goal.studentId)).toBe(true);
    }
    for (const log of store.logs) {
      expect(goalIds.has(log.goalId)).toBe(true);
      // The trendline reads `score`; a non-numeric one would silently drop the
      // point rather than fail loudly.
      expect(Number.isFinite(Number(log.score))).toBe(true);
    }
  });

  it("gives every goal a service window that is still open", () => {
    for (const goal of store.goals) {
      const analysis = analysisFor(goal.id);
      expect(analysis.deadlineAssumed).toBe(false);
      expect(analysis.requiredRatio).toBeGreaterThan(0);
      expect(analysis.requiredRatio).toBeLessThan(1);
    }
  });

  it("places today at the elapsed fraction of the reporting period", () => {
    const analysis = analysisFor("demo-goal-maya-reading");
    // 149 days elapsed in a 149 + 121 = 270 day window.
    expect(analysis.requiredRatio).toBeCloseTo(149 / 270, 2);
    // ...and the aim line for today is the baseline plus that fraction of the
    // baseline-to-target span.
    expect(analysis.aimToday).toBeCloseTo(42 + (149 / 270) * (90 - 42), 1);
  });

  it("reaches every verdict the caseload board can show", () => {
    const statuses = new Set(store.goals.map(goal => analysisFor(goal.id).status));

    // A demo in which everyone is on track demonstrates nothing; the four
    // verdicts are the point of the product.
    expect(statuses).toContain("off-track");
    expect(statuses).toContain("on-track");
    expect(statuses).toContain("no-recent-data");
    expect(statuses).toContain("insufficient-data");
  });

  it("keeps a decreasing goal's progress meaningful", () => {
    // Fewer prompts is better here, so the verdict must not be read as failure.
    const analysis = analysisFor("demo-goal-ethan-behavior");
    expect(analysis.direction).toBe("decrease");
    expect(["on-track", "met"]).toContain(analysis.status);
  });
});
