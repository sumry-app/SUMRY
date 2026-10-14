import { useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, ChevronRight, FileText, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkline, StatusBadge, statusReason } from "@/components/progress/ProgressVisuals";
import { analyzeCaseload, STATUS_META } from "@/lib/progress/analysis";
import { formatMeasurement } from "@/lib/progress/measurement";
import { cn } from "@/lib/utils";

/**
 * Who needs attention this week.
 *
 * A caseload of thirty students with six goals each is 180 goals. The number a
 * teacher can act on is not "average progress" - it is the short list of goals
 * where the plan is not working or the data has stopped, ordered so the most
 * urgent decision is at the top. That is what this view is, and it is why it
 * sorts by decision urgency rather than by score.
 */

const ATTENTION_STATUSES = ["regressing", "off-track", "at-risk", "no-recent-data"];

const FILTERS = [
  { id: "attention", label: "Needs attention", statuses: ATTENTION_STATUSES },
  { id: "off-track", label: "Off track", statuses: ["regressing", "off-track"] },
  { id: "at-risk", label: "At risk", statuses: ["at-risk"] },
  { id: "stale", label: "No recent check", statuses: ["no-recent-data"] },
  { id: "no-data", label: "Not enough data", statuses: ["insufficient-data"] },
  { id: "healthy", label: "On track", statuses: ["on-track", "met"] },
  { id: "all", label: "Every goal", statuses: null },
];

function CountChip({ filter, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary/30 bg-primary-soft text-primary-strong"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      )}
    >
      {filter.label}
      <span className={cn("tabular-nums", active ? "text-primary-strong" : "text-foreground")}>{count}</span>
    </button>
  );
}

function GoalRow({ analysis, onLogProgress, onOpenGoal }) {
  const reason = statusReason(analysis);
  const latest = analysis.latest;

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/50">
      <span className={cn("size-1.5 shrink-0 rounded-full", `bg-${analysis.tone}`)} aria-hidden="true" />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenGoal?.(analysis.goalId)}
            className="truncate text-left text-sm font-medium hover:underline"
            title={analysis.description}
          >
            {analysis.description || "Untitled goal"}
          </button>
          <Badge variant="outline" className="shrink-0">
            {analysis.area}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {latest
            ? `${formatMeasurement(latest.value, analysis.type, analysis.config)} on ${latest.dateISO}`
            : "No data recorded"}
          {analysis.targetText ? ` · target ${analysis.targetText}` : ""}
          {reason ? ` · ${reason}` : ""}
        </p>
      </div>

      <Sparkline analysis={analysis} className="hidden sm:block" />

      <StatusBadge status={analysis.status} className="shrink-0" />

      <div className="flex shrink-0 gap-1">
        <Button size="sm" variant="ghost" onClick={() => onLogProgress?.(analysis.goalId)} title="Log a progress check">
          <CalendarPlus strokeWidth={2.2} />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onOpenGoal?.(analysis.goalId)} title="Open the goal">
          <ChevronRight strokeWidth={2.2} />
        </Button>
      </div>
    </li>
  );
}

export function CaseloadTriage({ store, onLogProgress, onOpenGoal, onOpenReport }) {
  const [filterId, setFilterId] = useState("attention");
  const [expanded, setExpanded] = useState(() => new Set());

  const caseload = useMemo(
    () => analyzeCaseload({ students: store.students, goals: store.goals, logs: store.logs }),
    [store.students, store.goals, store.logs]
  );

  const filter = FILTERS.find(f => f.id === filterId) ?? FILTERS[0];

  const groups = useMemo(() => {
    return caseload.byStudent
      .map(group => ({
        ...group,
        visible: filter.statuses
          ? group.analyses.filter(a => filter.statuses.includes(a.status))
          : group.analyses,
      }))
      .filter(group => group.visible.length > 0);
  }, [caseload.byStudent, filter]);

  const counts = useMemo(() => {
    const byFilter = {};
    for (const f of FILTERS) {
      byFilter[f.id] = f.statuses
        ? caseload.analyses.filter(a => f.statuses.includes(a.status)).length
        : caseload.analyses.length;
    }
    return byFilter;
  }, [caseload.analyses]);

  const toggle = studentId =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });

  if (store.students.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No caseload yet"
        description="Add students and goals, then this board will rank every goal by how much it needs you this week."
      />
    );
  }

  if (store.goals.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No goals to monitor"
        description="Progress monitoring starts with a measurable goal. Add one and this board will tell you which are off the aim line."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="surface p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="headline text-xl">Who needs attention this week</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{caseload.headline}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onOpenReport?.(caseload.byStudent[0]?.studentId)}>
            <FileText strokeWidth={2.2} />
            Caseload report
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <CountChip
              key={f.id}
              filter={f}
              count={counts[f.id] ?? 0}
              active={f.id === filterId}
              onClick={() => setFilterId(f.id)}
            />
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="surface flex items-start gap-3 p-5">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-muted-foreground" strokeWidth={2} />
          <div>
            <p className="text-sm font-semibold">Nothing in this category</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Every goal is either on track or already met. Switch to another filter to see the rest of the caseload.
            </p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map(group => {
            const isOpen = expanded.has(group.studentId) || groups.length <= 3;
            const shown = isOpen ? group.visible : group.visible.slice(0, 1);

            return (
              <li key={group.studentId} className="surface overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggle(group.studentId)}
                        className="text-sm font-semibold hover:underline"
                      >
                        {group.name}
                      </button>
                      {group.grade && <span className="text-xs text-muted-foreground">Grade {group.grade}</span>}
                      {group.worst && <StatusBadge status={group.worst.status} />}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {group.visible.length} of {group.analyses.length}{" "}
                      {group.analyses.length === 1 ? "goal" : "goals"} in this view
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => onOpenReport?.(group.studentId)}>
                      <FileText strokeWidth={2.2} />
                      Report
                    </Button>
                    {group.visible.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => toggle(group.studentId)}>
                        {isOpen ? "Show less" : `Show all ${group.visible.length}`}
                      </Button>
                    )}
                  </div>
                </div>

                <ul className="space-y-0.5 border-t px-2.5 py-2">
                  {shown.map(analysis => (
                    <GoalRow
                      key={analysis.goalId}
                      analysis={analysis}
                      onLogProgress={onLogProgress}
                      onOpenGoal={onOpenGoal}
                    />
                  ))}
                </ul>

                {shown[0] && (
                  <div className="border-t bg-muted/40 px-5 py-3">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {STATUS_META[group.worst.status]?.label ?? group.worst.statusLabel}:{" "}
                      </span>
                      {group.worst.explanation}
                    </p>
                    <p className="mt-1 text-xs font-medium text-foreground">{group.worst.nextAction}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default CaseloadTriage;
