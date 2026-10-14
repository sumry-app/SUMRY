import * as React from "react";
import { ChevronDown, ClipboardCheck, Users, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyHint } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  formatGoalPoint,
  formatMeasurement,
  measurementMeta,
  measurementTypeOf,
  normalizeGoalConfig,
  parseMeasurement,
} from "@/lib/progress/measurement";
import { analyzeCaseload, statusMeta } from "@/lib/progress/analysis";

/**
 * Phone-first progress capture.
 *
 * The old entry form was a desktop data-entry shape: pick a goal from a
 * <select>, set a date, type a value, fill four more fields, submit. That is
 * fine at a desk and useless in a classroom, where a check gets captured
 * standing up, one-handed, mid-lesson, with a clipboard in the other hand.
 *
 * So this is a bottom sheet, not a centred modal: it grows from the thumb, the
 * value field owns the first screen, and the primary action stays pinned at
 * the bottom within reach. The detail an IEP actually needs (setting and
 * conditions, evidence, accommodations, notes) is still there, one tap away
 * behind a collapsed disclosure so it cannot slow the common case down.
 *
 * QuickCapture owns no data. It validates with the same parseMeasurement()
 * the rest of the app uses, then hands { goalId, dateISO, rawValue, context,
 * evidenceNote, accommodations, notes } to onSave. The store persists it.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FOCUS_RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const EMPTY_DETAIL = { context: "", evidenceNote: "", accommodations: "", notes: "" };

// Tones come from analysis.js, so a status is defined in exactly one place.
const TONE_BADGE = { green: "success", amber: "warning", red: "destructive", slate: "secondary" };
const TONE_TAG = {
  green: "border-success/25 bg-success-soft text-success",
  amber: "border-warning/30 bg-warning-soft text-warning-foreground",
  red: "border-destructive/25 bg-destructive-soft text-destructive",
  slate: "border-border bg-muted text-muted-foreground",
};

/** A log is a calendar day where the teacher is; UTC would record yesterday. */
function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function goalDescription(goal) {
  return goal?.description || goal?.text || "";
}

/** measurementConfig is the store's name; config is what some fixtures use. */
function goalConfigOf(goal) {
  return goal?.measurementConfig ?? goal?.config ?? {};
}

/**
 * The dialog duties from ui/dialog.jsx (Escape, focus moved in and restored,
 * Tab trapped, background scroll locked), kept local because this panel has a
 * different shape: a full-width sheet pinned to the bottom edge.
 *
 * onOpenChange goes through a ref so an inline handler from the parent cannot
 * re-run the effect and yank focus back to the opener mid-entry.
 */
function useDialogBehaviour({ open, onOpenChange, panelRef, initialFocusRef }) {
  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  React.useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKeyDown = event => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onOpenChangeRef.current?.(false);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const raf = requestAnimationFrame(() => (initialFocusRef.current ?? panelRef.current)?.focus?.());
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = overflow;
      cancelAnimationFrame(raf);
      opener?.focus?.();
    };
  }, [open, panelRef, initialFocusRef]);
}

/** The word carries the status; the tone only reinforces it. */
function StatusTag({ status }) {
  const meta = statusMeta(status);
  return (
    <span className={cn("chip shrink-0 px-1.5 py-0 text-2xs font-semibold", TONE_TAG[meta.tone] ?? TONE_TAG.slate)}>
      {meta.short}
    </span>
  );
}

