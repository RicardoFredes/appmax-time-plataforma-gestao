# Projetos dinâmico com Supabase (CRUD por projeto, múltiplos engenheiros, sessão herdada)

> **Nota (estado final):** durante a implementação o modelo evoluiu — **engenheiro = usuário
> do sistema** (`public.profiles`, uuid+avatar), projetos pertencem a um **time** (`teams` /
> `team_members` / `projects.team_id`) e os engenheiros do projeto são um subconjunto dos
> membros do time (`project_engineers`). A **leitura também passou a exigir sessão** (RLS
> `authenticated`; `profiles` é authenticated-only), com login de dev para `pnpm dev`.
> A modelagem final e canônica está em `docs/projetos-db-model.md` e no bloco *Projetos* do
> `CLAUDE.md`. As seções abaixo são o plano original (referência histórica).

## Context

Hoje o controle de projetos é um `src/features/projetos/projetos.json` **editado à mão** e
bundlado no build. O usuário quer torná-lo **dinâmico** (dados no Supabase), com um projeto
podendo ter **vários engenheiros**, e edição **por projeto via formulários/botões**
(criar/editar/reportar), salvando direto no banco.

O painel **já roda embutido** num iframe do `appmax-backoffice-frontend`
(`/time-plataforma/*`), que já usa Supabase com login (projeto **`hckrainomxsawfzmjufb`**,
sessão email/senha). O protocolo `postMessage` do backoffice
(`appmax-backoffice-frontend/src/features/time-plataforma/page.tsx`) já casa 1:1 com o
nosso `src/lib/route-sync.ts` (tipos `ready`/`navigate`/`route-change`), mas hoje só troca
rota/filtros — **nenhum token**. `localStorage` não é compartilhado entre as origens.

**Decisões (Q&A):**
- **Acesso:** cliente direto `supabase-js` no browser + **realtime**.
- **Engenheiros:** N:N, lista plana (todos iguais).
- **Projeto Supabase:** **reutilizar `hckrainomxsawfzmjufb`** (mesmo do backoffice) → o JWT do
  backoffice vale no painel; convivência com as tabelas do backoffice isolada por RLS.
- **Escritas:** **herdar a sessão do backoffice via `postMessage`** (sem login próprio no
  painel). RLS: `SELECT` para `anon` (leitura pública, pro dev e o time verem); `INSERT/
  UPDATE/DELETE` só `authenticated`. Exige pequena mudança nos **dois** repos.
- **Edição:** CRUD por projeto (dialogs/forms/botões) salvando no DB. Aposenta a CLI
  `pnpm projetos` e o fluxo "gerar JSON". `projetos.json` fica só como fonte do seed.
- **Dev:** `pnpm dev` lê o Supabase direto (anon read). Escrita em dev precisa de sessão
  (rodar embutido ou um sign-in dev — ver Verificação).

## Esquema (SQL — rodar no SQL editor do projeto do backoffice)

**Banco em inglês** (padrão do backoffice); tipos do app em pt, mapeados em `data.ts`.
Espelha `src/features/projetos/types.ts`, com N:N de engenheiros e a coluna `milestone`.
Implementado em `supabase/migrations/20260721_projects.sql` (o backoffice roda migrations
manualmente, sem CLI — mesmo padrão).

```sql
create table engineers ( email text primary key, name text not null );

create table projects (
  id text primary key, code text not null unique, name text not null,
  description text not null default '',
  status text not null check (status in
    ('discovery','refinement','in_progress','testing','blocked','paused','done')),
  priority smallint not null check (priority between 1 and 5),
  quarter text not null, start_date date, due_date date, closed_date date
);

create table project_engineers (
  project_id text not null references projects(id) on delete cascade,
  engineer_email text not null references engineers(email),
  primary key (project_id, engineer_email)
);

create table weekly_reports (
  project_id text not null references projects(id) on delete cascade,
  week date not null,
  progress smallint not null check (progress between 0 and 100),
  health smallint not null check (health between 1 and 5),
  note text not null default '',
  milestone text check (milestone in ('start','end','info')),
  primary key (project_id, week)
);
```

Para cada tabela: `enable row level security`; policy `SELECT` `to anon, authenticated
using (true)`; policies `INSERT/UPDATE/DELETE` `to authenticated` (espelha o padrão de
`campaigns` no backoffice: `20260519_campaigns.sql`). Adicionar as 4 tabelas à publication
`supabase_realtime`. **Nenhum usuário novo** — reutiliza os usuários do backoffice.

## Ponte de sessão (postMessage) — os dois repos

- **Backoffice** (`appmax-backoffice-frontend/src/features/time-plataforma/page.tsx`):
  ao receber o handshake `ready` do painel e em `supabase.auth.onAuthStateChange`
  (`SIGNED_IN`/`TOKEN_REFRESHED`), postar para `PANEL_ORIGIN`
  `{ source:"appmax-backoffice", type:"auth", access_token, refresh_token }` (via
  `supabase.auth.getSession()`). Mantém o origin-check estrito que já existe.
- **Painel** (`src/lib/route-sync.ts`, no `onMessage`): tratar `type:"auth"` →
  `supabase.auth.setSession({ access_token, refresh_token })`. Origin já validado por
  `isAllowed`. (Alternativa: extrair para `src/lib/auth-bridge.ts`.)
