# CLAUDE.md

Painel local (uso pessoal) que lista tarefas do Jira `tecnologia-appmax` **do meu
time** e **dos épicos acompanhados**, com filtros, urgência e ordenação. Em produção
o frontend lê a Pages Function `/api/tasks` (busca no Jira, cache em KV, SWR); em `pnpm
dev` puro cai no fallback estático `public/data/tasks.json` gerado por `pnpm sync`.
Tem também uma aba **Sustentação**: escala semanal de plantão por grupo (rodízio de 2
semanas por engenheiro, com cobertura de férias), derivada do `config.json`.

## Stack
React 18 + Vite 5 + TS · Tailwind **v4** (`@tailwindcss/vite`, tema em
`src/styles/globals.css`, sem `tailwind.config`) · shadcn/ui new-york/neutral · alias
`@`→`src` · pnpm (Node 22) · sync em tsx · deploy Cloudflare Pages (Function + KV).

## Comandos
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm sync` (Jira→JSON, precisa `.env`) ·
`pnpm sync:export` (sem rede: reaplica o overlay de urgência **e** reconstrói a escala
de sustentação a partir de `config.json`/`vacations.json`) · `pnpm run deploy`.

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
- `src/components/ui/` — shadcn copiado do backoffice. `src/App.tsx` — nav por hash
  (`#/sustentacao`) entre as abas Tarefas/Sustentação; header/métricas da aba Tarefas.
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
- Deploy: Cloudflare Pages, projeto `appmax-time-plataforma-tarefas`. URL `*.pages.dev`
  é **pública** e o `tasks.json` tem dados internos. O passo `wrangler pages deploy` é
  bloqueado no modo auto (exfiltração) — o usuário roda manualmente
  (`! pnpm exec wrangler pages deploy`).
- Tema **Appmax** (roxo `#9b6afa`) em `src/styles/globals.css`; logo em
  `src/components/logo.tsx` (copiados de `appmax-app-frontend`).
- Ao passar `"$VAR:sufixo"` no zsh, escape com `"${VAR}:sufixo"` (`:a` é modificador).

## Documentação (`docs/`)
- [overview.md](docs/overview.md) — propósito, stack, estrutura, comandos.
- [data-pipeline.md](docs/data-pipeline.md) — `core.ts`/`buildTasksData`, sync, urgência, seed, escala de sustentação, contrato.
- [frontend.md](docs/frontend.md) — painel, abas, filtros, sort, status, página de sustentação.
- [decisions.md](docs/decisions.md) — decisões de projeto e porquês.
- [deploy.md](docs/deploy.md) — Cloudflare Pages e exposição de dados.
