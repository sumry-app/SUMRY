-- SUMRY Database Schema for Supabase
-- Enterprise-grade IEP Management System

-- Enable UUID extension (already enabled in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE goal_area AS ENUM ('Reading', 'Math', 'Writing', 'Behavior', 'Communication', 'Social Skills', 'Motor Skills', 'Other');
CREATE TYPE goal_status AS ENUM ('active', 'completed', 'discontinued', 'draft');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'view', 'export', 'login', 'logout');

-- User profiles table (extends Supabase auth.users)
-- Note: Supabase handles authentication, we just store additional profile data
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'teacher', -- admin, teacher, therapist, parent, viewer
  organization VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_number VARCHAR(50),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  grade_level VARCHAR(20),
  disability_classification VARCHAR(100),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members - many-to-many relationship between users and students
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(100) NOT NULL,
  can_edit BOOLEAN DEFAULT false,
  can_view BOOLEAN DEFAULT true,
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, user_id)
);

-- IEP Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  area goal_area NOT NULL,
  description TEXT NOT NULL,
  baseline_value DECIMAL(10,2),
  baseline_description TEXT,
  target_value DECIMAL(10,2) NOT NULL,
  target_description TEXT,
  metric_unit VARCHAR(50),
  status goal_status DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  ai_generated BOOLEAN DEFAULT false,
  ai_prompt TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress logs table
CREATE TABLE progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  score DECIMAL(10,2) NOT NULL,
  notes TEXT,
  logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accommodations table
CREATE TABLE accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Progress log accommodations (many-to-many)
CREATE TABLE progress_log_accommodations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_log_id UUID REFERENCES progress_logs(id) ON DELETE CASCADE,
  accommodation_id UUID REFERENCES accommodations(id) ON DELETE CASCADE,
  UNIQUE(progress_log_id, accommodation_id)
);

-- Evidence/Attachments table
CREATE TABLE evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_log_id UUID REFERENCES progress_logs(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Present levels of performance
CREATE TABLE present_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  area VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  assessment_date DATE,
  assessment_type VARCHAR(100),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service logs
CREATE TABLE service_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  service_type VARCHAR(100) NOT NULL,
  provider_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Behavior incidents
CREATE TABLE behavior_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  incident_date TIMESTAMP NOT NULL,
  behavior_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50),
  antecedent TEXT,
  behavior_description TEXT NOT NULL,
  consequence TEXT,
  intervention TEXT,
  logged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  assessment_name VARCHAR(255) NOT NULL,
  assessment_type VARCHAR(100),
  assessment_date DATE NOT NULL,
  score DECIMAL(10,2),
  percentile INTEGER,
  standard_score INTEGER,
  notes TEXT,
  administered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance tracking
CREATE TABLE compliance_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  item_type VARCHAR(100),
  due_date DATE,
  completion_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments/Discussion threads
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'goal', 'student', 'progress_log', etc.
  entity_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for compliance
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI suggestions/history
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  suggestion_type VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_students_organization ON students(organization);
CREATE INDEX idx_students_created_by ON students(created_by);
CREATE INDEX idx_goals_student_id ON goals(student_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_progress_logs_goal_id ON progress_logs(goal_id);
CREATE INDEX idx_progress_logs_date ON progress_logs(log_date);
CREATE INDEX idx_team_members_student_id ON team_members(student_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_accommodations_student_id ON accommodations(student_id);
CREATE INDEX idx_evidence_progress_log_id ON evidence(progress_log_id);

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_logs_updated_at BEFORE UPDATE ON progress_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON accommodations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_present_levels_updated_at BEFORE UPDATE ON present_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_items_updated_at BEFORE UPDATE ON compliance_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_log_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE present_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

-- User profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Students: Users can see students they created or are team members of
CREATE POLICY "Users can view own students" ON students
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.student_id = students.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create students" ON students
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own students" ON students
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.student_id = students.id
      AND team_members.user_id = auth.uid()
      AND team_members.can_edit = true
    )
  );

-- Goals: Users can see goals for students they have access to
CREATE POLICY "Users can view goals" ON goals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = goals.student_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create goals" ON goals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = goals.student_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
          AND team_members.can_edit = true
        )
      )
    )
  );

CREATE POLICY "Users can update goals" ON goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = goals.student_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
          AND team_members.can_edit = true
        )
      )
    )
  );

-- Progress logs: Similar access pattern
CREATE POLICY "Users can view progress logs" ON progress_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM goals
      JOIN students ON goals.student_id = students.id
      WHERE goals.id = progress_logs.goal_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create progress logs" ON progress_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM goals
      JOIN students ON goals.student_id = students.id
      WHERE goals.id = progress_logs.goal_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
          AND team_members.can_edit = true
        )
      )
    )
  );

-- Accommodations
CREATE POLICY "Users can view accommodations" ON accommodations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = accommodations.student_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create accommodations" ON accommodations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students
      WHERE students.id = accommodations.student_id
      AND (
        students.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM team_members
          WHERE team_members.student_id = students.id
          AND team_members.user_id = auth.uid()
          AND team_members.can_edit = true
        )
      )
    )
  );

-- AI Suggestions
CREATE POLICY "Users can view own AI suggestions" ON ai_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create AI suggestions" ON ai_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs: Users can view their own audit logs
CREATE POLICY "Users can view own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name, role, organization)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
    COALESCE(new.raw_user_meta_data->>'organization', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