- **Painel** (`src/lib/supabase.ts`, novo): client singleton com o mesmo `lock` no-op do
  backoffice (evita query travada em aba ociosa), lendo `import.meta.env.VITE_SUPABASE_*`.

## Variáveis de ambiente

- **Cliente (build):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` = **os mesmos valores
  do backoffice** (projeto `hckrainomxsawfzmjufb`). Adicionar em `.env`, `.env.sample` e
  nas env vars de build do Cloudflare Pages do painel.
- **Seed (Node, secreto, one-off):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` no `.env`
  (parser `loadEnvFile` de `sync/sync.ts:28-40` já lê `.env`).
- Dependência: `@supabase/supabase-js@^2.99.2` (mesma major do backoffice).

## Seed (migração one-off)

`sync/seed-projetos.ts`: lê `projetos.json` via `fs.readFileSync` (tsconfig `node` não
importa de `src/`, igual `sync/projetos.ts:72`), conecta com service_role, upsert em
`engenheiros` (dedup dos `engenheiroEmail/Nome` atuais + `users[]` de `sync/config.json`),
`projects`, `project_engineers` (1 por projeto no seed) e `weekly_reports`. Script
`package.json`: `"seed:projetos": "tsx sync/seed-projetos.ts"`.

## Frontend

**Deps UI (forms/dialogs):** `@radix-ui/react-dialog`, `@radix-ui/react-label`,
`@radix-ui/react-checkbox` + wrappers em `src/components/ui/` (`dialog.tsx`, `label.tsx`,
`textarea.tsx`, `checkbox.tsx`). Reusar `button/input/select/card/badge/skeleton`.

**Camada de dados (novo):**
- `src/lib/supabase.ts` — client singleton (ver ponte de sessão).
- `src/features/projetos/data.ts` — `fetchProjetos()` (monta `ProjetosData` juntando
  projetos+engenheiros+registros), `upsertProjeto`, `setEngenheiros(projetoId, emails[])`,
  `upsertRegistro`, `deleteProjeto`, `fetchEngenheiros()` (fonte do picker).
- `src/features/projetos/useProjetosData.ts` — hook espelhando `src/hooks/useTasksData.ts`
  (loading/error/ready + refetch) com **subscription realtime** (`supabase.channel`) que
  refaz o fetch em mudanças nas 4 tabelas.

**Tipos** (`src/features/projetos/types.ts`): trocar `engenheiroEmail`/`engenheiroNome` por
`engenheiros: Engenheiro[]` (`type Engenheiro = { email: string; nome: string }`).
`RegistroSemanal` inalterado.

**Consumidores (blast radius single→N):**
- `derive.ts:140-167` `porEngenheiro` — projeto entra em **N grupos** (vazio → "sem dono");
  recomputar `progressoMedio`/sort.
- `ProjetosPage.tsx` — sub-linha `:207` e relatório `:448` juntam nomes; grupo por
  engenheiro `:341-366`; **loading** (skeleton) já que vira async; botão **"Novo projeto"**
  e, por linha, **Editar** / **Reportar semana**.
- `ProjetoDetalhe.tsx:120` — listar todos os engenheiros.
- `url-state.ts` — inalterado.

**CRUD por projeto (substitui `ProjetosEditor.tsx` + `serialize.ts`):**
- `ProjetoForm` (dialog) — criar/editar metadados + **multi-picker de engenheiros**
  (checkbox list de `fetchEngenheiros()`, com adicionar e-mail novo). Salvar →
  `upsertProjeto` + `setEngenheiros`.
- `RegistroForm` (dialog) — reportar a semana (Monday via `mondayISO`), progresso/saúde/
  nota + marco opcional; `upsertRegistro` (PK `(projeto,semana)` faz edit-in-place).
  Deletar projeto com confirmação.
- Botões de escrita só agem com sessão (herdada); sem sessão (dev standalone) ficam
  desabilitados com dica.

## Remoções

- `sync/projetos.ts` (CLI) + script `"projetos"` do `package.json`.
- `src/features/projetos/serialize.ts` e `ProjetosEditor.tsx`; rota `#/projetos/editor`.
- Atualizar `CLAUDE.md`, `docs/frontend.md`, `docs/projetos-db-model.md` (→ N:N + `marco` +
  "está no banco") e `docs/data-pipeline.md`.

## Verificação (ponta a ponta)

1. Rodar o SQL no projeto `hckrainomxsawfzmjufb`; habilitar RLS + realtime nas 4 tabelas.
2. Preencher `.env` (VITE_* iguais ao backoffice + service_role); `pnpm seed:projetos` →
   conferir linhas no painel Supabase.
3. `pnpm dev` → aba Projetos carrega do Supabase (skeleton → dados), quarter atual ok
   (leitura anônima).
4. Aplicar a ponte de sessão nos 2 repos; rodar o backoffice apontando o iframe pro painel
   (dev) → o painel recebe a sessão; **Novo projeto** (2+ engenheiros) aparece na lista e
   sob cada engenheiro; abrir 2 abas → **realtime**.
5. **Reportar semana** / **Editar** → detalhe/gráfico/velocímetro atualizam.
6. Sem sessão, escrita bloqueada por RLS (testar); com sessão, ok.
7. `pnpm typecheck` + `pnpm build` limpos.

> Nota de segurança (fora do escopo): o `.env` do repo do backoffice tem segredos reais
> versionados (service_role-adjacent, senha do DB, `sk_live_...`). Vale rotacionar/remover
> do git — só sinalizando.
