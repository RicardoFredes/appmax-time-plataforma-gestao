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
de sustentação a partir de `config.json`/`vacations.json`) · `pnpm projetos` (CLI
interativo que registra o progresso semanal em `projetos.json`) · `pnpm run deploy`.

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
- `src/features/projetos/` — controle semanal de projetos. `projetos.json` (dados **editados
  à mão**, bundlados no build — não vem do Jira), `types.ts`, `derive.ts` (progresso/saúde
  atual, tendência, agrupamento por engenheiro, ordenação, `SAUDE_META`), `ProjetosPage`
  (lista 1-por-linha + 3 visões: Por projeto, Por engenheiro, Relatório da semana),
  `ProjetoDetalhe` (2 colunas: card progresso+on-tracking e gráfico à esquerda, histórico
  em altura total à direita), `EvolucaoChart` (SVG, linha do progresso; pontos coloridos
  pela saúde), `Velocimetro` (SVG, medidor semicircular do on-tracking 1–5). Há um projeto
  fake `EX1` (id `exemplo-demonstracao`) só para demonstrar a tela preenchida — remova quando quiser.
  `ProjetosEditor` (editor visual `#/projetos/editor`, rascunho em localStorage, gera o JSON para colar)
  e `serialize.ts` (formata `ProjetosData` no estilo do arquivo, usado pelo editor).
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
  (`quarter`, `por`)+`ProjetosPage`.
- **Embed-only**: o painel só renderiza dentro do iframe do backoffice autenticado. Duas
  camadas: header `frame-ancestors` (`public/_headers`) + guarda no boot (`src/lib/embed.ts`,
  que **redireciona** uso top-level para `BACKOFFICE_PANEL_URL`; desligada em dev). A
  allowlist de origins vive nos **dois** (header + embed.ts) em sincronia. Isso protege a
  UI, **não** o `/api/tasks` (JSON ainda acessível direto). Ver [deploy.md](docs/deploy.md).
- **Projetos**: `src/features/projetos/projetos.json` é a fonte, editada à mão e **importada
  em build-time** (não passa pelo `sync`/Jira/KV). Atualização semanal = adicionar um objeto
  `{ semana, progresso (0–100 acumulado), saude (1 em perigo … 5 on tracking), nota }` em
  `registros` do projeto e fazer o deploy. Um registro pode ter `marco` (`"inicio"` | `"fim"`):
  demarca o início/fim do projeto — **sem saúde/on-tracking** (a `saude` é ignorada por
  `saudeAtual`/`tendencia` e nos deltas) e com **ícone de bandeira** no histórico e no gráfico.
  Os registros de início (progresso 0 na data `inicio`) já existem para os projetos com `inicio`. Duas formas de editar sem mexer no JSON à mão
  (mão continua válido): **(a) editor no frontend** — rota `#/projetos/editor` (botão
  "Reportar / editar" na página), `ProjetosEditor.tsx`: mantém um **rascunho em localStorage**
  (`projetos:editor:draft:v1`, seed do JSON bundlado), preenche progresso/saúde/nota da semana
  por projeto, edita metadados, adiciona/remove projetos, e ao final **Copiar JSON**/baixar
  para colar em `projetos.json` + deploy; **(b) CLI** `pnpm projetos` (`sync/projetos.ts`,
  `readline` nativo, sem deps) para editar direto no arquivo. Ambos usam a `semana` da
  segunda-feira corrente (edita no lugar se já existir) e preservam o `$doc` e o estilo do
  arquivo (registros em linha única) — via `serialize.ts` no front e uma cópia da mesma
  lógica no CLI (o projeto `sync` do tsconfig não importa de `src`). Progresso/saúde/nota "atuais" = os do último
  registro (por `semana`). Cada projeto tem `id` (slug da URL de detalhe `#/projetos/<id>`),
  `codigo` (ID estilo Jira, ex.: "PRJ-3"), `prioridade` (1–5, peso das métricas) e `quarter`
  (ex.: "2026-Q3"). Fica em `src/` (não em `sync/`) por causa do `composite`+`include:["src"]`
  do tsconfig, que exige o JSON dentro da árvore type-checada. Rota de detalhe é sub-hash lida
  na própria `ProjetosPage`; `App.tsx` casa a página pelo **primeiro segmento** do hash.
  A visão principal filtra pelo **quarter atual** (relógio do cliente, `quarterDe`); quarters
  passados ficam no seletor (histórico preservado). A página tem **uma única visão** (o
  relatório, para a direção) — **sem abas**; um select "Visualizar por" (ao lado de "Copiar
  relatório") troca o **agrupamento**: prioridade, engenheiro ou status (`montarSecoes`).
  Sempre mostra: panorama gráfico ponderado pela importância (progresso, velocímetro de saúde,
  barra de distribuição on-tracking), a sustentação da semana (via `scheduleForAll`, dado
  passado por prop do `App`) e a linha por projeto (`ProjetoRow`) com status/on-tracking/% e a
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
