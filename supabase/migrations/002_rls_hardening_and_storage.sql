-- ============================================================================
-- SUMRY Migration 002: RLS hardening + evidence file storage
-- ============================================================================
--
-- WHY THIS MIGRATION EXISTS
--
-- The initial schema (supabase-schema.sql) enabled Row Level Security on all
-- 16 tables but only defined policies for a handful of them. In PostgreSQL,
-- a table with RLS enabled and NO matching policy denies the operation. That
-- left the following silently broken:
--
--   * team_members had ZERO policies. Because the students/goals policies did
--     `EXISTS (SELECT 1 FROM team_members ...)`, and RLS on a referenced table
--     IS enforced inside a policy subquery, that subquery always returned
--     empty. Result: team-based sharing never worked for anyone, and
--     addTeamMember() always failed.
--   * goals had no DELETE policy, but the app hard-deletes goals.
--   * progress_logs had no UPDATE or DELETE policy, but the app does both.
--   * progress_log_accommodations had ZERO policies, so logging progress with
--     accommodations failed.
--   * evidence, present_levels, service_logs, behavior_logs, assessments,
--     compliance_items, comments all had ZERO policies (fully inaccessible).
--   * audit_logs had no INSERT policy, so audit entries could never be written.
--
-- NOTE ON SILENT FAILURES: an UPDATE or DELETE blocked by RLS affects zero rows
-- but does NOT raise an error. supabase-js returns success. So these bugs
-- presented as "the save worked but nothing changed" rather than as errors.
--
-- APPROACH
--
-- Access checks are centralised in SECURITY DEFINER helper functions. This is
-- deliberate and important:
--   1. It prevents infinite recursion. A students policy referencing
--      team_members, while a team_members policy references students, causes
--      "infinite recursion detected in policy for relation". SECURITY DEFINER
--      functions bypass RLS internally and break that cycle.
--   2. It makes team membership actually resolvable (see the bug above).
--   3. It keeps the access rule in ONE place instead of duplicated across
--      ~40 policies.
--
-- This migration is idempotent and safe to re-run.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper functions
-- ---------------------------------------------------------------------------

-- Parse text to uuid without raising on malformed input. Used by storage
-- policies, where the path segment is untrusted and may not be a uuid.
CREATE OR REPLACE FUNCTION public.safe_uuid(p_text text)
RETURNS uuid
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN p_text::uuid;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