function ChipGroup({ label, children }) {
  const labelId = React.useId();
  return (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      <p id={labelId} className="eyebrow">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PickerChip({ active, emphasis = false, onClick, title, className, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      title={title}
      onClick={onClick}
      className={cn(
        "chip tap-target max-w-full px-3 text-sm transition-colors",
        active
          ? emphasis
            ? "border-primary bg-primary text-primary-foreground"
            : "border-primary bg-primary-soft"
          : "bg-card hover:border-primary/40 hover:bg-primary-soft",
        FOCUS_RING,
        className
      )}
    >
      {children}
    </button>
  );
}

/** The one card that must never be ambiguous: whose goal is this, and where does it stand. */
function GoalSummary({ goal, student, analysis, meta }) {
  const baselineText = formatGoalPoint(goal, "baseline");
  const targetText = formatGoalPoint(goal, "target");

  return (
    <div className="spine rounded-2xl border bg-card p-3.5 pl-4" data-tone={analysis?.tone ?? "slate"}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold">{student?.name ?? "Student"}</span>
        {student?.grade ? <span className="text-xs text-muted-foreground">{student.grade}</span> : null}
        {analysis ? (
          <Badge variant={TONE_BADGE[analysis.tone] ?? "secondary"} className="ml-auto">
            {analysis.statusLabel}
          </Badge>
        ) : null}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{goalDescription(goal) || "Goal"}</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{meta.label}</span>
        {baselineText && targetText ? (
          <span>
            Baseline {baselineText} <span aria-hidden="true">→</span> target {targetText}
          </span>
        ) : null}
        {analysis ? (
          <span>
            {analysis.latest
              ? `Last check ${formatMeasurement(analysis.latest.value, analysis.type, analysis.config)}`
              : "No checks yet"}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/** One optional field behind the disclosure. */
function DetailField({ id, label, children }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>
      {children}
    </div>
  );
}

export function QuickCapture({
  open,
  onOpenChange,
  students = [],
  goals = [],
  logs = [],
  initialGoalId = null,
  onSave,
  busy = false,
}) {
  const [studentId, setStudentId] = React.useState(null);
  const [goalId, setGoalId] = React.useState(null);
  const [dateISO, setDateISO] = React.useState(todayISO);
  const [value, setValue] = React.useState("");
  const [detail, setDetail] = React.useState(EMPTY_DETAIL);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [announcement, setAnnouncement] = React.useState("");

  const panelRef = React.useRef(null);
  const valueRef = React.useRef(null);
  const wasOpenRef = React.useRef(false);
  const titleId = React.useId();
  const detailsId = React.useId();
  const dateId = React.useId();
  const valueId = React.useId();
  const readbackId = React.useId();
  const contextId = React.useId();
  const evidenceId = React.useId();
  const accommodationsId = React.useId();
  const notesId = React.useId();

  useDialogBehaviour({ open, onOpenChange, panelRef, initialFocusRef: valueRef });

  const caseload = React.useMemo(() => analyzeCaseload({ students, goals, logs }), [students, goals, logs]);
  const analysisByGoal = React.useMemo(
    () => new Map(caseload.analyses.map(analysis => [analysis.goalId, analysis])),
    [caseload]
  );
  // analyzeCaseload ranks by how much a goal needs a human, which is exactly
  // the order "Save and next" should walk.
  const rankedGoalIds = React.useMemo(() => caseload.ranked.map(analysis => analysis.goalId), [caseload]);
  const goalById = React.useMemo(() => new Map(goals.map(goal => [goal.id, goal])), [goals]);
  const studentById = React.useMemo(() => new Map(students.map(student => [student.id, student])), [students]);
  const optionsByStudent = React.useMemo(() => {
    const map = new Map();
    for (const entry of caseload.byStudent) {
      map.set(
        entry.studentId,
        entry.analyses.map(analysis => ({ goal: goalById.get(analysis.goalId), analysis })).filter(item => item.goal)
      );
    }
    return map;
  }, [caseload, goalById]);

  const selectedGoal = goalId ? goalById.get(goalId) ?? null : null;
  const selectedStudent = studentId ? studentById.get(studentId) ?? null : null;
  const studentOptions = optionsByStudent.get(studentId) ?? [];

  const type = measurementTypeOf(selectedGoal?.measurementType);
  const meta = measurementMeta(type);
  const config = React.useMemo(() => normalizeGoalConfig(goalConfigOf(selectedGoal)), [selectedGoal]);
  const entry = selectedGoal ? parseMeasurement(value, type, config) : null;
  const reading = entry?.ok ? formatMeasurement(entry.score, type, config) : "";
  const valueTyped = Boolean(value.trim());
  const canSave = Boolean(selectedGoal && entry?.ok && !busy);
  const setDetailField = key => event => setDetail(current => ({ ...current, [key]: event.target.value }));

  React.useLayoutEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) {
      // Goals or logs changed underneath an open sheet: repair a stale pick
      // without stomping on the teacher's own selection.
      setStudentId(current =>
        current && studentById.has(current) ? current : caseload.byStudent[0]?.studentId ?? students[0]?.id ?? null
      );
      setGoalId(current => (current && goalById.has(current) ? current : rankedGoalIds[0] ?? goals[0]?.id ?? null));
      return;
    }
    wasOpenRef.current = true;
    // Opening starts clean: today's date, empty fields, and the goal the app
    // asked for (or the most urgent candidate). A half-finished entry from a
    // previous student must never be waiting when the sheet comes back.
    const requested = initialGoalId ? goalById.get(initialGoalId) : null;
    const first = requested ?? (rankedGoalIds.length ? goalById.get(rankedGoalIds[0]) : goals[0]) ?? null;
    setStudentId(first?.studentId ?? caseload.byStudent[0]?.studentId ?? students[0]?.id ?? null);
    setGoalId(first?.id ?? null);
    setDateISO(todayISO());
    setValue("");
    setDetail(EMPTY_DETAIL);
    setDetailOpen(false);
    setAnnouncement("");
  }, [open, initialGoalId, goalById, rankedGoalIds, goals, caseload, students, studentById]);

  const selectStudent = nextStudentId => {
    if (nextStudentId === studentId) return;
    setStudentId(nextStudentId);
    setGoalId((optionsByStudent.get(nextStudentId) ?? [])[0]?.goal.id ?? null);
    setValue("");
    // Detail typed about one child must never follow the teacher to another.
    setDetail(EMPTY_DETAIL);
  };

  const selectGoal = nextGoalId => {
    setGoalId(nextGoalId);
    // The typed value belongs to the previous goal's scale; start clean.
    setValue("");
  };

  const handleSave = () => {
    if (!canSave) return;

    onSave?.({
      goalId: selectedGoal.id,
      dateISO,
      rawValue: value.trim(),
      context: detail.context.trim(),
      evidenceNote: detail.evidenceNote.trim(),
      accommodations: detail.accommodations.trim(),
      notes: detail.notes.trim(),
    });

    // "Save and next" is the feature: a teacher walking 30 students with six
    // goals each should never have to reopen the sheet between checks.
    const index = rankedGoalIds.indexOf(selectedGoal.id);
    const nextId =
      rankedGoalIds.length === 0 ? null : rankedGoalIds[index === -1 ? 0 : (index + 1) % rankedGoalIds.length];
    const nextGoal = nextId ? goalById.get(nextId) : null;

    setGoalId(nextId);
    if (nextGoal) setStudentId(nextGoal.studentId);
    setValue("");
    setDetail(EMPTY_DETAIL);
    setAnnouncement(nextGoal ? `Saved. Next up: ${studentById.get(nextGoal.studentId)?.name ?? "next student"}.` : "Saved.");

    // Land the keyboard back on the value for the next check.
    requestAnimationFrame(() => valueRef.current?.focus());
  };

  if (!open) return null;

  const body =
    students.length === 0 ? (
      <EmptyHint icon={Users}>
        No students yet. Add a student and a goal first, then a check takes seconds to log here.
      </EmptyHint>
    ) : (
      <div className="space-y-5">
        <ChipGroup label="Student">
          {caseload.byStudent.map(student => (
            <PickerChip
              key={student.studentId}
              active={student.studentId === studentId}
              emphasis
              onClick={() => selectStudent(student.studentId)}
            >
              <span className="font-semibold">{student.name}</span>
              {student.grade ? <span className="text-2xs font-medium opacity-70">{student.grade}</span> : null}
            </PickerChip>
          ))}
        </ChipGroup>

        {studentOptions.length === 0 ? (
          <EmptyHint icon={Users}>
            {selectedStudent ? `${selectedStudent.name} has no goals yet.` : "Pick a student to see their goals."} Add
            one from the Goals tab, then come back.
          </EmptyHint>
        ) : (
          <>
            <ChipGroup label="Goal">
              {studentOptions.map(({ goal, analysis }) => (
                <PickerChip
                  key={goal.id}
                  active={goal.id === goalId}
                  title={goalDescription(goal)}
                  onClick={() => selectGoal(goal.id)}
                >
                  <span className="max-w-[9.5rem] truncate font-semibold">{goalDescription(goal) || "Goal"}</span>
                  <StatusTag status={analysis.status} />
                </PickerChip>
              ))}
            </ChipGroup>

            {selectedGoal ? (
              <>
                <GoalSummary
                  goal={selectedGoal}
                  student={selectedStudent}
                  analysis={analysisByGoal.get(selectedGoal.id)}
                  meta={meta}
                />

                <div className="space-y-2">
                  <Label htmlFor={valueId} className="text-base">{meta.label}</Label>
                  <Input
                    ref={valueRef}
                    id={valueId}
                    value={value}
                    onChange={event => setValue(event.target.value)}
                    onKeyDown={event => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleSave();
                      }
                    }}
                    placeholder={meta.placeholder}
                    // Trials stays a text field because "4 of 5" is valid
                    // input; every other type can open a numeric keypad.
                    inputMode={type === "trials" ? "text" : "decimal"}
                    autoComplete="off"
                    enterKeyHint="done"
                    invalid={valueTyped && !entry?.ok}
                    aria-describedby={readbackId}
                    className="stat-value h-16 px-4 text-center text-3xl"
                  />
                  <p id={readbackId} className="min-h-[1.25rem] text-sm leading-snug">
                    {!valueTyped ? (
                      <span className="text-muted-foreground">{meta.hint}</span>
                    ) : entry?.ok ? (
                      <span className="text-muted-foreground">
                        Recorded as <strong className="stat-value text-base text-foreground">{reading}</strong>
                        {entry.display && entry.display !== reading ? ` from "${value.trim()}"` : ""}
                      </span>
                    ) : (
                      <span className="text-destructive">{entry?.error}</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor={dateId}>Date</Label>
                  <Input
                    id={dateId}
                    type="date"
                    value={dateISO}
                    onChange={event => setDateISO(event.target.value)}
                    className="tabular h-11 w-auto max-w-[11rem]"
                  />
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    aria-expanded={detailOpen}
                    aria-controls={detailsId}
                    onClick={() => setDetailOpen(current => !current)}
                    className={cn(
                      "tap-target flex w-full items-center justify-between rounded-xl border bg-card px-3.5 text-sm font-semibold",
                      "transition-colors hover:border-primary/40 hover:bg-primary-soft",
                      FOCUS_RING
                    )}
                  >
                    <span>Add detail</span>
                    <ChevronDown
                      className={cn("size-4 text-muted-foreground transition-transform", detailOpen && "rotate-180")}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Kept mounted (hidden) so collapsing never clears a field,
                      and focus is not yanked out from under the teacher. */}
                  <div id={detailsId} hidden={!detailOpen} className="space-y-4">
                    <DetailField id={contextId} label="Setting and conditions">
                      <Input
                        id={contextId}
                        value={detail.context}
                        onChange={setDetailField("context")}
                        placeholder="e.g. small group, verbal prompts, after lunch"
                      />
                    </DetailField>
                    <DetailField id={evidenceId} label="Evidence">
                      <Input
                        id={evidenceId}
                        value={detail.evidenceNote}
                        onChange={setDetailField("evidenceNote")}
                        placeholder="e.g. running record, probe sheet 12, work sample"
                      />
                    </DetailField>
                    <DetailField id={accommodationsId} label="Accommodations used">
                      <Input
                        id={accommodationsId}
                        value={detail.accommodations}
                        onChange={setDetailField("accommodations")}
                        placeholder="Comma separated, e.g. extended time, read aloud"
                      />
                    </DetailField>
                    <DetailField id={notesId} label="Notes">
                      <Textarea
                        id={notesId}
                        value={detail.notes}
                        onChange={setDetailField("notes")}
                        placeholder="What supported this session?"
                        rows={2}
                      />
                    </DetailField>
                  </div>
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="fixed inset-0 animate-fade-in bg-foreground/40 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        tabIndex={-1}
        className="relative z-50 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border bg-card shadow-float focus-visible:outline-none sm:max-w-lg sm:rounded-3xl"
      >
        <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <p className="eyebrow">Quick capture</p>
            <h2 id={titleId} className="headline text-xl">Log a check</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange?.(false)}
            aria-label="Close quick capture"
            className={cn(
              "tap-target -mr-2 -mt-1 grid place-items-center rounded-xl px-2 text-muted-foreground",
              "transition-colors hover:bg-muted hover:text-foreground",
              FOCUS_RING
            )}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{body}</div>

        <footer className="capture-dock border-t bg-card px-5 pt-3">
          <Button
            type="button"
            size="lg"
            className="tap-target w-full"
            disabled={!canSave}
            loading={busy}
            onClick={handleSave}
          >
            {busy ? "Saving…" : "Save and next"}
          </Button>
          <p className="mt-1.5 text-center text-2xs leading-relaxed text-muted-foreground" aria-live="polite">
            {announcement || "Saves and moves to the next goal on your list."}
          </p>
        </footer>
      </div>
    </div>
  );
}

/** The persistent thumb-reachable button that opens the sheet. */
export function CaptureDock({ onOpen, attentionCount = 0, className }) {
  const numeric = Number(attentionCount);
  const count = Number.isFinite(numeric) && numeric > 0 ? Math.trunc(numeric) : 0;

  return (
    <div data-print="hide" className={cn("fixed inset-x-0 bottom-0 z-40", className)}>
      <div className="capture-dock border-t bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-2.5">
          <Button type="button" size="lg" className="tap-target flex-1 sm:min-w-[12.5rem] sm:flex-none" onClick={onOpen}>
            <ClipboardCheck aria-hidden="true" strokeWidth={2.4} />
            Log a check
          </Button>
          {count > 0 ? (
            <Badge variant="warning" className="tap-target shrink-0 whitespace-nowrap px-3">
              {count} {count === 1 ? "student needs" : "students need"} attention
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
