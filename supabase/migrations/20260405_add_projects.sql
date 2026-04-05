-- プロジェクトテーブルを作成
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  facilitator_email text NOT NULL,
  company_name text,
  industry text,
  company_size text,
  deadline timestamptz,
  release_mode text DEFAULT 'manual',
  invite_message text,
  survey_purpose text,
  admin_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_admin_token ON projects(admin_token);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous insert on projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow update projects" ON projects FOR UPDATE USING (true);

-- teamsにproject_id列を追加
ALTER TABLE teams ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects(id);
