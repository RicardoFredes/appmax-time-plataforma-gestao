# CLAUDE.md

Painel local (uso pessoal) que lista tarefas do Jira `tecnologia-appmax` **do meu
time** e **dos épicos acompanhados**, com filtros, urgência e ordenação. Em produção
o frontend lê a Pages Function `/api/tasks` (busca no Jira, cache em KV, SWR); em `pnpm
dev` puro cai no fallback estático `public/data/tasks.json` gerado por `pnpm sync`.
Tem também as abas **Sustentação** (escala semanal de plantão por grupo — rodízio de 2
semanas por engenheiro, com cobertura de férias, derivada do `config.json`) e **Férias**
(linha do tempo e lista das ausências de `sync/vacations.json`).

## Stack
React 18 + Vite 5 + TS · Tailwind **v4** (`@tailwindcss/vite`, tema em
`src/styles/globals.css`, sem `tailwind.config`) · shadcn/ui new-york/neutral · alias
`@`→`src` · pnpm (Node 22) · sync em tsx · deploy Cloudflare Pages (Function + KV).

## Comandos
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm sync` (Jira→JSON, precisa `.env`) ·
`pnpm sync:export` (sem rede: reaplica o overlay de urgência **e** reconstrói a escala
de sustentação a partir de `config.json`/`vacations.json`) · `pnpm seed:projetos` (seed
one-off do `projetos.json`→Supabase, precisa service_role no `.env`) · `pnpm run deploy`.

## Mapa
- `sync/` — pipeline de dados. `config.json` (time + épicos + bloco `sustentacao`),
  `vacations.json` (férias que afetam a escala), `jira.ts` (REST), `core.ts`
  (`buildTasksData` Jira→`TasksData` + `buildSustentacao` config→escala, **compartilhado**
  com a Function), `sync.ts` (CLI que escreve o JSON), `urgency.json`+`apply-urgency.ts`
  (overlay), `seed-from-mcp.ts` (seed one-off via MCP), `types.ts`.
- `functions/api/tasks.ts` — Pages Function `/api/tasks`: `buildTasksData` + cache KV
  (SWR). Fonte de dados em produção.
- `src/features/tasks/` — `TasksPanel` (estado/filtros), `TaskFilters`, `PeopleChips`,
  `StatusTicker`, `TasksTable` (sort), `status.ts`, `urgency.ts`, `types.ts`.
- `src/features/sustentacao/` — `SustentacaoPage` (UI da escala) e `schedule.ts` (cálculo
  puro do rodízio + cobertura de férias; a semana corrente vem do relógio do cliente).
- `src/features/ferias/` — `FeriasPage` (linha do tempo + lista das ausências por status,
  lê `data.sustentacao.ferias`). Helpers de nome/avatar em `src/lib/people.ts`.
- `src/features/projetos/` — controle semanal de projetos, **dinâmico no Supabase** (não
  vem do Jira; ver Convenções → Projetos). **Identificadores em inglês** (a pasta e a rota
  `#/projetos` seguem em PT). `types.ts` (`Project` tem `engineers: Engineer[]`, N:N; registros
  são `Report[]`), `data.ts` (queries/mutations Supabase + `fetchProjects` remonta o
  `ProjectsData`; só faz a ponte snake_case↔camelCase), `useProjectsData.ts` (fetch +
  loading/erro + **realtime**), `derive.ts` (progresso/saúde atual, tendência, agrupamento por
  engenheiro com **fan-out N:N**, ordenação, `HEALTH_META`), `project-actions.ts` (hook dos
  deletes com confirmação). Página quebrada em: `ProjectsPage` (shell: rota, filtros, CRUD),
  `ProjectsReport` (relatório: panorama + sustentação + seções), `ProjectRow` (linha + átomos
  compartilhados `RowLead`/`Avatar`/`StatusBadge`/`HealthDot`), `report-metrics.ts`
  (`computeMetrics`/`dutySummary`/`compareProjects`), `report-sections.tsx` (`buildSections` por
  dimensão), `report-charts.tsx` (`Donut`/`DistBar`/`MiniStat`), `report-text.ts`
  (`buildReportText`/`copyText`). `ProjectDetail` (2 colunas: card progresso+on-tracking e
  gráfico à esquerda, histórico em altura total à direita; átomos em `project-detail-parts.tsx`;
  botões Reportar/Editar quando há sessão). CRUD: `ProjectFormDialog`/`ReportFormDialog`
  (+ `project-form-helpers.tsx`). `EvolutionChart` (SVG, linha do progresso; pontos coloridos
  pela saúde), `Gauge` (SVG, medidor semicircular do on-tracking 1–5). `projetos.json` permanece
  **só como fonte do seed** (`pnpm seed:projetos`), não é mais importado pela app. **Nenhum
  arquivo do app passa de ~300 linhas.**
