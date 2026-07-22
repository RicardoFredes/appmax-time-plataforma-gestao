-- Reportes deixam de ser semanais/únicos por semana.
--
-- Antes: PK (project_id, week) → 1 reporte por projeto por semana, data grudada na
-- segunda. Agora: cada reporte tem `id` próprio e uma `date` livre (qualquer dia,
-- vários no mesmo dia). `created_at` desempata a ordem de reportes do mesmo dia.

-- id próprio (surrogate PK)
alter table public.weekly_reports add column if not exists id uuid default gen_random_uuid();
update public.weekly_reports set id = gen_random_uuid() where id is null;
alter table public.weekly_reports alter column id set not null;

-- troca a PK (project_id, week) por (id)
alter table public.weekly_reports drop constraint weekly_reports_pkey;
alter table public.weekly_reports add primary key (id);

-- week (segunda-feira) → date (data livre do reporte)
alter table public.weekly_reports rename column week to date;

-- created_at para ordenar vários reportes do mesmo dia
alter table public.weekly_reports add column if not exists created_at timestamptz not null default now();

-- índice de leitura por projeto/data (substitui o antigo só por projeto)
drop index if exists weekly_reports_project_idx;
create index if not exists weekly_reports_project_date_idx on public.weekly_reports (project_id, date);
