-- ============================================================================
-- SUMRY RLS verification suite
-- ============================================================================
--
-- HOW TO RUN
--   Paste this entire file into the Supabase SQL Editor and run it.
--   It finishes with ROLLBACK, so it creates NO permanent data - the test
--   users, students, goals and logs it creates are all discarded.
--
-- WHAT IT PROVES
--   Every check below maps to a real bug that existed before migration
--   002_rls_hardening_and_storage.sql. Run this BEFORE the migration and a
--   number of checks fail; run it AFTER and all should pass.
--
-- READING THE OUTPUT
--   The final SELECT lists every check with PASS/FAIL. Any FAIL row means the
--   policy for that operation is not behaving as intended.
--
-- NOTE ON SILENT FAILURES
--   An UPDATE/DELETE blocked by RLS affects 0 rows but raises no error, so
--   several checks assert on ROW_COUNT rather than on an exception.
-- ============================================================================

BEGIN;

CREATE TEMP TABLE rls_results (
  seq     serial,
  check_name text,
  expected   text,
  actual     text,
  passed     boolean
) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.record(
  p_check text, p_expected text, p_actual text
) RETURNS void LANGUAGE sql AS $$
  INSERT INTO rls_results (check_name, expected, actual, passed)
  VALUES (p_check, p_expected, p_actual, p_expected = p_actual);
$$;

-- Switch the session to act as a given authenticated user.
CREATE OR REPLACE FUNCTION pg_temp.act_as(p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM set_config('request.jwt.claims',
    json_build_object('sub', p_user_id::text, 'role', 'authenticated')::text, true);
  EXECUTE 'SET LOCAL ROLE authenticated';
END; $$;

CREATE OR REPLACE FUNCTION pg_temp.act_as_admin() RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE 'RESET ROLE';
  PERFORM set_config('request.jwt.claims', NULL, true);
END; $$;

-- ---------------------------------------------------------------------------
-- Fixtures
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_user_a uuid := '11111111-1111-1111-1111-111111111111';
  v_user_b uuid := '22222222-2222-2222-2222-222222222222';
  v_user_c uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data
  )
  SELECT u.id, '00000000-0000-0000-0000-000000000000', 'authenticated',
         'authenticated', u.email, 'not-a-real-password', now(), now(), '{}'::jsonb,
         json_build_object('first_name', u.fname, 'last_name', 'Tester')::jsonb
  FROM (VALUES
    (v_user_a, 'rls-test-a@example.test', 'Ada'),
    (v_user_b, 'rls-test-b@example.test', 'Ben'),
    (v_user_c, 'rls-test-c@example.test', 'Cleo')
  ) AS u(id, email, fname);
END $$;

-- The handle_new_user() trigger should have created profiles.
DO $$
DECLARE v_count int;
BEGIN
  SELECT count(*) INTO v_count FROM public.user_profiles
  WHERE id IN ('11111111-1111-1111-1111-111111111111',
               '22222222-2222-2222-2222-222222222222',
               '33333333-3333-3333-3333-333333333333');
  PERFORM pg_temp.record('trigger auto-creates user_profiles', '3', v_count::text);
END $$;

-- ---------------------------------------------------------------------------
-- User A creates a student, a goal and a progress log
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_a uuid := '11111111-1111-1111-1111-111111111111';
  v_student uuid; v_goal uuid; v_log uuid; v_rows int;
BEGIN
  PERFORM pg_temp.act_as(v_a);

  INSERT INTO public.students (first_name, last_name, grade_level, created_by)
  VALUES ('Sam', 'Student', '3rd Grade', v_a)
  RETURNING id INTO v_student;
  PERFORM pg_temp.record('A can create a student', 'ok',
                         CASE WHEN v_student IS NOT NULL THEN 'ok' ELSE 'null' END);

  SELECT count(*) INTO v_rows FROM public.students WHERE id = v_student;
  PERFORM pg_temp.record('A can read own student', '1', v_rows::text);

  INSERT INTO public.goals (student_id, area, description, target_value, created_by)
  VALUES (v_student, 'Reading', 'Read 80 WPM', 80, v_a)
  RETURNING id INTO v_goal;
  PERFORM pg_temp.record('A can create a goal', 'ok',
                         CASE WHEN v_goal IS NOT NULL THEN 'ok' ELSE 'null' END);

  INSERT INTO public.progress_logs (goal_id, log_date, score, logged_by)
  VALUES (v_goal, current_date, 55, v_a)
  RETURNING id INTO v_log;
  PERFORM pg_temp.record('A can create a progress log', 'ok',
                         CASE WHEN v_log IS NOT NULL THEN 'ok' ELSE 'null' END);

  PERFORM set_config('test.student_id', v_student::text, true);
  PERFORM set_config('test.goal_id',    v_goal::text,    true);
  PERFORM set_config('test.log_id',     v_log::text,     true);

  PERFORM pg_temp.act_as_admin();
