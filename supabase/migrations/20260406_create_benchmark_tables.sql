-- ベンチマーク回答データ
CREATE TABLE IF NOT EXISTS benchmark_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_version text NOT NULL CHECK (survey_version IN ('26', '40')),
  data_source text NOT NULL CHECK (data_source IN ('sqw2', 'legacy_40', 'converted_26')),
  industry text,
  company_size text,
  team_size integer,
  scores jsonb NOT NULL,
  category_averages jsonb NOT NULL,
  overall_average float NOT NULL,
  is_custom boolean DEFAULT false,
  legacy_data_flag boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert benchmark" ON benchmark_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select benchmark" ON benchmark_responses FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_benchmark_industry ON benchmark_responses(industry);
CREATE INDEX IF NOT EXISTS idx_benchmark_version ON benchmark_responses(survey_version);
CREATE INDEX IF NOT EXISTS idx_benchmark_source ON benchmark_responses(data_source);

-- ベンチマーク統計（集計済みキャッシュ）
CREATE TABLE IF NOT EXISTS benchmark_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_version text NOT NULL,
  industry text,
  company_size text,
  category text NOT NULL,
  avg_score float NOT NULL,
  percentile_25 float,
  percentile_50 float,
  percentile_75 float,
  sample_count integer NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE benchmark_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select benchmark_stats" ON benchmark_stats FOR SELECT USING (true);
CREATE POLICY "Allow all benchmark_stats" ON benchmark_stats FOR ALL USING (true);
