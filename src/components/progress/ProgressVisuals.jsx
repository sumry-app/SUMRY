import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { buildChartSeries, shortDayLabel, statusMeta } from "@/lib/progress/analysis";
import { formatMeasurement } from "@/lib/progress/measurement";
import { cn } from "@/lib/utils";

/**
 * Presentation for the analysis engine. Kept in one place so the triage board,
 * the goal detail dialog and the printable report all describe a goal the same
 * way - a teacher should never see two different verdicts for one goal.
 */

const TONE_VARIANT = {
  green: "success",
  amber: "warning",
  red: "destructive",
  slate: "outline",
};

const TONE_DOT = {
  green: "bg-success",
  amber: "bg-warning",
  red: "bg-destructive",
  slate: "bg-muted-foreground",
};

export function statusBadgeVariant(status) {
  return TONE_VARIANT[statusMeta(status).tone] ?? "outline";
}

export function statusDotClass(status) {
  return TONE_DOT[statusMeta(status).tone] ?? TONE_DOT.slate;
}

export function StatusBadge({ status, className, showIcon = false }) {
  const meta = statusMeta(status);
  return (
    <Badge variant={statusBadgeVariant(status)} className={className}>
      {showIcon && <span className={cn("size-1.5 rounded-full", statusDotClass(status))} aria-hidden />}
      {meta.label}
    </Badge>
  );
}

/**
 * A twelve-point line small enough to sit in a list row. Drawn as SVG rather
 * than with the charting library so a caseload of thirty students is thirty
 * cheap elements, not thirty chart instances.
 */
export function Sparkline({ analysis, width = 84, height = 26, className, title }) {
  const points = analysis?.points ?? [];
  if (points.length < 2) {
    return <div className={cn("h-[26px] w-[84px] rounded bg-muted", className)} aria-hidden="true" />;
  }

  const values = points.map(p => p.value);
  const bounds = [analysis.baseline, analysis.target, ...values].filter(v => Number.isFinite(v));
  let min = Math.min(...bounds);
  let max = Math.max(...bounds);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const pad = (max - min) * 0.12;
  min -= pad;
  max += pad;

  const firstDay = points[0].day;
  const lastDay = points[points.length - 1].day;
  const span = lastDay - firstDay || 1;

  const x = day => ((day - firstDay) / span) * (width - 4) + 2;
  const y = value => height - 3 - ((value - min) / (max - min)) * (height - 6);

  const path = points.map(p => `${x(p.day).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const meta = statusMeta(analysis.status);

  const stroke =
    meta.tone === "green" ? "#16a34a" : meta.tone === "amber" ? "#d97706" : meta.tone === "red" ? "#dc2626" : "#94a3b8";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title || `${points.length} progress points, ${meta.label}`}
    >
      {Number.isFinite(analysis.target) && analysis.target >= min && analysis.target <= max && (
        <line
          x1="2"
          x2={width - 2}
          y1={y(analysis.target)}
          y2={y(analysis.target)}
          stroke="#16a34a"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.55"
        />
      )}
      <polyline points={path} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.day)} cy={y(last.value)} r="2.5" fill={stroke} />
    </svg>
  );
}

/**
 * The full trend view: recorded points, the aim line the goal implies, the
 * fitted trend extended to the end date, and the baseline/target reference
 * lines. The aim line is the piece most progress-monitoring charts leave out,
 * and without it a chart cannot answer "is this enough?".
 */
export function TrendChart({ analysis, height = 260, showLegend = true }) {
  const series = buildChartSeries(analysis);
  if (series.length === 0) return null;

  const config = analysis.config ?? {};
  const tick = value =>
    Number.isFinite(value) ? Math.round(value * 10) / 10 : value;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series} margin={{ top: 8, right: 16, bottom: 4, left: -14 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        {/* A numeric day axis, not a category axis. With categories every point
            sits one slot from the next, so the gap between the last observation
            and the goal's end date - which can be months - would be drawn as
            narrow as a single week and the aim line would look like it jumps. */}
        <XAxis
          dataKey="day"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickFormatter={shortDayLabel}
          stroke="#64748b"
          tick={{ fontSize: 11 }}
        />
        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={tick} />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            fontSize: "12px",
          }}
          labelFormatter={day => shortDayLabel(day)}
          formatter={(value, name) => [
            value === null || value === undefined ? "-" : formatMeasurement(value, analysis.type, config),
            name,
          ]}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: "12px" }} />}

        {Number.isFinite(analysis.baseline) && (
          <ReferenceLine
            y={analysis.baseline}
            stroke="#94a3b8"
            strokeDasharray="4 4"
            label={{ value: "Baseline", position: "insideTopLeft", fontSize: 10, fill: "#64748b" }}
          />
        )}
        {Number.isFinite(analysis.target) && (
          <ReferenceLine
            y={analysis.target}
            stroke="#16a34a"
            strokeDasharray="4 4"
            label={{ value: "Target", position: "insideBottomLeft", fontSize: 10, fill: "#16a34a" }}
          />
        )}

        <Line
          type="linear"
          dataKey="aim"
          stroke="#94a3b8"
          strokeWidth={1.5}
          dot={false}
          name="Aim line"
          connectNulls
        />
        <Line
          type="linear"
          dataKey="trend"
          stroke="#6366f1"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          name="Trend"
          connectNulls
        />
        <Line
          type="linear"
          dataKey="value"
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#2563eb" }}
          name="Recorded"
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * The one-line reason a goal is in the list, in the teacher's words rather than
 * a status word on its own.
 */
export function statusReason(analysis) {
  if (!analysis) return "";
  if (analysis.daysSinceLastLog === null) return "No progress checks recorded";
  if (analysis.status === "no-recent-data") return `${analysis.daysSinceLastLog} days since the last check`;
  if (analysis.status === "insufficient-data") {
    return `${analysis.dataPoints} of 3 checks needed`;
  }
  if (analysis.deadlineAssumed) return "No end date recorded";
  return "";
}