END $$;

-- ---------------------------------------------------------------------------
-- Isolation: user C (unrelated) must see nothing
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_c uuid := '33333333-3333-3333-3333-333333333333';
  v_student uuid := current_setting('test.student_id')::uuid;
  v_goal uuid := current_setting('test.goal_id')::uuid;
  v_rows int;
BEGIN
  PERFORM pg_temp.act_as(v_c);

  SELECT count(*) INTO v_rows FROM public.students WHERE id = v_student;
  PERFORM pg_temp.record('unrelated user cannot read student', '0', v_rows::text);

  SELECT count(*) INTO v_rows FROM public.goals WHERE id = v_goal;
  PERFORM pg_temp.record('unrelated user cannot read goal', '0', v_rows::text);

  UPDATE public.students SET first_name = 'Hacked' WHERE id = v_student;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('unrelated user cannot update student', '0', v_rows::text);

  DELETE FROM public.goals WHERE id = v_goal;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('unrelated user cannot delete goal', '0', v_rows::text);

  PERFORM pg_temp.act_as_admin();
END $$;

-- Insert denial raises rather than silently no-ops, so it needs its own block.
DO $$
DECLARE
  v_c uuid := '33333333-3333-3333-3333-333333333333';
  v_student uuid := current_setting('test.student_id')::uuid;
  v_outcome text := 'allowed';
BEGIN
  PERFORM pg_temp.act_as(v_c);
  BEGIN
    INSERT INTO public.goals (student_id, area, description, target_value, created_by)
    VALUES (v_student, 'Math', 'Injected goal', 10, v_c);
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN
    v_outcome := 'denied';
  END;
  PERFORM pg_temp.record('unrelated user cannot insert goal', 'denied', v_outcome);
  PERFORM pg_temp.act_as_admin();
END $$;

-- ---------------------------------------------------------------------------
-- Team sharing. THIS IS THE HEADLINE BUG: team_members previously had no
-- policies, so this insert failed and team-based access never resolved.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_a uuid := '11111111-1111-1111-1111-111111111111';
  v_b uuid := '22222222-2222-2222-2222-222222222222';
  v_student uuid := current_setting('test.student_id')::uuid;
  v_outcome text := 'denied';
BEGIN
  PERFORM pg_temp.act_as(v_a);
  BEGIN
    INSERT INTO public.team_members (student_id, user_id, role, can_edit, can_view, added_by)
    VALUES (v_student, v_b, 'Therapist', false, true, v_a);
    v_outcome := 'ok';
  EXCEPTION WHEN others THEN
    v_outcome := 'denied';
  END;
  PERFORM pg_temp.record('A can add a team member', 'ok', v_outcome);
  PERFORM pg_temp.act_as_admin();
END $$;

DO $$
DECLARE
  v_b uuid := '22222222-2222-2222-2222-222222222222';
  v_student uuid := current_setting('test.student_id')::uuid;
  v_goal uuid := current_setting('test.goal_id')::uuid;
  v_rows int;
BEGIN
  PERFORM pg_temp.act_as(v_b);

  SELECT count(*) INTO v_rows FROM public.students WHERE id = v_student;
  PERFORM pg_temp.record('team member can read student', '1', v_rows::text);

  SELECT count(*) INTO v_rows FROM public.goals WHERE id = v_goal;
  PERFORM pg_temp.record('team member can read goal', '1', v_rows::text);

  -- can_edit = false, so writes must still be refused
  UPDATE public.goals SET description = 'edited by viewer' WHERE id = v_goal;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('view-only member cannot update goal', '0', v_rows::text);

  DELETE FROM public.goals WHERE id = v_goal;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('view-only member cannot delete goal', '0', v_rows::text);

  PERFORM pg_temp.act_as_admin();
END $$;

-- Promote B to editor, then confirm writes succeed.
DO $$
DECLARE
  v_a uuid := '11111111-1111-1111-1111-111111111111';
  v_b uuid := '22222222-2222-2222-2222-222222222222';
  v_student uuid := current_setting('test.student_id')::uuid;
  v_goal uuid := current_setting('test.goal_id')::uuid;
  v_rows int;
