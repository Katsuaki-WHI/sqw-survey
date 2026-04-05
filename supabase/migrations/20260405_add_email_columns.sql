-- メール機能用カラムを追加
ALTER TABLE teams ADD COLUMN IF NOT EXISTS admin_email text;
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS email text;
