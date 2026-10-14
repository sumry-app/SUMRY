import {
  Area,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
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

  // A coloured trend line is a claim about direction. When the goal has gone
  // quiet, when there are too few checks, or when no trend line could be
  // fitted, that claim is not the app's to make: the line and its end dot fall
  // back to the neutral slate and the label says the data is not sufficient.
  const trend = Number.isFinite(analysis?.trend) ? analysis.trend : analysis?.slopePerWeek;
  const neutral =
    analysis.status === "no-recent-data" ||
    analysis.status === "insufficient-data" ||
    !Number.isFinite(trend);

  const stroke = neutral
    ? "hsl(var(--muted-foreground))"
    : meta.tone === "green"
      ? "hsl(var(--success))"
      : meta.tone === "amber"
        ? "hsl(var(--warning))"
        : meta.tone === "red"
          ? "hsl(var(--destructive))"
          : "hsl(var(--muted-foreground))";

  const ariaLabel =
    title ||
    (neutral
      ? `${points.length} progress points recorded; not enough data to show a trend`
      : `${points.length} progress points, ${meta.label}`);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={ariaLabel}
    >
      {Number.isFinite(analysis.target) && analysis.target >= min && analysis.target <= max && (
        <line
          x1="2"
          x2={width - 2}
          y1={y(analysis.target)}
          y2={y(analysis.target)}
          stroke="hsl(var(--success))"
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

/*
 * The end-of-line label: a well-made chart names a line where it ends instead
 * of making the eye travel to a key. Only the last real point of the line is
 * drawn, so the word sits on the point the line actually reaches.
 */
function ChartEndLabel({ x, y, index, lastIndex, labelText }) {
  if (index !== lastIndex || !Number.isFinite(x) || !Number.isFinite(y)) return null;
  return (
    <text
      x={x}
      y={y}
      dx={7}
      dy={4}
      textAnchor="start"
      className="chart-label"
      style={{ fontSize: 10, fontWeight: 600, fill: "hsl(var(--foreground))" }}
    >
      {labelText}
    </text>
  );
}

/* The inline key under the chart. The words, dash patterns and classes match
   the three lines, so it reads as a caption rather than a separate legend. */
const TREND_KEY = [
  {
    label: "Aim line",
    className: "chart-line chart-line-aim",
    stroke: "hsl(var(--muted-foreground))",
    strokeWidth: 1.5,
    strokeDasharray: "4 4",
  },
  {
    label: "Trend",
    className: "chart-line chart-line-trend",
    stroke: "hsl(var(--accent))",
    strokeWidth: 2,
    strokeDasharray: "5 4",
  },
  {
    label: "Recorded",
    className: "chart-line chart-line-recorded",
    stroke: "hsl(var(--primary))",
    strokeWidth: 2.5,
  },
];

/**
 * The full trend view: recorded points, the aim line the goal implies, the
 * fitted trend extended to the end date, and the baseline/target reference
 * lines. The aim line is the piece most progress-monitoring charts leave out,
 * and without it a chart cannot answer "is this enough?".
 *
 * `animate` defaults to true for the interactive screens. The printable report
 * passes false, because recharts gates its end-of-line labels on the entry
 * animation having finished, and entering print media re-lays-out the chart -
 * which restarts that animation. A printed page could otherwise catch the
 * recorded line half-drawn with no labels on it at all.
 */
export function TrendChart({ analysis, height = 260, showLegend = true, animate = true }) {
  const series = buildChartSeries(analysis);
  if (series.length === 0) return null;

  const config = analysis.config ?? {};
  const tick = value =>
    Number.isFinite(value) ? Math.round(value * 10) / 10 : value;

  // The corridor between baseline and target makes the aim a region rather
  // than a single dashed line. A recharts Area draws a band only when its
  // dataKey resolves to [low, high], so each point carries that pair.
  const hasCorridor = Number.isFinite(analysis.baseline) && Number.isFinite(analysis.target);
  const corridor = hasCorridor
    ? [Math.min(analysis.baseline, analysis.target), Math.max(analysis.baseline, analysis.target)]
    : null;
  const chartData = hasCorridor
    ? series.map(entry => ({ ...entry, corridor }))
    : series;

  // The last point with a real value for each line. The recorded line ends at
  // the last observation; the aim and trend lines run on to the goal's end
  // date, whose recorded value is deliberately null.
  const lastIndexFor = key => {
    for (let index = series.length - 1; index >= 0; index -= 1) {
      if (Number.isFinite(series[index][key])) return index;
    }
    return -1;
  };
  const aimLast = lastIndexFor("aim");
  const trendLast = lastIndexFor("trend");
  const recordedLast = lastIndexFor("value");

  const axisTick = {
    fontSize: 11,
    fill: "hsl(var(--muted-foreground))",
    style: { fontVariantNumeric: "tabular-nums" },
  };

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        {/* ComposedChart, not LineChart: recharts only renders Area children
            inside a ComposedChart, and the corridor needs an Area. */}
        <ComposedChart data={chartData} margin={{ top: 8, right: 64, bottom: 4, left: -14 }}>
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
            stroke="hsl(var(--muted-foreground))"
            tick={axisTick}
          />
          <YAxis stroke="hsl(var(--muted-foreground))" tick={axisTick} tickFormatter={tick} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "10px",
              fontSize: "12px",
              color: "hsl(var(--foreground))",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            itemStyle={{ color: "hsl(var(--foreground))" }}
            labelFormatter={day => shortDayLabel(day)}
            formatter={(value, name) => [
              value === null || value === undefined ? "-" : formatMeasurement(value, analysis.type, config),
              name,
            ]}
          />

          {/* The corridor first, so it sits behind every line. */}
          {hasCorridor && (
            <Area
              type="linear"
              dataKey="corridor"
              stroke="none"
              fill="hsl(var(--success) / 0.10)"
              fillOpacity={1}
              isAnimationActive={false}
              className="chart-band"
              activeDot={false}
              tooltipType="none"
            />
          )}

          {Number.isFinite(analysis.baseline) && (
            <ReferenceLine
              y={analysis.baseline}
              stroke="hsl(var(--border))"
              strokeDasharray="4 4"
              label={{ value: "Baseline", position: "insideTopLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
          )}
          {Number.isFinite(analysis.target) && (
            <ReferenceLine
              y={analysis.target}
              stroke="hsl(var(--success))"
              strokeDasharray="4 4"
              label={{ value: "Target", position: "insideBottomLeft", fontSize: 10, fill: "hsl(var(--success))" }}
            />
          )}

          <Line
            type="linear"
            dataKey="aim"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1.5}
            dot={false}
            name="Aim line"
            connectNulls
            className="chart-line chart-line-aim"
            isAnimationActive={animate}
          >
            <LabelList
              dataKey="aim"
              content={props => <ChartEndLabel {...props} lastIndex={aimLast} labelText="Aim" />}
            />
          </Line>
          <Line
            type="linear"
            dataKey="trend"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            name="Trend"
            connectNulls
            className="chart-line chart-line-trend"
            isAnimationActive={animate}
          >
            <LabelList
              dataKey="trend"
              content={props => <ChartEndLabel {...props} lastIndex={trendLast} labelText="Trend" />}
            />
          </Line>
          <Line
            type="linear"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ r: 4, className: "chart-dot", fill: "hsl(var(--primary))", stroke: "hsl(var(--primary))" }}
            name="Recorded"
            connectNulls
            className="chart-line chart-line-recorded"
            isAnimationActive={animate}
          >
            <LabelList
              dataKey="value"
              content={props => <ChartEndLabel {...props} lastIndex={recordedLast} labelText="Recorded" />}
            />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
      {showLegend && (
        <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-xs text-muted-foreground">
          {TREND_KEY.map(item => (
            <li key={item.label} className="flex items-center gap-1.5">
              <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true" className="shrink-0">
                <line
                  x1="1"
                  y1="4"
                  x2="21"
                  y2="4"
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  strokeDasharray={item.strokeDasharray}
                  className={item.className}
                />
              </svg>
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
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
