-- チームの詳細情報カラムを追加
ALTER TABLE teams ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS leader_name text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS invite_message text;