BEGIN
  PERFORM pg_temp.act_as(v_a);
  UPDATE public.team_members SET can_edit = true
   WHERE student_id = v_student AND user_id = v_b;
  PERFORM pg_temp.act_as_admin();

  PERFORM pg_temp.act_as(v_b);
  UPDATE public.goals SET description = 'edited by editor' WHERE id = v_goal;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('editor member can update goal', '1', v_rows::text);
  PERFORM pg_temp.act_as_admin();
END $$;

-- ---------------------------------------------------------------------------
-- Operations that were silently no-ops before the migration
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_a uuid := '11111111-1111-1111-1111-111111111111';
  v_log uuid := current_setting('test.log_id')::uuid;
  v_rows int;
BEGIN
  PERFORM pg_temp.act_as(v_a);

  UPDATE public.progress_logs SET score = 61 WHERE id = v_log;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('owner can update progress log', '1', v_rows::text);

  DELETE FROM public.progress_logs WHERE id = v_log;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  PERFORM pg_temp.record('owner can delete progress log', '1', v_rows::text);

  PERFORM pg_temp.act_as_admin();
END $$;

-- Accommodations + the progress_log_accommodations join table, plus evidence.
DO $$
DECLARE
  v_a uuid := '11111111-1111-1111-1111-111111111111';
  v_student uuid := current_setting('test.student_id')::uuid;
  v_goal uuid := current_setting('test.goal_id')::uuid;
  v_acc uuid; v_log2 uuid;
  v_outcome text := 'denied';
BEGIN
  PERFORM pg_temp.act_as(v_a);

  INSERT INTO public.accommodations (student_id, name, created_by)
  VALUES (v_student, 'Extended time', v_a) RETURNING id INTO v_acc;
  PERFORM pg_temp.record('owner can create accommodation', 'ok',
                         CASE WHEN v_acc IS NOT NULL THEN 'ok' ELSE 'null' END);

  INSERT INTO public.progress_logs (goal_id, log_date, score, logged_by)
  VALUES (v_goal, current_date, 62, v_a) RETURNING id INTO v_log2;

  BEGIN
    INSERT INTO public.progress_log_accommodations (progress_log_id, accommodation_id)
    VALUES (v_log2, v_acc);
    v_outcome := 'ok';
  EXCEPTION WHEN others THEN v_outcome := 'denied';
  END;
  PERFORM pg_temp.record('owner can link accommodation to log', 'ok', v_outcome);

  v_outcome := 'denied';
  BEGIN
    INSERT INTO public.evidence (progress_log_id, file_name, file_path, uploaded_by)
    VALUES (v_log2, 'sample.pdf',
            v_student || '/' || v_log2 || '/sample.pdf', v_a);
    v_outcome := 'ok';
  EXCEPTION WHEN others THEN v_outcome := 'denied';
  END;
  PERFORM pg_temp.record('owner can attach evidence', 'ok', v_outcome);

  v_outcome := 'denied';
  BEGIN
    INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id)
    VALUES (v_a, 'create', 'student', v_student);
    v_outcome := 'ok';
  EXCEPTION WHEN others THEN v_outcome := 'denied';
  END;
  PERFORM pg_temp.record('audit log entry can be written', 'ok', v_outcome);

  PERFORM pg_temp.act_as_admin();
END $$;

-- ---------------------------------------------------------------------------
-- Profile visibility between teammates
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  v_a uuid := '11111111-1111-1111-1111-111111111111';
  v_b uuid := '22222222-2222-2222-2222-222222222222';
  v_c uuid := '33333333-3333-3333-3333-333333333333';
  v_rows int;
BEGIN
  PERFORM pg_temp.act_as(v_b);

  SELECT count(*) INTO v_rows FROM public.user_profiles WHERE id = v_a;
  PERFORM pg_temp.record('teammate profile is visible', '1', v_rows::text);

  SELECT count(*) INTO v_rows FROM public.user_profiles WHERE id = v_c;
  PERFORM pg_temp.record('unrelated profile is hidden', '0', v_rows::text);

  PERFORM pg_temp.act_as_admin();
END $$;

-- ---------------------------------------------------------------------------
-- Results
-- ---------------------------------------------------------------------------
SELECT
  CASE WHEN passed THEN 'PASS' ELSE '>>> FAIL' END AS result,
  check_name,
  expected,
  actual
FROM rls_results
ORDER BY seq;

ROLLBACK;