-- Can the current user reach this student?
-- Creator always has full access. Team members have access per their can_edit
-- flag. p_require_edit=true demands write capability.
CREATE OR REPLACE FUNCTION public.has_student_access(
  p_student_id uuid,
  p_require_edit boolean DEFAULT false
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p_student_id IS NOT NULL
    AND auth.uid() IS NOT NULL
    AND (
      EXISTS (
        SELECT 1 FROM public.students s
        WHERE s.id = p_student_id
          AND s.created_by = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.team_members tm
        WHERE tm.student_id = p_student_id
          AND tm.user_id = auth.uid()
          AND (NOT p_require_edit OR tm.can_edit = true)
      )
    );
$$;

-- Goal access derives from the owning student.
CREATE OR REPLACE FUNCTION public.has_goal_access(
  p_goal_id uuid,
  p_require_edit boolean DEFAULT false
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.goals g
    WHERE g.id = p_goal_id
      AND public.has_student_access(g.student_id, p_require_edit)
  );
$$;

-- Progress log access derives from goal -> student.
CREATE OR REPLACE FUNCTION public.has_progress_log_access(
  p_progress_log_id uuid,
  p_require_edit boolean DEFAULT false
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.progress_logs pl
    WHERE pl.id = p_progress_log_id
      AND public.has_goal_access(pl.goal_id, p_require_edit)
  );
$$;

-- Does the current user share any student with the given user? Used so
-- teammates can see each other's names in team UI.
CREATE OR REPLACE FUNCTION public.shares_student_with(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    p_user_id IS NOT NULL
    AND auth.uid() IS NOT NULL
    AND (
      -- both are team members on the same student
      EXISTS (
        SELECT 1
        FROM public.team_members tm_self
        JOIN public.team_members tm_other
          ON tm_self.student_id = tm_other.student_id
        WHERE tm_self.user_id = auth.uid()
          AND tm_other.user_id = p_user_id
      )
      -- current user created a student the other user is on
      OR EXISTS (
        SELECT 1
        FROM public.students s
        JOIN public.team_members tm ON tm.student_id = s.id
        WHERE s.created_by = auth.uid()
          AND tm.user_id = p_user_id
      )
      -- the other user created a student the current user is on
      OR EXISTS (
        SELECT 1
        FROM public.students s
        JOIN public.team_members tm ON tm.student_id = s.id
        WHERE s.created_by = p_user_id
          AND tm.user_id = auth.uid()
      )
    );
$$;

-- Polymorphic access check for the comments table. Unknown entity types are
-- denied rather than allowed.
CREATE OR REPLACE FUNCTION public.has_entity_access(
  p_entity_type text,
  p_entity_id uuid,
  p_require_edit boolean DEFAULT false
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT CASE lower(p_entity_type)
    WHEN 'student'      THEN public.has_student_access(p_entity_id, p_require_edit)
    WHEN 'goal'         THEN public.has_goal_access(p_entity_id, p_require_edit)
    WHEN 'progress_log' THEN public.has_progress_log_access(p_entity_id, p_require_edit)
    ELSE false
  END;
$$;

GRANT EXECUTE ON FUNCTION public.safe_uuid(text)                        TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_student_access(uuid, boolean)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_goal_access(uuid, boolean)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_progress_log_access(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_student_with(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_entity_access(text, uuid, boolean) TO authenticated;

-- ---------------------------------------------------------------------------
-- 2. Drop the original (incomplete) policies so we can define them coherently
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view own profile"        ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile"      ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own students"       ON public.students;
DROP POLICY IF EXISTS "Users can create students"         ON public.students;
DROP POLICY IF EXISTS "Users can update own students"     ON public.students;
DROP POLICY IF EXISTS "Users can view goals"              ON public.goals;
DROP POLICY IF EXISTS "Users can create goals"            ON public.goals;
DROP POLICY IF EXISTS "Users can update goals"            ON public.goals;
DROP POLICY IF EXISTS "Users can view progress logs"      ON public.progress_logs;
DROP POLICY IF EXISTS "Users can create progress logs"    ON public.progress_logs;
DROP POLICY IF EXISTS "Users can view accommodations"     ON public.accommodations;
DROP POLICY IF EXISTS "Users can create accommodations"   ON public.accommodations;
DROP POLICY IF EXISTS "Users can view own AI suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can create AI suggestions"   ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can view own audit logs"     ON public.audit_logs;

-- ---------------------------------------------------------------------------
-- 3. user_profiles
-- ---------------------------------------------------------------------------

CREATE POLICY "profiles_select" ON public.user_profiles
  FOR SELECT USING (
    auth.uid() = id OR public.shares_student_with(id)
  );

-- Safety net: the handle_new_user() trigger is SECURITY DEFINER and normally
-- creates this row, but an explicit self-insert should also be allowed.
CREATE POLICY "profiles_insert_self" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 4. students
-- ---------------------------------------------------------------------------

CREATE POLICY "students_select" ON public.students
  FOR SELECT USING (public.has_student_access(id));

CREATE POLICY "students_insert" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "students_update" ON public.students
  FOR UPDATE USING (public.has_student_access(id, true))
           WITH CHECK (public.has_student_access(id, true));

-- The app soft-deletes (is_active=false) via UPDATE, but allow the creator a
-- true delete as well.
CREATE POLICY "students_delete" ON public.students
  FOR DELETE USING (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- 5. team_members  (previously had NO policies -> broke all team sharing)
-- ---------------------------------------------------------------------------

CREATE POLICY "team_members_select" ON public.team_members
  FOR SELECT USING (
    user_id = auth.uid() OR public.has_student_access(student_id)
  );

CREATE POLICY "team_members_insert" ON public.team_members
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));

CREATE POLICY "team_members_update" ON public.team_members
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));

CREATE POLICY "team_members_delete" ON public.team_members
  FOR DELETE USING (public.has_student_access(student_id, true));

-- ---------------------------------------------------------------------------
-- 6. goals  (DELETE policy was missing entirely)
-- ---------------------------------------------------------------------------

CREATE POLICY "goals_select" ON public.goals
  FOR SELECT USING (public.has_student_access(student_id));

CREATE POLICY "goals_insert" ON public.goals
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));