- `src/components/ui/` — shadcn copiado do backoffice. `src/App.tsx` — nav por hash
  (`#/projetos`, `#/sustentacao`, `#/ferias`) entre as abas Tarefas/Projetos/Sustentação/Férias;
  header da aba Tarefas.
- Gerado e gitignored: `public/data/tasks.json` (regenere com `pnpm sync`).

## Convenções e gotchas
- Contrato de dados vive em **dois** lugares em sincronia: `src/features/tasks/types.ts`
  e `sync/types.ts`.
- Tarefa **sem dono** = `assigneeName === "Não atribuída"` (não use e-mail vazio: há
  responsável real com e-mail oculto).
- **Time casado por e-mail** (`data.users`); nomes do Jira ≠ nomes do `config.json`.
- **Urgência** é overlay manual (`sync/urgency.json`) aplicado no export → sobrevive ao
  sync. Não é campo do Jira.
- Concluídas (`statusCategory === "done"`) escondidas por padrão (toggle no painel).
- Ordenação lógica (não alfabética): urgência por severidade, status por `STATUS_ORDER`.
- **Sustentação**: grupos vêm de `sustentacao_grupo` em `config.json` (`-1` = fora da
  escala). O rodízio segue a ordem dos `users` por grupo, girada para começar no `inicio`
  do grupo, ancorado em `sustentacao.anchorMonday` (semana atual = slot 0). Semanas
  começam na segunda. Férias sobrepondo um turno → coberto pelo próximo do rodízio.
- Deploy: Cloudflare Pages, projeto `appmax-time-plataforma-tarefas`. O passo `wrangler
  pages deploy` é bloqueado no modo auto (exfiltração) — o usuário roda manualmente
  (`! pnpm exec wrangler pages deploy`).
- **Estado na URL (padrão)**: **rota no hash** (`#/projetos/<id>`), **filtros no query
  string** via History API (`replaceState`, não polui o histórico). Cada página tem um
  `url-state.ts` com `parseXState(search)`/`buildXSearch(...)` (grava só o que difere do
  padrão; **preserva** params de fora, ex.: `chrome`); a página lê no mount, reflete num
  `useEffect`, e re-lê ao ouvir `EXTERNAL_NAV_EVENT` (empurrão do backoffice via
  `route-sync.ts`). Ex.: `tasks/url-state.ts`+`TasksPanel`; `projetos/url-state.ts`
  (`quarter`, `por`)+`ProjectsPage`.
- **Embed-only**: o painel só renderiza dentro do iframe do backoffice autenticado. Duas
  camadas: header `frame-ancestors` (`public/_headers`) + guarda no boot (`src/lib/embed.ts`,
  que **redireciona** uso top-level para `BACKOFFICE_PANEL_URL`; desligada em dev). A
  allowlist de origins vive nos **dois** (header + embed.ts) em sincronia. Isso protege a
  UI, **não** o `/api/tasks` (JSON ainda acessível direto). Ver [deploy.md](docs/deploy.md).
