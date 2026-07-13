# Visão geral

**Gestor** é um painel local, de uso pessoal, para me organizar: lista tarefas do
Jira (`tecnologia-appmax`) **atribuídas ao meu time** e tarefas **dos épicos que eu
acompanho**, com filtros, urgência e ordenação.

## MVP local, sem backend

Um script roda na minha máquina, busca no Jira, guarda em SQLite e gera um JSON
estático que o frontend lê. Não há servidor de aplicação.

```
┌──────────┐  pnpm sync   ┌─────────────┐  export   ┌───────────────────────┐  fetch  ┌──────────┐
│   Jira   │ ───────────► │ SQLite      │ ────────► │ public/data/tasks.json │ ──────► │ Frontend │
│ REST API │              │ data/*.db   │           │  (+ overlay urgência)  │         │  (Vite)  │
└──────────┘              └─────────────┘           └───────────────────────┘         └──────────┘
```

## Stack

Mesma do `../../appmax/max-backoffice-frontend`:

- **React 18 + Vite 5 + TypeScript**
- **Tailwind v4** via `@tailwindcss/vite` (não há `tailwind.config`; tema em
  `src/styles/globals.css` com `@theme`)
- **shadcn/ui** estilo `new-york`, base `neutral` (componentes copiados do backoffice
  em `src/components/ui/`)
- alias `@` → `src`
- **pnpm** (Node 22, ver `.nvmrc`)
- Sync: **tsx + better-sqlite3**
- Deploy: **Cloudflare Pages** (wrangler)

## Comandos

| Comando | O quê |
|---|---|
| `pnpm dev` | Vite dev server (http://localhost:5173) |
| `pnpm build` | `tsc -b && vite build` → `dist/` |
| `pnpm typecheck` | `tsc -b --noEmit` |
| `pnpm sync` | Jira → SQLite → `tasks.json` (precisa `.env`) |
| `pnpm sync:export` | Reexporta o JSON do SQLite (sem rede) |
| `pnpm run deploy` | build + `wrangler pages deploy` |
| `pnpm run deploy:create` | Cria o projeto Pages `gestor` (1x) |

## Estrutura

```
sync/                 # pipeline de dados (Node/tsx) — ver docs/data-pipeline.md
src/                  # frontend (React) — ver docs/frontend.md
  components/ui/       # shadcn/ui copiado do backoffice
  features/tasks/      # painel, filtros, urgência, sort, status
  hooks/useTasksData.ts
data/                 # SQLite gerado (gitignored)
public/data/          # tasks.json gerado (gitignored)
docs/                 # esta documentação
wrangler.jsonc        # config Cloudflare Pages
```

Arquivos **gerados** (`data/*.db`, `public/data/tasks.json`) estão no `.gitignore`;
regenere com `pnpm sync` (ou o seed inicial, ver data-pipeline).
