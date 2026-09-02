-- Create Roles Enum
CREATE TYPE user_role AS ENUM ('student', 'volunteer', 'admin');

-- PROFILES TABLE
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'student',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STUDENTS TABLE (Extended Profile)
CREATE TABLE students (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  career_track TEXT,
  attendance_percent INT DEFAULT 100,
  quiz_pass_rate INT DEFAULT 100,
  vulnerability_rating INT DEFAULT 0,
  inactive_days INT DEFAULT 0,
  priority_score INT DEFAULT 0
);

-- DOUBTS TABLE
CREATE TABLE doubts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT,
  content_text TEXT,
  audio_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- FIELD LOGS TABLE
CREATE TABLE field_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BADGES TABLE
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  badge_name TEXT,
  awarded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES --

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE doubts ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- 1. Profiles RLS
CREATE POLICY "Users can read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all profiles" ON profiles FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Volunteers can read their students profiles" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'volunteer'
);

-- 2. Students RLS
CREATE POLICY "Students can read their own data" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Volunteers can read assigned students" ON students FOR SELECT USING (mentor_id = auth.uid());
CREATE POLICY "Admins can read all students" ON students FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Volunteers can update assigned students" ON students FOR UPDATE USING (mentor_id = auth.uid());

-- 3. Doubts RLS
CREATE POLICY "Students can CRUD their own doubts" ON doubts FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Volunteers can read assigned doubts" ON doubts FOR SELECT USING (
  mentor_id = auth.uid() OR 
  student_id IN (SELECT id FROM students WHERE mentor_id = auth.uid())
);
CREATE POLICY "Volunteers can update assigned doubts" ON doubts FOR UPDATE USING (
  mentor_id = auth.uid() OR 
  student_id IN (SELECT id FROM students WHERE mentor_id = auth.uid())
);
CREATE POLICY "Admins can read all doubts" ON doubts FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 4. Field Logs RLS
CREATE POLICY "Volunteers can CRUD their own field logs" ON field_logs FOR ALL USING (volunteer_id = auth.uid());
CREATE POLICY "Admins can read all field logs" ON field_logs FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 5. Badges RLS
CREATE POLICY "Students can read their own badges" ON badges FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Volunteers can CRUD badges for their students" ON badges FOR ALL USING (
  student_id IN (SELECT id FROM students WHERE mentor_id = auth.uid())
);
CREATE POLICY "Admins can read all badges" ON badges FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RULE-BASED PRIORITY ENGINE TRIGGER --

CREATE OR REPLACE FUNCTION calculate_priority_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Score = (100 - Attendance%)*0.35 + (100 - PassRate%)*0.25 + (VulnerabilityRating)*0.25 + (InactiveDays * 5)*0.15
  NEW.priority_score := 
    (100 - NEW.attendance_percent) * 0.35 + 
    (100 - NEW.quiz_pass_rate) * 0.25 + 
    NEW.vulnerability_rating * 0.25 + 
    (NEW.inactive_days * 5) * 0.15;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_priority_score_trigger
BEFORE INSERT OR UPDATE ON students
FOR EACH ROW
EXECUTE FUNCTION calculate_priority_score();
