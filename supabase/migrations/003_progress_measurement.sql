-- ============================================================================
-- SUMRY Migration 003: measurement-aware goals and progress logs
-- ============================================================================
--
-- WHY THIS MIGRATION EXISTS
--
-- The schema stores every progress value in a single DECIMAL column
-- (goals.baseline_value, goals.target_value, progress_logs.score). That is
-- fine for "85%", but it destroys the meaning of anything else a teacher
-- records:
--
--   * "4 of 5" stores 4, with no memory that the session ran 5 trials
--   * "72 WPM" stores 72, with no memory of the unit
--   * "12 minutes" stores 12, indistinguishable from 12%
--
-- Two features need the meaning back:
--
--   * a defensible progress report, which must print the value the way the
--     teacher wrote it ("4 of 5", not "4") and cite the evidence and context
--     for each data point
--   * a caseload triage board, which must compare goals that are measured on
--     different scales and know whether an increase or a decrease counts as
--     improvement
--
-- The DECIMAL columns stay the canonical score, so every existing trendline,
-- aim line and export keeps working unchanged. The new columns carry the
-- meaning alongside it:
--
--   goals.measurement_type     what the goal measures, one of seven formats
--   goals.measurement_config   scale details (trial total, rate unit, rubric
--                              scale, frequency unit, desired direction)
--   progress_logs.raw_value    exactly what the teacher typed, e.g. "4 of 5"
--   progress_logs.measurement_type
--                              snapshot of the goal's type at log time, so
--                              editing a goal later does not retroactively
--                              relabel what was observed before the edit.
--                              NULL on legacy rows.
--   progress_logs.context      setting / prompt level / conditions of the
--                              observation
--   progress_logs.evidence_note
--                              description of the raw evidence for this data
--                              point
--   progress_logs.accommodations_used
--                              what was in place for this observation
--
-- BACKFILL. Existing goals get a type inferred from the free text they already
-- carry, and each legacy progress row inherits its goal's type. raw_value is
-- deliberately left NULL on legacy rows: the exact wording was never stored,
-- and the UI falls back to the score rather than inventing text. The goal date
-- columns (start_date, end_date) already exist and are used as-is.
--
-- This migration is idempotent and safe to re-run.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. goals: what is measured, and on what scale
-- ---------------------------------------------------------------------------

-- NOT NULL with a default: goals saved before this migration are percent
-- goals until the inference below says otherwise, and every insert that does
-- not name a type keeps the schema's default rather than failing.
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS measurement_type VARCHAR(32) NOT NULL DEFAULT 'percent';

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS measurement_config JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Named, and dropped first, so this file is re-runnable and a future migration
-- knows exactly what to replace.
ALTER TABLE public.goals
  DROP CONSTRAINT IF EXISTS goals_measurement_type_check;

ALTER TABLE public.goals
  ADD CONSTRAINT goals_measurement_type_check
  CHECK (
    measurement_type IN (
      'percent', 'trials', 'rate', 'duration', 'rubric', 'frequency', 'level'
    )
  );

-- ---------------------------------------------------------------------------
-- 2. progress_logs: what was recorded, in the teacher's own words
-- ---------------------------------------------------------------------------

-- raw_value is what the teacher typed ("4 of 5"), kept next to the parsed
-- score so the report can print the original.
ALTER TABLE public.progress_logs
  ADD COLUMN IF NOT EXISTS raw_value TEXT;

-- Nullable on purpose: legacy rows have no snapshot, and NULL means "inherit
-- from the goal" rather than "percent".
ALTER TABLE public.progress_logs
  ADD COLUMN IF NOT EXISTS measurement_type VARCHAR(32);

ALTER TABLE public.progress_logs
  ADD COLUMN IF NOT EXISTS context TEXT;

ALTER TABLE public.progress_logs
  ADD COLUMN IF NOT EXISTS evidence_note TEXT;

ALTER TABLE public.progress_logs
  ADD COLUMN IF NOT EXISTS accommodations_used TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Same seven values as goals, but NULL is allowed because legacy rows have no
-- snapshot at all.
ALTER TABLE public.progress_logs
  DROP CONSTRAINT IF EXISTS progress_logs_measurement_type_check;

ALTER TABLE public.progress_logs
  ADD CONSTRAINT progress_logs_measurement_type_check
  CHECK (
    measurement_type IS NULL
    OR measurement_type IN (
      'percent', 'trials', 'rate', 'duration', 'rubric', 'frequency', 'level'
    )
  );

-- ---------------------------------------------------------------------------
-- 3. Backfill goals from the free text they already carry
-- ---------------------------------------------------------------------------

-- Only rows still on the 'percent' default (or NULL, on a database where the
-- column predates this file) are touched. A value already set to anything else
-- is never overwritten, so re-running after someone has chosen a type for a
-- goal is safe.
--
-- The CASE order matters: a target of "80% on 4 of 5 trials" is a percent
-- goal, not a trials goal, so the percent test comes first. The rate test
-- comes before duration because "words correct per minute" contains the word
-- "minute".
UPDATE public.goals
SET measurement_type = CASE
      WHEN strpos(coalesce(target_description, ''), '%') > 0
        OR strpos(coalesce(metric_unit, ''), '%') > 0
        THEN 'percent'
      WHEN target_description ~* '^[[:space:]]*[0-9]+([.][0-9]+)?[[:space:]]+of[[:space:]]+[0-9]+([.][0-9]+)?[[:space:]]*$'
        THEN 'trials'
      WHEN metric_unit ILIKE '%per minute%'
        OR metric_unit ILIKE '%/min%'
        OR metric_unit ILIKE '%wpm%'
        OR metric_unit ILIKE '%words correct%'
        THEN 'rate'
      WHEN metric_unit ILIKE '%minute%'
        OR metric_unit ILIKE '%duration%'
        THEN 'duration'
      ELSE 'percent'
    END
WHERE measurement_type IS NULL
   OR measurement_type = 'percent';

-- ---------------------------------------------------------------------------
-- 4. Backfill progress_logs from their goal
-- ---------------------------------------------------------------------------

-- A snapshot, not a join: the goal can be edited later without relabelling old
-- observations. raw_value stays NULL on these rows - the wording was never
-- stored, so the UI shows the score instead of making something up.
UPDATE public.progress_logs pl
SET measurement_type = g.measurement_type
FROM public.goals g
WHERE pl.goal_id = g.id
  AND pl.measurement_type IS NULL;

-- ---------------------------------------------------------------------------
-- 5. Supporting index for per-goal progress reads
-- ---------------------------------------------------------------------------

-- The progress report and the triage board both read one goal's points in
-- date order; the existing single-column indexes cannot serve that together.
CREATE INDEX IF NOT EXISTS progress_logs_goal_date_idx
  ON public.progress_logs (goal_id, log_date);

COMMIT;
