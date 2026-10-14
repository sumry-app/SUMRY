import { describe, it, expect } from "vitest";
import { normalizeStoreData } from "../data";

/**
 * normalizeStoreData rebuilds goals and logs from a fixed field list, so any
 * field it does not copy is silently lost on every load and on the JSON
 * backup/restore path. These tests pin the measurement fields in that list.
 */
describe("normalizeStoreData", () => {
  const raw = () => ({
    version: 1,
    lastUpdated: "2026-01-01T00:00:00.000Z",
    students: [{ id: "s1", name: "Maya Thompson" }],
    goals: [
      {
        id: "g1",
        studentId: "s1",
        area: "Reading",
        description: "Read 80 WPM",
        baseline: "45",
        target: "80",
        metric: "WPM",
        measurementType: "rate",
        measurementConfig: { rateUnit: "WPM", direction: "increase" },
        startDate: "2026-01-15",
        targetDate: "2026-06-01",
        createdAt: "2026-01-02T00:00:00.000Z",
        aiGenerated: false,
      },
    ],
    logs: [
      {
        id: "l1",
        goalId: "g1",
        dateISO: "2026-02-01",
        score: "72",
        notes: "",
        rawValue: "72 WPM",
        measurementType: "rate",
        context: "independent, quiet room",
        evidenceNote: "running record",
        accommodationsUsed: ["extended time"],
      },
    ],
  });

  it("keeps the new measurement fields instead of dropping them", () => {
    const store = normalizeStoreData(raw());

    const goal = store.goals[0];
    expect(goal.measurementType).toBe("rate");
    expect(goal.measurementConfig).toEqual({ rateUnit: "WPM", direction: "increase" });
    expect(goal.startDate).toBe("2026-01-15");
    expect(goal.targetDate).toBe("2026-06-01");

    const log = store.logs[0];
    expect(log.rawValue).toBe("72 WPM");
    expect(log.measurementType).toBe("rate");
    expect(log.context).toBe("independent, quiet room");
    expect(log.evidenceNote).toBe("running record");
    expect(log.accommodationsUsed).toEqual(["extended time"]);
  });

  it("leaves absent measurement fields unset without disturbing the old ones", () => {
    const input = raw();
    delete input.goals[0].measurementType;
    delete input.goals[0].measurementConfig;
    delete input.goals[0].startDate;
    delete input.goals[0].targetDate;
    delete input.logs[0].rawValue;
    delete input.logs[0].measurementType;
    delete input.logs[0].context;
    delete input.logs[0].evidenceNote;
    delete input.logs[0].accommodationsUsed;

    const store = normalizeStoreData(input);

    // Not defaulted to "percent": goalToRow infers a type from the free text
    // only while the field is unset.
    expect(store.goals[0].measurementType).toBeUndefined();
    expect(store.goals[0].measurementConfig).toEqual({});
    expect(store.goals[0].startDate).toBe("");
    expect(store.goals[0].targetDate).toBe("");
    expect(store.logs[0].rawValue).toBe("");
    expect(store.logs[0].measurementType).toBeUndefined();
    expect(store.logs[0].context).toBe("");
    expect(store.logs[0].evidenceNote).toBe("");
    expect(store.logs[0].accommodationsUsed).toEqual([]);

    // pre-existing normalisation is unchanged
    expect(store.goals[0].target).toBe("80");
    expect(store.logs[0].score).toBe("72");
  });

  it("drops malformed measurement values rather than storing them raw", () => {
    const input = raw();
    input.goals[0].measurementConfig = "not-an-object";
    input.goals[0].measurementType = 42;
    input.logs[0].accommodationsUsed = "extended time";

    const store = normalizeStoreData(input);

    expect(store.goals[0].measurementConfig).toEqual({});
    expect(store.goals[0].measurementType).toBeUndefined();
    expect(store.logs[0].accommodationsUsed).toEqual([]);
  });
});