- **Projetos**: fonte é o **Supabase** (projeto `hckrainomxsawfzmjufb`, o **mesmo do
  backoffice**), lido no cliente via `supabase-js` (`src/lib/supabase.ts`) — **não** passa
  por `sync`/Jira/KV/JSON bundlado. **Banco e app em inglês**; `data.ts` só faz a ponte de
  nomes (snake_case do banco ↔ camelCase do app). Esquema
  em `supabase/migrations/20260721_projects.sql`. Tabelas: `teams`, `team_members`,
  `projects`, `project_engineers` (N:N), `weekly_reports`. **Engenheiro = usuário do sistema**
  (`public.profiles` do backoffice, uuid + nome + avatar); projetos pertencem a um **time**
  (`projects.team_id`) e seus engenheiros são um **subconjunto dos membros do time**
  (`project_engineers`). `data.ts` remonta o `ProjectsData` e `useProjectsData.ts` faz o fetch
  com **realtime** (muda tabela → refaz a lista; também refaz em `SIGNED_IN`). Na visão "por
  engenheiro" o projeto aparece sob cada engenheiro (`derive.byEngineer` faz fan-out).
  `Report` = `{ id, date, createdAt, progress (0–100 acumulado), health (1…5), note, milestone? }`
  (no banco `weekly_reports`: `id` uuid PK, `date`, `created_at`). Reportes têm **data
  livre** — qualquer dia, **vários por dia**; ordenados por `(date, createdAt)`. Criar =
  insert; editar/apagar por `id` (`createReport`/`updateReport`/`deleteReport`).
  Migração que trocou o modelo semanal (PK `(project,week)`) pelo de data livre:
  `supabase/migrations/20260722_reports_any_date.sql`. `milestone`
  (`start`/`end`/`info`, mesmo valor no app e no banco) **ignora saúde**:
  `start`/`end` = bandeira, `info` = ícone de info (círculo vazado no gráfico).
  Progresso/saúde/nota "atuais" = último registro. Cada projeto tem `id` (slug da URL
  `#/projetos/<id>`), `code` ("PRJ-3"), `priority` (1–5) e `quarter` ("2026-Q3").
  - **Acesso**: **leitura e escrita exigem sessão** (RLS `authenticated`, como o resto do
    backoffice — `profiles` é authenticated-only). A sessão é **herdada do backoffice** via
    `postMessage` `type:"auth"` (→ `route-sync.ts` faz `setSession`; o backoffice envia em
    `appmax-backoffice-frontend/src/features/time-plataforma/page.tsx`). Em `pnpm dev`
    standalone há um **login de dev** (`src/lib/dev-auth.ts`, `VITE_DEV_EMAIL/PASSWORD`,
    chamado em `main.tsx`). Sem sessão a lista vem vazia e os botões de escrita somem.
  - **Edição** = CRUD por projeto direto no banco (`ProjectFormDialog`/`ReportFormDialog`):
    **Novo projeto** na lista; **Reportar** / **Editar** / apagar no detalhe. O picker de engenheiros lista
    os **membros do time** do projeto. Migração inicial: `pnpm seed:projetos`
    (`sync/seed-projetos.ts`, lê o `projetos.json` e mapeia e-mail→uuid via service_role). O
    antigo editor-que-gera-JSON, o `serialize.ts` e a CLI `pnpm projetos` foram **removidos**.
  - Rota de detalhe é sub-hash lida na própria `ProjectsPage`; `App.tsx` casa a página pelo
    **primeiro segmento** do hash.
  A visão principal filtra pelo **quarter atual** (relógio do cliente, `quarterOf`); quarters
  passados ficam no seletor (histórico preservado). A página tem **uma única visão** (o
  relatório, para a direção) — **sem abas**; um select "Visualizar por" (ao lado de "Copiar
  relatório") troca o **agrupamento**: prioridade, engenheiro ou status (`buildSections`).
  Sempre mostra: panorama gráfico ponderado pela importância (progresso, velocímetro de saúde,
  barra de distribuição on-tracking), a sustentação da semana (via `scheduleForAll`, dado
  passado por prop do `App`) e a linha por projeto (`ProjectRow`) com status/on-tracking/% e a
  nota mais recente. O texto de "Copiar relatório" acompanha o agrupamento selecionado.
- Tema **Appmax** (roxo `#9b6afa`) em `src/styles/globals.css`; logo em
  `src/components/logo.tsx` (copiados de `appmax-app-frontend`).
- Ao passar `"$VAR:sufixo"` no zsh, escape com `"${VAR}:sufixo"` (`:a` é modificador).

## Documentação (`docs/`)
- [overview.md](docs/overview.md) — propósito, stack, estrutura, comandos.
- [data-pipeline.md](docs/data-pipeline.md) — `core.ts`/`buildTasksData`, sync, urgência, seed, escala de sustentação, contrato.
- [frontend.md](docs/frontend.md) — painel, abas, filtros, sort, status, página de sustentação.
- [decisions.md](docs/decisions.md) — decisões de projeto e porquês.
- [deploy.md](docs/deploy.md) — Cloudflare Pages e exposição de dados.
- [projetos-db-model.md](docs/projetos-db-model.md) — proposta de modelagem relacional dos projetos (hoje em JSON à mão).