CREATE POLICY "goals_update" ON public.goals
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));

CREATE POLICY "goals_delete" ON public.goals
  FOR DELETE USING (public.has_student_access(student_id, true));

-- ---------------------------------------------------------------------------
-- 7. progress_logs  (UPDATE and DELETE policies were missing entirely)
-- ---------------------------------------------------------------------------

CREATE POLICY "progress_logs_select" ON public.progress_logs
  FOR SELECT USING (public.has_goal_access(goal_id));

CREATE POLICY "progress_logs_insert" ON public.progress_logs
  FOR INSERT WITH CHECK (public.has_goal_access(goal_id, true));

CREATE POLICY "progress_logs_update" ON public.progress_logs
  FOR UPDATE USING (public.has_goal_access(goal_id, true))
           WITH CHECK (public.has_goal_access(goal_id, true));

CREATE POLICY "progress_logs_delete" ON public.progress_logs
  FOR DELETE USING (public.has_goal_access(goal_id, true));

-- ---------------------------------------------------------------------------
-- 8. accommodations
-- ---------------------------------------------------------------------------

CREATE POLICY "accommodations_select" ON public.accommodations
  FOR SELECT USING (public.has_student_access(student_id));

CREATE POLICY "accommodations_insert" ON public.accommodations
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));

CREATE POLICY "accommodations_update" ON public.accommodations
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));

CREATE POLICY "accommodations_delete" ON public.accommodations
  FOR DELETE USING (public.has_student_access(student_id, true));

-- ---------------------------------------------------------------------------
-- 9. progress_log_accommodations  (had NO policies -> blocked progress logging
--     whenever accommodations were attached)
-- ---------------------------------------------------------------------------

CREATE POLICY "pl_accommodations_select" ON public.progress_log_accommodations
  FOR SELECT USING (public.has_progress_log_access(progress_log_id));

CREATE POLICY "pl_accommodations_insert" ON public.progress_log_accommodations
  FOR INSERT WITH CHECK (public.has_progress_log_access(progress_log_id, true));

CREATE POLICY "pl_accommodations_delete" ON public.progress_log_accommodations
  FOR DELETE USING (public.has_progress_log_access(progress_log_id, true));

-- ---------------------------------------------------------------------------
-- 10. evidence  (had NO policies; required for file uploads below)
-- ---------------------------------------------------------------------------

CREATE POLICY "evidence_select" ON public.evidence
  FOR SELECT USING (public.has_progress_log_access(progress_log_id));

CREATE POLICY "evidence_insert" ON public.evidence
  FOR INSERT WITH CHECK (public.has_progress_log_access(progress_log_id, true));

CREATE POLICY "evidence_update" ON public.evidence
  FOR UPDATE USING (public.has_progress_log_access(progress_log_id, true))
           WITH CHECK (public.has_progress_log_access(progress_log_id, true));

CREATE POLICY "evidence_delete" ON public.evidence
  FOR DELETE USING (public.has_progress_log_access(progress_log_id, true));

-- ---------------------------------------------------------------------------
-- 11. Remaining student-scoped tables (all previously had NO policies)
-- ---------------------------------------------------------------------------

CREATE POLICY "present_levels_select" ON public.present_levels
  FOR SELECT USING (public.has_student_access(student_id));
CREATE POLICY "present_levels_insert" ON public.present_levels
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "present_levels_update" ON public.present_levels
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "present_levels_delete" ON public.present_levels
  FOR DELETE USING (public.has_student_access(student_id, true));

CREATE POLICY "service_logs_select" ON public.service_logs
  FOR SELECT USING (public.has_student_access(student_id));
CREATE POLICY "service_logs_insert" ON public.service_logs
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "service_logs_update" ON public.service_logs
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "service_logs_delete" ON public.service_logs
  FOR DELETE USING (public.has_student_access(student_id, true));

CREATE POLICY "behavior_logs_select" ON public.behavior_logs
  FOR SELECT USING (public.has_student_access(student_id));
CREATE POLICY "behavior_logs_insert" ON public.behavior_logs
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "behavior_logs_update" ON public.behavior_logs
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "behavior_logs_delete" ON public.behavior_logs
  FOR DELETE USING (public.has_student_access(student_id, true));

