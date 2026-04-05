-- ファシリテーターメールアドレス列を追加
ALTER TABLE teams ADD COLUMN IF NOT EXISTS facilitator_email text;

-- メンバーのメールアドレスをsurvey_sessionsに追加（結果通知用）
ALTER TABLE survey_sessions ADD COLUMN IF NOT EXISTS member_email text;
