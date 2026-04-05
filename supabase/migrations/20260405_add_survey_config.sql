-- サーベイバージョン・オプション設定
ALTER TABLE teams ADD COLUMN IF NOT EXISTS survey_version text DEFAULT '26';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS include_management_trust boolean DEFAULT false;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS qualitative_questions jsonb DEFAULT '[]'::jsonb;

-- 定性回答テーブル
CREATE TABLE IF NOT EXISTS qualitative_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id),
  member_id uuid,
  question_index integer,
  question_text text,
  answer text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qualitative_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert on qualitative_responses" ON qualitative_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select on qualitative_responses" ON qualitative_responses FOR SELECT USING (true);