CREATE POLICY "assessments_select" ON public.assessments
  FOR SELECT USING (public.has_student_access(student_id));
CREATE POLICY "assessments_insert" ON public.assessments
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "assessments_update" ON public.assessments
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "assessments_delete" ON public.assessments
  FOR DELETE USING (public.has_student_access(student_id, true));

CREATE POLICY "compliance_items_select" ON public.compliance_items
  FOR SELECT USING (public.has_student_access(student_id));
CREATE POLICY "compliance_items_insert" ON public.compliance_items
  FOR INSERT WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "compliance_items_update" ON public.compliance_items
  FOR UPDATE USING (public.has_student_access(student_id, true))
           WITH CHECK (public.has_student_access(student_id, true));
CREATE POLICY "compliance_items_delete" ON public.compliance_items
  FOR DELETE USING (public.has_student_access(student_id, true));

-- ---------------------------------------------------------------------------
-- 12. comments (polymorphic; author may edit/delete their own)
-- ---------------------------------------------------------------------------

CREATE POLICY "comments_select" ON public.comments
  FOR SELECT USING (public.has_entity_access(entity_type, entity_id));

CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND public.has_entity_access(entity_type, entity_id)
  );

CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE USING (auth.uid() = created_by)
           WITH CHECK (auth.uid() = created_by);

CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE USING (auth.uid() = created_by);

-- ---------------------------------------------------------------------------
-- 13. audit_logs (INSERT policy was missing, so nothing could ever be logged)
--     Deliberately append-only: no UPDATE or DELETE policy, for compliance.
-- ---------------------------------------------------------------------------

CREATE POLICY "audit_logs_select_own" ON public.audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "audit_logs_insert_own" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 14. ai_suggestions
-- ---------------------------------------------------------------------------

CREATE POLICY "ai_suggestions_select_own" ON public.ai_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "ai_suggestions_insert_own" ON public.ai_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- allows flipping the `accepted` flag
CREATE POLICY "ai_suggestions_update_own" ON public.ai_suggestions
  FOR UPDATE USING (auth.uid() = user_id)
           WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ai_suggestions_delete_own" ON public.ai_suggestions
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 15. Evidence file storage
-- ---------------------------------------------------------------------------
--
-- Private bucket. Files are addressed as:
--     <student_id>/<progress_log_id>/<filename>
-- The leading path segment is what the policies below authorise against, so
-- the client MUST follow that convention (see src/services/supabaseEvidence.js).
--
-- 25 MB cap chosen to comfortably hold photos/scans of student work while
-- staying well inside Supabase's free-tier storage limits.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',
  'evidence',
  false,
  26214400,
  ARRAY[
    'image/jpeg','image/png','image/gif','image/webp','image/heic',
    'application/pdf',
    'text/plain','text/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg','audio/wav','audio/mp4',
    'video/mp4','video/quicktime'
  ]
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "evidence_objects_select" ON storage.objects;
DROP POLICY IF EXISTS "evidence_objects_insert" ON storage.objects;
DROP POLICY IF EXISTS "evidence_objects_update" ON storage.objects;
DROP POLICY IF EXISTS "evidence_objects_delete" ON storage.objects;

CREATE POLICY "evidence_objects_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'evidence'
    AND public.has_student_access(
      public.safe_uuid((storage.foldername(name))[1])
    )
  );

CREATE POLICY "evidence_objects_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'evidence'
    AND public.has_student_access(
      public.safe_uuid((storage.foldername(name))[1]), true
    )
  );

CREATE POLICY "evidence_objects_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'evidence'
    AND public.has_student_access(
      public.safe_uuid((storage.foldername(name))[1]), true
    )
  );

CREATE POLICY "evidence_objects_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'evidence'
    AND public.has_student_access(
      public.safe_uuid((storage.foldername(name))[1]), true
    )
  );

-- ---------------------------------------------------------------------------
-- 16. Supporting indexes for the access-check subqueries
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_team_members_user_student
  ON public.team_members(user_id, student_id);

CREATE INDEX IF NOT EXISTS idx_evidence_uploaded_by
  ON public.evidence(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id
  ON public.ai_suggestions(user_id);
