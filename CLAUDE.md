# CLAUDE.md

Painel local (uso pessoal) que lista tarefas do Jira `tecnologia-appmax` **do meu
time** e **dos épicos acompanhados**, com filtros, urgência e ordenação. MVP sem
backend: um script busca no Jira → SQLite → gera `public/data/tasks.json` → frontend
estático lê.

## Stack
React 18 + Vite 5 + TS · Tailwind **v4** (`@tailwindcss/vite`, tema em
`src/styles/globals.css`, sem `tailwind.config`) · shadcn/ui new-york/neutral · alias
`@`→`src` · pnpm (Node 22) · sync em tsx + better-sqlite3 · deploy Cloudflare Pages.

## Comandos
`pnpm dev` · `pnpm build` · `pnpm typecheck` · `pnpm sync` (Jira→JSON, precisa `.env`) ·
`pnpm sync:export` · `pnpm run deploy`.

## Mapa
- `sync/` — pipeline de dados. `config.json` (time + épicos), `jira.ts` (REST),
  `db.ts` (SQLite), `sync.ts` (orquestra), `urgency.json`+`apply-urgency.ts` (overlay),
  `seed-from-mcp.ts` (seed one-off via MCP), `types.ts`.
- `src/features/tasks/` — `TasksPanel` (estado/filtros), `TaskFilters`, `PeopleChips`,
  `StatusTicker`, `TasksTable` (sort), `status.ts`, `urgency.ts`, `types.ts`.
- `src/components/ui/` — shadcn copiado do backoffice. `src/App.tsx` — header/métricas.
- Gerados e gitignored: `data/*.db`, `public/data/tasks.json` (regenere com `pnpm sync`).

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
- `better-sqlite3` (nativo) liberado via `pnpm.onlyBuiltDependencies`.
- Deploy: Cloudflare Pages, projeto `appmax-time-plataforma-tarefas`. URL `*.pages.dev`
  é **pública** e o `tasks.json` tem dados internos. O passo `wrangler pages deploy` é
  bloqueado no modo auto (exfiltração) — o usuário roda manualmente
  (`! pnpm exec wrangler pages deploy`).
- Tema **Appmax** (roxo `#9b6afa`) em `src/styles/globals.css`; logo em
  `src/components/logo.tsx` (copiados de `appmax-app-frontend`).
- Ao passar `"$VAR:sufixo"` no zsh, escape com `"${VAR}:sufixo"` (`:a` é modificador).

## Documentação (`docs/`)
- [overview.md](docs/overview.md) — propósito, stack, estrutura, comandos.
- [data-pipeline.md](docs/data-pipeline.md) — sync, SQLite, urgência, seed, contrato.
- [frontend.md](docs/frontend.md) — painel, abas, filtros, sort, status.
- [decisions.md](docs/decisions.md) — decisões de projeto e porquês.
- [deploy.md](docs/deploy.md) — Cloudflare Pages e exposição de dados.
