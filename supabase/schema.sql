-- SQWサーベイ データベーススキーマ

-- サーベイ回答セッション
create table if not exists survey_sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  completed_at timestamptz,
  department text,          -- 所属部署
  role text,                -- 階層（管理職/一般）
  attributes jsonb default '{}'::jsonb, -- 追加属性

  -- 集計結果（完了時に計算して保存）
  team_average numeric(4,2),
  wagon_speed numeric(5,1),
  category_scores jsonb,
  management_average numeric(4,2)
);

-- 個別回答
create table if not exists survey_answers (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references survey_sessions(id) on delete cascade,
  question_id int not null,
  score int check (score >= 1 and score <= 5),  -- 5段階評価（自由記述はnull）
  free_text text,                                -- 自由記述回答
  created_at timestamptz default now() not null,

  unique (session_id, question_id)
);

-- インデックス
create index if not exists idx_answers_session on survey_answers(session_id);
create index if not exists idx_sessions_department on survey_sessions(department);
create index if not exists idx_sessions_created on survey_sessions(created_at);

-- Row Level Security
alter table survey_sessions enable row level security;
alter table survey_answers enable row level security;

-- 匿名ユーザーの挿入を許可（サーベイ回答用）
create policy "Allow anonymous insert on sessions"
  on survey_sessions for insert
  with check (true);

create policy "Allow anonymous insert on answers"
  on survey_answers for insert
  with check (true);

-- セッション所有者は自分の結果を閲覧可能
create policy "Allow select own session"
  on survey_sessions for select
  using (true);

create policy "Allow select own answers"
  on survey_answers for select
  using (true);

-- セッションの更新（完了時）
create policy "Allow update own session"
  on survey_sessions for update
  using (true);
