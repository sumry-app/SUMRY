import { describe, it, expect } from "vitest";
import { diffStores } from "../storeDiff";

const store = (over = {}) => ({ students: [], goals: [], logs: [], ...over });

const student = (id, over = {}) => ({ id, name: `Student ${id}`, grade: "3rd", disability: "", ...over });
const goal = (id, studentId, over = {}) => ({
  id, studentId, area: "Reading", description: "d", baseline: "1", target: "2", metric: "x", ...over,
});
const log = (id, goalId, over = {}) => ({ id, goalId, dateISO: "2026-08-09", score: "5", notes: "", ...over });

describe("diffStores", () => {
  it("reports no work when nothing changed", () => {
    const a = store({ students: [student("s1")] });
    const b = store({ students: [student("s1")] });
    expect(diffStores(a, b).isEmpty).toBe(true);
  });

  it("detects an insert", () => {
    const d = diffStores(store(), store({ students: [student("s1")] }));
    expect(d.inserts).toHaveLength(1);
    expect(d.inserts[0]).toMatchObject({ entity: "student", id: "s1" });
  });

  it("detects a field-level update", () => {
    const a = store({ students: [student("s1", { grade: "3rd" })] });
    const b = store({ students: [student("s1", { grade: "4th" })] });
    const d = diffStores(a, b);
    expect(d.updates).toHaveLength(1);
    expect(d.updates[0].item.grade).toBe("4th");
    expect(d.inserts).toHaveLength(0);
  });

  it("does not report an update when only key order differs", () => {
    const a = store({ students: [{ id: "s1", name: "A", grade: "3rd" }] });
    const b = store({ students: [{ grade: "3rd", name: "A", id: "s1" }] });
    expect(diffStores(a, b).isEmpty).toBe(true);
  });

  it("compares array fields by contents", () => {
    const a = store({ logs: [log("l1", "g1", { accommodationsUsed: ["x"] })] });
    const b = store({ logs: [log("l1", "g1", { accommodationsUsed: ["x"] })] });
    const c = store({ logs: [log("l1", "g1", { accommodationsUsed: ["y"] })] });
    expect(diffStores(a, b).isEmpty).toBe(true);
    expect(diffStores(a, c).updates).toHaveLength(1);
  });

  it("detects a delete", () => {
    const a = store({ students: [student("s1")] });
    const d = diffStores(a, store());
    expect(d.deletes).toHaveLength(1);
    expect(d.deletes[0]).toMatchObject({ entity: "student", id: "s1" });
  });

  it("orders inserts parents-first so foreign keys resolve", () => {
    const next = store({
      students: [student("s1")],
      goals: [goal("g1", "s1")],
      logs: [log("l1", "g1")],
    });
    const entities = diffStores(store(), next).inserts.map(o => o.entity);
    expect(entities).toEqual(["student", "goal", "log"]);
  });

  it("orders deletes children-first", () => {
    // g1 survives, so deleting its log l1 is a genuine standalone delete.
    // g2 is deleted while its parent student survives, so it is not pruned.
    const prev = store({
      students: [student("s1")],
      goals: [goal("g1", "s1"), goal("g2", "s1")],
      logs: [log("l1", "g1")],
    });
    const next = store({
      students: [student("s1")],
      goals: [goal("g1", "s1")],
      logs: [],
    });
    const entities = diffStores(prev, next).deletes.map(o => o.entity);
    expect(entities).toEqual(["log", "goal"]);
  });

  it("relies on the cascade when a student is deleted", () => {
    const prev = store({
      students: [student("s1")],
      goals: [goal("g1", "s1")],
      logs: [log("l1", "g1")],
    });
    const d = diffStores(prev, store());
    // only the student is deleted explicitly; the schema removes the rest
    expect(d.deletes).toHaveLength(1);
    expect(d.deletes[0].entity).toBe("student");
  });

  it("relies on the cascade when only a goal is deleted", () => {
    const prev = store({
      students: [student("s1")],
      goals: [goal("g1", "s1")],
      logs: [log("l1", "g1")],
    });
    const next = store({ students: [student("s1")] , goals: [], logs: [] });
    const d = diffStores(prev, next);
    expect(d.deletes.map(o => o.entity)).toEqual(["goal"]);
  });

  it("still deletes a log removed on its own", () => {
    const prev = store({
      students: [student("s1")],
      goals: [goal("g1", "s1")],
      logs: [log("l1", "g1"), log("l2", "g1")],
    });
    const next = store({
      students: [student("s1")],
      goals: [goal("g1", "s1")],
      logs: [log("l1", "g1")],
    });
    const d = diffStores(prev, next);
    expect(d.deletes).toHaveLength(1);
    expect(d.deletes[0].id).toBe("l2");
  });

  it("handles a wholesale replacement, as an import or undo performs", () => {
    const prev = store({ students: [student("s1")], goals: [goal("g1", "s1")] });
    const next = store({ students: [student("s2")], goals: [goal("g2", "s2")] });
    const d = diffStores(prev, next);
    expect(d.inserts.map(o => o.id)).toEqual(["s2", "g2"]);
    expect(d.deletes.map(o => o.id)).toEqual(["s1"]); // g1 cascades
  });

  it("tolerates missing or malformed collections", () => {
    expect(diffStores(undefined, undefined).isEmpty).toBe(true);
    expect(diffStores({}, {}).isEmpty).toBe(true);
    expect(diffStores(store({ students: [null, { noId: true }] }), store()).isEmpty).toBe(true);
  });
});
