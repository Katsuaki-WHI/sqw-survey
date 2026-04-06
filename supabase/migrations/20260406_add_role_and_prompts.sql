-- メンバーの立場（role）列を追加
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS role text;

-- AIプロンプト管理テーブル
CREATE TABLE IF NOT EXISTS ai_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('personal', 'team')),
  language text NOT NULL CHECK (language IN ('ja', 'en')),
  content text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  is_active boolean DEFAULT true,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select ai_prompts" ON ai_prompts FOR SELECT USING (true);
CREATE POLICY "Allow insert ai_prompts" ON ai_prompts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update ai_prompts" ON ai_prompts FOR UPDATE USING (true);
