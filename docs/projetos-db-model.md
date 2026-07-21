# Modelagem relacional dos Projetos

> **Estado atual:** **implementado** no Supabase (projeto `hckrainomxsawfzmjufb`, o mesmo
> do backoffice). O SQL vive em `supabase/migrations/20260721_projects.sql`; o cliente lê
> via `src/features/projetos/data.ts` (ver [frontend.md](frontend.md) e o bloco *Projetos*
> do `CLAUDE.md`). O `projetos.json` ficou só como fonte do seed (`pnpm seed:projetos`).
>
> **Engenheiro = usuário do sistema.** Não há tabela própria de engenheiros: eles são os
> usuários do backoffice (`public.profiles`, uuid + `name` + `avatar_url`). Projetos
> pertencem a um **time** e seus engenheiros são um **subconjunto dos membros do time**.
>
> **Banco em inglês** (padrão do backoffice); os tipos do app são em português — a tradução
> PT↔EN vive só em `data.ts`. Tudo exige **sessão** (RLS `authenticated`; `profiles` é
> authenticated-only).

## Visão geral

```
teams ──1:N──> team_members ─→ profiles(user)
  │
  └──1:N──> projects ──1:N──> weekly_reports
               └── project_engineers ─→ profiles(user)   (N:N, subconjunto do time)
```

- **`teams`** — times (ex.: "Time Plataforma"). `slug` estável para seed/config.
- **`team_members`** — junção time ↔ usuário (`profiles`).
- **`projects`** — campos de topo de cada `Projeto` (+ `team_id`).
- **`project_engineers`** — junção N:N projeto ↔ usuário; os engenheiros do projeto
  (subconjunto dos membros do time). Sem linhas = projeto sem dono.
- **`weekly_reports`** — o array `registros[]` embutido, virado filhos 1:N (inclui
  `milestone`). O progresso/saúde/nota "atuais" são o registro de maior `week`.

## Tabelas

> **Referências a `public.profiles`** (tabela do backoffice: `id uuid`, `name`,
> `avatar_url`, mantida por trigger a partir de `auth.users`). Mapa PT↔EN em `data.ts`:
> `Projeto.engenheiros[]` ← `project_engineers → profiles`; `Team` ← `teams`;
> `RegistroSemanal.marco` (`inicio`/`fim`/`info`) ↔ `weekly_reports.milestone`
> (`start`/`end`/`info`).

```sql
CREATE TABLE teams (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,          -- "plataforma"
  name TEXT NOT NULL
);

CREATE TABLE team_members (
  team_id UUID NOT NULL REFERENCES teams(id)    ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE projects (
  id           TEXT PRIMARY KEY,      -- slug da URL de detalhe (#/projetos/<id>)
  code         TEXT NOT NULL UNIQUE,  -- ID estilo Jira ("PRJ-1")
  name         TEXT NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL CHECK (status IN ('discovery','refinement','in_progress',
                                               'testing','blocked','paused','done')),
  priority     SMALLINT NOT NULL CHECK (priority BETWEEN 1 AND 5),
  quarter      TEXT NOT NULL,         -- "2026-Q3"
  team_id      UUID REFERENCES teams(id),
  start_date   DATE, due_date DATE, closed_date DATE
);

-- Engenheiros do projeto: subconjunto dos membros do time (N:N com profiles).
CREATE TABLE project_engineers (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE weekly_reports (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  week       DATE NOT NULL,           -- segunda-feira da semana
  progress   SMALLINT NOT NULL CHECK (progress BETWEEN 0 AND 100),
  health     SMALLINT NOT NULL CHECK (health BETWEEN 1 AND 5),
  note       TEXT NOT NULL DEFAULT '',
  milestone  TEXT CHECK (milestone IN ('start','end','info')),  -- nullable; ignora health
  PRIMARY KEY (project_id, week)      -- 1 registro por projeto/semana
);
```

## Consultas típicas

Estado "atual" de cada projeto (o último registro, o que a UI mostra na lista):

```sql
SELECT DISTINCT ON (project_id) *
FROM weekly_reports
ORDER BY project_id, week DESC;
```

Projetos do quarter corrente (a visão principal filtra pelo quarter do relógio):

```sql
SELECT * FROM projects WHERE quarter = '2026-Q3';
```

## Decisões de modelagem

| Ponto | Escolha | Por quê |
|---|---|---|
| Engenheiro | usuário do sistema (`profiles`), sem tabela própria | engenheiro **é** um user; ganha nome+avatar; sem duplicação |
| Time | `teams` + `team_members`; `projects.team_id` | escopa o picker; agrupa projetos; reaproveitável |
| Eng. do projeto | `project_engineers` (N:N, subconjunto do time) | vários por projeto; pessoas diferentes por projeto |
| Acesso | RLS `authenticated` (leitura e escrita) | `profiles` é authenticated-only; mesma postura do backoffice |
| `status`/`priority`/`health` | `CHECK` inline | enums fechados e pequenos |
| `weekly_reports` | tabela filha, PK `(project,week)` | 1:N natural; PK aplica "1 por semana" |
| Datas | `DATE` nullable | `start_date`/`due_date`/`closed_date` já são opcionais |

## Se crescer

- **Papel do engenheiro** no projeto (lead/colab) → coluna `role` em `project_engineers`.
- **`quarters`** como tabela (`code`, `start`, `end`) para validar/ordenar no banco.
- **`projects_history`** para auditar mudanças de metadados do projeto (troca de prazo,
  de time). Hoje o histórico semanal *é* `weekly_reports`; não rastreia edição de metadados.
