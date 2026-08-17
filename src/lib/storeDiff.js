/**
 * Turns two store snapshots into the set of database operations that would take
 * the first to the second.
 *
 * The UI mutates state through a generic `setStore(prev => next)` updater, so
 * the intent behind a change ("delete this student") isn't carried with it.
 * Diffing recovers that intent, which means every existing call site keeps
 * working untouched.
 *
 * Ordering matters and is handled here: inserts run parents-first (student ->
 * goal -> log) so foreign keys resolve, and deletes run children-first so
 * nothing is orphaned mid-flight. Deletes of a parent skip their children,
 * because the schema cascades them already and issuing both would produce
 * spurious "row not found" errors.
 */

const COLLECTIONS = [
  { key: "students", entity: "student" },
  { key: "goals", entity: "goal" },
  { key: "logs", entity: "log" },
];

function indexById(items) {
  const map = new Map();
  (items ?? []).forEach(item => {
    if (item && typeof item.id === "string") map.set(item.id, item);
  });
  return map;
}

/** Field-level comparison, ignoring key order and undefined-vs-absent. */
function shallowEqual(a, b) {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})]);
  for (const k of keys) {
    const av = a?.[k];
    const bv = b?.[k];
    if (Array.isArray(av) || Array.isArray(bv)) {
      const aa = Array.isArray(av) ? av : [];
      const ba = Array.isArray(bv) ? bv : [];
      if (aa.length !== ba.length || aa.some((v, i) => v !== ba[i])) return false;
      continue;
    }
    if (av !== bv) return false;
  }
  return true;
}

/**
 * @returns {{inserts: Array, updates: Array, deletes: Array, isEmpty: boolean}}
 *   Each operation is `{ entity, id, item }`, already ordered for execution.
 */
export function diffStores(prev, next) {
  const inserts = [];
  const updates = [];
  const deletes = [];

  for (const { key, entity } of COLLECTIONS) {
    const before = indexById(prev?.[key]);
    const after = indexById(next?.[key]);

    for (const [id, item] of after) {
      const existing = before.get(id);
      if (!existing) {
        inserts.push({ entity, id, item });
      } else if (!shallowEqual(existing, item)) {
        updates.push({ entity, id, item });
      }
    }

    for (const [id, item] of before) {
      if (!after.has(id)) deletes.push({ entity, id, item });
    }
  }

  // Children of a deleted parent are removed by the schema's ON DELETE CASCADE,
  // so issuing explicit deletes for them would target rows that are already
  // gone. Drop them from the plan.
  const deletedStudents = new Set(
    deletes.filter(d => d.entity === "student").map(d => d.id)
  );
  const deletedGoals = new Set(deletes.filter(d => d.entity === "goal").map(d => d.id));

  const goalsOfDeletedStudents = new Set(
    (prev?.goals ?? [])
      .filter(g => deletedStudents.has(g.studentId))
      .map(g => g.id)
  );

  const prunedDeletes = deletes.filter(d => {
    if (d.entity === "goal") return !deletedStudents.has(d.item.studentId);
    if (d.entity === "log") {
      const goalId = d.item.goalId;
      if (deletedGoals.has(goalId)) return false;
      if (goalsOfDeletedStudents.has(goalId)) return false;
    }
    return true;
  });

  // Parents before children on the way in; the reverse on the way out.
  const order = { student: 0, goal: 1, log: 2 };
  inserts.sort((a, b) => order[a.entity] - order[b.entity]);
  updates.sort((a, b) => order[a.entity] - order[b.entity]);
  prunedDeletes.sort((a, b) => order[b.entity] - order[a.entity]);

  return {
    inserts,
    updates,
    deletes: prunedDeletes,
    isEmpty: inserts.length === 0 && updates.length === 0 && prunedDeletes.length === 0,
  };
}
