-- SQWサーベイ データベーススキーマ

-- ============================================
-- チーム管理
-- ============================================

-- チームテーブル
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  invite_code text unique not null,          -- 招待URL用の短いコード
  admin_token text unique not null,          -- 管理者アクセス用トークン
  deadline timestamptz,                      -- 回答期限（任意）
  results_visible boolean default false,     -- チーム結果の公開フラグ
  release_mode text default 'manual' not null check (release_mode in ('immediate', 'on_deadline', 'manual')),
  -- immediate: 個人回答完了後すぐにチーム結果も公開
  -- on_deadline: 回答期限到来時に自動公開
  -- manual: 管理者が手動で公開（デフォルト）
  description text,                          -- チームの説明
  leader_name text,                          -- 上司・リーダー名
  notes text,                                -- 回答時の注意事項（任意）
  invite_message text,                       -- 招待メッセージ（任意）
  company_name text,                         -- 会社名（任意）
  industry text,                             -- 業種
  company_size text,                         -- 企業規模
  expected_members integer,                  -- 回答予定人数
  survey_purpose text,                       -- サーベイの目的（任意）
  admin_email text,                          -- 管理者メールアドレス
  created_at timestamptz default now() not null
);

create index if not exists idx_teams_invite_code on teams(invite_code);
create index if not exists idx_teams_admin_token on teams(admin_token);

-- ============================================
-- サーベイセッション
-- ============================================

-- サーベイ回答セッション
create table if not exists survey_sessions (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references teams(id) on delete set null,  -- チーム紐付け（任意）
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

-- ============================================
-- チームメンバー（匿名トラッキング）
-- ============================================

create table if not exists team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid not null references teams(id) on delete cascade,
  session_id uuid references survey_sessions(id) on delete set null,
  member_token text unique not null,        -- Cookie保存用の識別トークン
  email text,                              -- メンバーのメールアドレス（任意）
  created_at timestamptz default now() not null
);

create index if not exists idx_team_members_team on team_members(team_id);
create index if not exists idx_team_members_token on team_members(member_token);

-- ============================================
-- インデックス
-- ============================================

create index if not exists idx_answers_session on survey_answers(session_id);
create index if not exists idx_sessions_team on survey_sessions(team_id);
create index if not exists idx_sessions_department on survey_sessions(department);
create index if not exists idx_sessions_created on survey_sessions(created_at);

-- ============================================
-- Row Level Security
-- ============================================

alter table teams enable row level security;
alter table survey_sessions enable row level security;
alter table survey_answers enable row level security;
alter table team_members enable row level security;

-- teams: 匿名ユーザーの作成・閲覧を許可
create policy "Allow anonymous insert on teams"
  on teams for insert with check (true);

create policy "Allow select teams"
  on teams for select using (true);

create policy "Allow update teams"
  on teams for update using (true);

-- survey_sessions: 匿名ユーザーの挿入・閲覧・更新を許可
create policy "Allow anonymous insert on sessions"
  on survey_sessions for insert
  with check (true);

create policy "Allow select own session"
  on survey_sessions for select
  using (true);

create policy "Allow update own session"
  on survey_sessions for update
  using (true);

-- survey_answers: 匿名ユーザーの挿入・閲覧を許可
create policy "Allow anonymous insert on answers"
  on survey_answers for insert
  with check (true);

create policy "Allow select own answers"
  on survey_answers for select
  using (true);

-- team_members: 匿名ユーザーの挿入・閲覧・更新を許可
create policy "Allow anonymous insert on team_members"
  on team_members for insert with check (true);

create policy "Allow select team_members"
  on team_members for select using (true);

create policy "Allow update team_members"
  on team_members for update using (true);

-- ============================================
-- チーム結果集計用RPC関数
-- ============================================

create or replace function get_team_results(p_admin_token text)
returns json
language plpgsql
security definer
as $$
declare
  v_team teams;
  v_result json;
begin
  select * into v_team from teams where admin_token = p_admin_token;
  if v_team is null then
    raise exception 'Invalid admin token';
  end if;

  select json_build_object(
    'team_name', v_team.name,
    'team_id', v_team.id,
    'results_visible', v_team.results_visible,
    'deadline', v_team.deadline,
    'response_count', (
      select count(*)
      from survey_sessions
      where team_id = v_team.id and completed_at is not null
    ),
    'member_count', (
      select count(*)
      from team_members
      where team_id = v_team.id
    ),
    'question_averages', (
      select coalesce(json_agg(
        json_build_object('question_id', sa.question_id, 'avg_score', round(avg(sa.score)::numeric, 2))
      ), '[]'::json)
      from survey_answers sa
      join survey_sessions ss on ss.id = sa.session_id
      where ss.team_id = v_team.id
        and ss.completed_at is not null
        and sa.score is not null
      group by sa.question_id
    )
  ) into v_result;

  return v_result;
end;
$$;
