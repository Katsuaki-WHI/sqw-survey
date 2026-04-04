-- チームの詳細情報カラムを追加
ALTER TABLE teams ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_name text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_message text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS company_name text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS industry text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS company_size text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS expected_members integer;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS survey_purpose text;
