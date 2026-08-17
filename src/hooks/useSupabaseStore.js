import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createTimestamp } from "@/lib/data";
import { diffStores } from "@/lib/storeDiff";
import {
  studentToRow,
  rowToStudent,
  goalToRow,
  rowToGoal,
  logToRow,
  rowToLog,
  validateGoal,
  validateLog,
  ensureUuids,
} from "@/lib/supabaseMappers";

const EMPTY = { version: 1, lastUpdated: null, students: [], goals: [], logs: [] };

/**
 * Drop-in replacement for usePersistentStore, backed by Supabase.
 *
 * Deliberately exposes the same `{ store, setStore, replaceStore }` surface, so
 * the existing UI keeps working untouched. Updates are applied to local state
 * immediately and then reconciled to the database, which preserves the instant
 * feel of the localStorage version - a networked round-trip on every keystroke
 * would make the app feel slower than what it replaced.
 *
 * If a write fails the local state is rolled back to the last confirmed
 * snapshot and `error` is set, so the UI never silently diverges from what was
 * actually stored.
 */
export function useSupabaseStore({ userId, organization = null, onError } = {}) {
  const [store, setLocalStore] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Last state known to match the database; the rollback target.
  const confirmedRef = useRef(EMPTY);
  // Serialises writes so rapid edits cannot interleave and clobber each other.
  const queueRef = useRef(Promise.resolve());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const report = useCallback((err) => {
    if (!mountedRef.current) return;
    setError(err);
    onError?.(err);
  }, [onError]);

  /* ---------------------------------------------------------------- load -- */

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // RLS already limits these to rows the signed-in user may see.
      const [students, goals, logs] = await Promise.all([
        supabase.from("students").select("*").eq("is_active", true).order("created_at", { ascending: false }),
        supabase.from("goals").select("*").order("created_at", { ascending: false }),
        supabase.from("progress_logs").select("*").order("log_date", { ascending: false }),
      ]);

      const firstError = students.error || goals.error || logs.error;
      if (firstError) throw firstError;

      const next = {
        version: 1,
        lastUpdated: createTimestamp(),
        students: (students.data ?? []).map(rowToStudent),
        goals: (goals.data ?? []).map(rowToGoal),
        logs: (logs.data ?? []).map(rowToLog),
      };

      if (!mountedRef.current) return;
      confirmedRef.current = next;
      setLocalStore(next);
      setError(null);
    } catch (err) {
      report(err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [userId, report]);

  useEffect(() => { load(); }, [load]);

  /* --------------------------------------------------------------- write -- */

  const applyOperation = useCallback(async (op) => {
    const { entity, id, item } = op;

    if (entity === "student") {
      const row = studentToRow(item, { createdBy: userId, organization });
      if (op.kind === "insert") {
        const { error: e } = await supabase.from("students").insert({ ...row, id });
        if (e) throw e;
      } else if (op.kind === "update") {
        const { first_name, last_name, grade_level, disability_classification } = row;
        const { data, error: e } = await supabase
          .from("students")
          .update({ first_name, last_name, grade_level, disability_classification })
          .eq("id", id)
          .select();
        if (e) throw e;
        // An RLS block updates nothing without raising.
        if (!data?.length) throw new Error("You do not have permission to edit that student.");
      } else {
        // Soft delete, matching the existing service layer.
        const { data, error: e } = await supabase
          .from("students").update({ is_active: false }).eq("id", id).select();
        if (e) throw e;
        if (!data?.length) throw new Error("You do not have permission to remove that student.");
      }
      return;
    }

    if (entity === "goal") {
      if (op.kind === "delete") {
        const { data, error: e } = await supabase.from("goals").delete().eq("id", id).select();
        if (e) throw e;
        if (!data?.length) throw new Error("You do not have permission to delete that goal.");
        return;
      }

      const problems = validateGoal(item);
      if (problems.length) throw new Error(problems.join(" "));

      const row = goalToRow(item, { createdBy: userId });
      if (op.kind === "insert") {
        const { error: e } = await supabase.from("goals").insert({ ...row, id });
        if (e) throw e;
      } else {
        const { created_by, student_id, ...updatable } = row;
        const { data, error: e } = await supabase
          .from("goals").update(updatable).eq("id", id).select();
        if (e) throw e;
        if (!data?.length) throw new Error("You do not have permission to edit that goal.");
      }
      return;
    }

    if (entity === "log") {
      if (op.kind === "delete") {
        const { data, error: e } = await supabase.from("progress_logs").delete().eq("id", id).select();
        if (e) throw e;
        if (!data?.length) throw new Error("You do not have permission to delete that entry.");
        return;
      }

      const problems = validateLog(item);
      if (problems.length) throw new Error(problems.join(" "));

      const row = logToRow(item, { loggedBy: userId });
      if (op.kind === "insert") {
        const { error: e } = await supabase.from("progress_logs").insert({ ...row, id });
        if (e) throw e;
      } else {
        const { logged_by, goal_id, ...updatable } = row;
        const { data, error: e } = await supabase
          .from("progress_logs").update(updatable).eq("id", id).select();
        if (e) throw e;
        if (!data?.length) throw new Error("You do not have permission to edit that entry.");
      }
    }
  }, [userId, organization]);

  const reconcile = useCallback((nextStore) => {
    const previous = confirmedRef.current;
    const plan = diffStores(previous, nextStore);
    if (plan.isEmpty) {
      confirmedRef.current = nextStore;
      return;
    }

    setSaving(true);

    // Chain onto the queue so writes never overlap.
    queueRef.current = queueRef.current
      .then(async () => {
        const ops = [
          ...plan.inserts.map(o => ({ ...o, kind: "insert" })),
          ...plan.updates.map(o => ({ ...o, kind: "update" })),
          ...plan.deletes.map(o => ({ ...o, kind: "delete" })),
        ];
        for (const op of ops) {
          await applyOperation(op);
        }
        confirmedRef.current = nextStore;
        if (mountedRef.current) setError(null);
      })
      .catch(err => {
        // Roll the UI back to the last state we know the database agrees with.
        if (mountedRef.current) setLocalStore(confirmedRef.current);
        report(err);
      })
      .finally(() => {
        if (mountedRef.current) setSaving(false);
      });

    return queueRef.current;
  }, [applyOperation, report]);

  /* ------------------------------------------------- usePersistentStore API -- */

  const setStore = useCallback((updater) => {
    setLocalStore(prev => {
      const candidate = typeof updater === "function" ? updater(prev) : updater;
      if (!candidate || typeof candidate !== "object") return prev;

      // Give any new record a uuid up front, so the id the UI holds is the same
      // one the database will store. ensureUuids also rewrites foreign keys,
      // which matters on import where every id in the file is legacy.
      const next = {
        ...ensureUuids(candidate),
        lastUpdated: createTimestamp(),
      };

      reconcile(next);
      return next;
    });
  }, [reconcile]);

  const replaceStore = useCallback((nextStore) => setStore(nextStore), [setStore]);

  return { store, setStore, replaceStore, loading, saving, error, reload: load };
}
