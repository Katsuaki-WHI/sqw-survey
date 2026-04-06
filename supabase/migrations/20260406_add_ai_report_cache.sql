-- AIレポートキャッシュテーブル
CREATE TABLE IF NOT EXISTS ai_report_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id),
  member_token text,
  report_type text NOT NULL CHECK (report_type IN ('personal', 'team')),
  language text NOT NULL CHECK (language IN ('ja', 'en')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_report_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert cache" ON ai_report_cache FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select cache" ON ai_report_cache FOR SELECT USING (true);
