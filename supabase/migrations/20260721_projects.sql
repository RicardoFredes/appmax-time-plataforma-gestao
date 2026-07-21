-- Projects control (Projetos tab of the Time Plataforma panel).
-- Run in the SQL editor of the backoffice project (ref hckrainomxsawfzmjufb) — the panel
-- reuses the same Supabase project, so engineers ARE system users (public.profiles) and
-- the inherited session's auth.uid() resolves here.
--
-- Model: teams ──1:N── team_members ─→ profiles(user)
--        teams ──1:N── projects ──1:N── weekly_reports
--                          └── project_engineers ─→ profiles(user)  (N:N, subset of the team)
-- App types are pt-BR; DB is English — the pt↔en mapping lives in
-- src/features/projetos/data.ts. All reads/writes require an authenticated session
-- (same posture as the rest of the backoffice; profiles is authenticated-only).

-- ── Tables ───────────────────────────────────────────────────────────────────
create table if not exists public.teams (
  id   uuid primary key default gen_random_uuid(),
  slug text not null unique,               -- estável para seed/config (ex.: "plataforma")
  name text not null
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (team_id, user_id)
);

create table if not exists public.projects (
  id           text primary key,             -- slug usado na URL de detalhe (#/projetos/<id>)
  code         text not null unique,         -- Jira-style id ("PRJ-1")
  name         text not null,
  description  text not null default '',
  status       text not null check (status in
               ('discovery','refinement','in_progress','testing','blocked','paused','done')),
  priority     smallint not null check (priority between 1 and 5),
  quarter      text not null,                -- "2026-Q3"
  team_id      uuid references public.teams(id),
  start_date   date,
  due_date     date,
  closed_date  date
);

-- Engenheiros do projeto: subconjunto dos membros do time (N:N com profiles).
create table if not exists public.project_engineers (
  project_id text not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (project_id, user_id)
);

create table if not exists public.weekly_reports (
  project_id text not null references public.projects(id) on delete cascade,
  week       date not null,                  -- monday of the week (or milestone date)
  progress   smallint not null check (progress between 0 and 100),
  health     smallint not null check (health between 1 and 5),
  note       text not null default '',
  milestone  text check (milestone in ('start','end','info')),  -- nullable; ignores health
  primary key (project_id, week)             -- 1 report per project per week
);

create index if not exists weekly_reports_project_idx  on public.weekly_reports (project_id);
create index if not exists project_engineers_user_idx  on public.project_engineers (user_id);
create index if not exists projects_team_idx           on public.projects (team_id);
create index if not exists team_members_user_idx       on public.team_members (user_id);

-- ── RLS: authenticated-only (reads e writes) — igual ao resto do backoffice ────
alter table public.teams             enable row level security;
alter table public.team_members      enable row level security;
alter table public.projects          enable row level security;
alter table public.project_engineers enable row level security;
alter table public.weekly_reports    enable row level security;

do $$
declare t text;
begin
  foreach t in array array['teams','team_members','projects','project_engineers','weekly_reports']
  loop
    execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_sel', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (true)', t || '_ins', t);
    execute format('create policy %I on public.%I for update to authenticated using (true) with check (true)', t || '_upd', t);
    execute format('create policy %I on public.%I for delete to authenticated using (true)', t || '_del', t);
  end loop;
end $$;

-- ── Realtime ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.team_members;
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.project_engineers;
alter publication supabase_realtime add table public.weekly_reports;
