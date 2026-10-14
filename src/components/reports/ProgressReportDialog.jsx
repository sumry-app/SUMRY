import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Download, FileText, Printer, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge, TrendChart } from "@/components/progress/ProgressVisuals";
import { useToast } from "@/components/ui/Toast";
import { analyzeGoal, STATUS_META } from "@/lib/progress/analysis";
import { describeMeasurement, formatMeasurement, formatRecorded } from "@/lib/progress/measurement";

/**
 * The quarterly progress report a teacher has to produce in order to prove the
 * IEP is being implemented.
 *
 * Three things make it defensible, and all three are deliberate:
 *
 *   1. Every claim about progress is shown next to the data it came from, and
 *      the raw evidence for each observation travels with it.
 *   2. The aim line is drawn, so "is this enough?" has an answer rather than an
 *      impression.
 *   3. Where there is not enough evidence, the report says so instead of
 *      smoothing it over. A report that overstates progress is worse than no
 *      report, because a team makes placement decisions from it.
 *
 * It is rendered in its own portal rather than the shared dialog because the
 * app's print stylesheet hides dialogs - and this is the one dialog whose whole
 * purpose is to reach paper.
 */
export function ProgressReportDialog({ student, store, onClose }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.classList.add("report-printing");
    return () => document.body.classList.remove("report-printing");
  }, []);

  useEffect(() => {
    const onKeyDown = event => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const report = useMemo(() => {
    if (!student) return null;

    const goals = store.goals.filter(goal => goal.studentId === student.id);
    const analyses = goals
      .map(goal => ({
        analysis: analyzeGoal({ goal, logs: store.logs.filter(log => log.goalId === goal.id) }),
        goal,
      }))
      .sort((a, b) => b.analysis.priority - a.analysis.priority);

    const days = analyses
      .flatMap(({ analysis }) => analysis.points.map(point => point.day))
      .filter(Number.isFinite);

    const counts = {};
    for (const { analysis } of analyses) {
      counts[analysis.status] = (counts[analysis.status] ?? 0) + 1;
    }

    return {
      analyses,
      counts,
      observations: analyses.reduce((sum, item) => sum + item.analysis.dataPoints, 0),
      firstDay: days.length ? Math.min(...days) : null,
      lastDay: days.length ? Math.max(...days) : null,
    };
  }, [student, store.goals, store.logs]);

  if (!student || !report) return null;

  const dayToText = day =>
    Number.isFinite(day)
      ? new Date(day * 86400000).toLocaleDateString(undefined, {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        })
      : "no recorded date";

  const handlePdf = async () => {
    setBusy(true);
    try {
      // Loaded on demand: jsPDF and its companions are a few hundred kilobytes
      // that nobody should download unless they actually ask for a PDF.
      const { generateStudentProgressReport } = await import("@/lib/pdfReports");
      await generateStudentProgressReport(
        { students: store.students, goals: store.goals, logs: store.logs },
        student
      );
      toast.success("PDF summary downloaded");
    } catch (error) {
      toast.info("The PDF could not be generated", {
        description: error?.message
          ? `${error.message} Use Print / Save as PDF instead - it includes the charts.`
          : "Use Print / Save as PDF instead - it includes the charts.",
      });
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="report-portal fixed inset-0 z-50 overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Progress report for ${student.name}`}
        className="report-sheet mx-auto w-full max-w-4xl rounded-2xl border bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Individualized Education Program
            </p>
            <h2 className="headline mt-1 text-2xl">Progress Report</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prepared {new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex shrink-0 gap-2 print:hidden" data-print="hide">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer strokeWidth={2.2} />
              Print / Save as PDF
            </Button>
            <Button size="sm" variant="outline" onClick={handlePdf} disabled={busy}>
              <Download strokeWidth={2.2} />
              {busy ? "Preparing..." : "Summary PDF"}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} aria-label="Close report">
              <X strokeWidth={2.2} />
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-3 border-y py-4 sm:grid-cols-2">
          <div className="flex gap-2 text-sm">
            <dt className="w-32 shrink-0 font-semibold">Student</dt>
            <dd>{student.name}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="w-32 shrink-0 font-semibold">Grade</dt>
            <dd>{student.grade || "Not specified"}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="w-32 shrink-0 font-semibold">Classification</dt>
            <dd>{student.disability || "Not specified"}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="w-32 shrink-0 font-semibold">Goals reported</dt>
            <dd>{report.analyses.length}</dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="w-32 shrink-0 font-semibold">Reporting period</dt>
            <dd>
              {report.observations === 0
                ? "No data recorded"
                : `${dayToText(report.firstDay)} to ${dayToText(report.lastDay)}`}
            </dd>
          </div>
          <div className="flex gap-2 text-sm">
            <dt className="w-32 shrink-0 font-semibold">Observations</dt>
            <dd>{report.observations}</dd>
          </div>
        </dl>

        <p className="mt-4 text-sm leading-relaxed">
          This report is built only from observations that were recorded on the date shown. Nothing has been
          inferred, averaged across goals, or filled in where data was missing.
        </p>

        {report.analyses.length === 0 ? (
          <p className="mt-8 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            This student has no goals yet, so there is nothing to report.
          </p>
        ) : (
          <ol className="mt-8 space-y-10">
            {report.analyses.map(({ analysis, goal }, index) => (
              <li key={analysis.goalId} className="report-goal break-inside-avoid">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Goal {index + 1}
                  </span>
                  <Badge variant="outline">{analysis.area}</Badge>
                  <Badge variant="secondary">{describeMeasurement(goal)}</Badge>
                  <StatusBadge status={analysis.status} className="ml-auto" />
                </div>

                <h3 className="mt-2 text-base font-semibold leading-snug">{goal.description}</h3>

                <div className="mt-3 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">Baseline </span>
                    <span className="font-semibold">{analysis.baselineText || "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Most recent </span>
                    <span className="font-semibold">
                      {analysis.latest
                        ? formatMeasurement(analysis.latest.value, analysis.type, analysis.config)
                        : "-"}
                    </span>
                    {analysis.latest && (
                      <span className="text-muted-foreground"> ({analysis.latest.dateISO})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Target </span>
                    <span className="font-semibold">{analysis.targetText || "-"}</span>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed">{analysis.explanation}</p>

                {analysis.threeBelowAimLine && (
                  <p className="mt-2 text-sm font-medium">
                    Decision rule: three consecutive checks have fallen below the aim line, which is the point the
                    IEP team is asked to review the goal.
                  </p>
                )}

                {analysis.dataPoints >= 2 && (
                  <div className="mt-5 rounded-xl border p-4">
                    <TrendChart analysis={analysis} height={230} />
                  </div>
                )}

                {analysis.dataPoints === 0 ? (
                  <p className="mt-4 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    No observations recorded for this goal in the period. Progress cannot be reported.
                  </p>
                ) : (
                  <table className="mt-5 w-full border-collapse text-left text-xs">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1.5 font-semibold">Date</th>
                        <th className="border px-2 py-1.5 font-semibold">Recorded</th>
                        <th className="border px-2 py-1.5 font-semibold">Setting / conditions</th>
                        <th className="border px-2 py-1.5 font-semibold">Evidence</th>
                        <th className="border px-2 py-1.5 font-semibold">Accommodations used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.points.map(point => (
                        <tr key={point.log.id}>
                          <td className="border px-2 py-1.5 align-top whitespace-nowrap">{point.log.dateISO}</td>
                          <td className="border px-2 py-1.5 align-top font-medium">
                            {formatRecorded(point.log, goal)}
                          </td>
                          <td className="border px-2 py-1.5 align-top">
                            {point.log.context || "-"}
                            {point.log.notes ? <div className="mt-1 text-muted-foreground">{point.log.notes}</div> : null}
                          </td>
                          <td className="border px-2 py-1.5 align-top">{point.log.evidenceNote || "-"}</td>
                          <td className="border px-2 py-1.5 align-top">
                            {point.log.accommodationsUsed?.length ? point.log.accommodationsUsed.join(", ") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <p className="mt-3 text-sm">
                  <span className="font-semibold">Next step: </span>
                  {analysis.nextAction}
                </p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-10 border-t pt-4 text-xs leading-relaxed text-muted-foreground">
          <p>
            Prepared from {report.observations} documented observation{report.observations === 1 ? "" : "s"} recorded
            between {report.observations === 0 ? "no dates" : `${dayToText(report.firstDay)} and ${dayToText(report.lastDay)}`}.
            Trend lines are the least-squares fit through the recorded points; aim lines run from the baseline at the
            start of the goal period to the target at its end date.
          </p>
          <p className="mt-2">
            Where a goal shows fewer than three observations, no trend is reported. An absence of data is reported as
            an absence of data.
          </p>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="border-t pt-2 text-xs text-muted-foreground">
            Case manager signature and date
          </div>
          <div className="border-t pt-2 text-xs text-muted-foreground">
            Parent / guardian signature and date
          </div>
        </div>

        <div className="mt-6 flex justify-end print:hidden" data-print="hide">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ProgressReportDialog;
