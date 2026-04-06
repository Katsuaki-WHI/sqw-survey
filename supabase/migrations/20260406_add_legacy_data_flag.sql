-- benchmark_responsesテーブルが存在する場合にlegacy_data_flag列を追加
-- benchmark_responsesテーブルが未作成の場合は無視される
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'benchmark_responses') THEN
    ALTER TABLE benchmark_responses ADD COLUMN IF NOT EXISTS legacy_data_flag boolean DEFAULT false;
  END IF;
END $$;
-- legacy_data_flag=true：過去データ（旧問い）で代替したデータ
-- Q30/Q20の混在データを識別するために使用
