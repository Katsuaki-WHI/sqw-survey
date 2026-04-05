-- 回答者名を追加
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS respondent_name text;
