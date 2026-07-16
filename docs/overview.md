# Visão geral

**Gestor** é um painel local, de uso pessoal, para me organizar: lista tarefas do
Jira (`tecnologia-appmax`) **atribuídas ao meu time** e tarefas **dos épicos que eu
acompanho**, com filtros, urgência e ordenação. Tem ainda uma aba **Sustentação** com
a escala semanal de plantão por grupo (rodízio de 2 semanas por engenheiro, com
cobertura de férias) — ver `docs/frontend.md` e `docs/data-pipeline.md`.

## Arquitetura

Em produção o frontend lê a Pages Function `/api/tasks`, que busca no Jira e cacheia em
KV (stale-while-revalidate). A orquestração das queries (`buildTasksData`, em
`sync/core.ts`) é a mesma usada pelo script local `pnpm sync`, que gera o arquivo
estático `public/data/tasks.json` — o fallback para `pnpm dev` puro (sem Wrangler).

```
                        ┌─────────────────────────────┐  fetch  ┌──────────┐
              ┌───────► │ /api/tasks (Function + KV)  │ ──────► │          │
┌──────────┐  │  SWR    │  buildTasksData + cache SWR │         │ Frontend │
│   Jira   │ ─┤         └─────────────────────────────┘         │  (Vite)  │
│ REST API │  │ pnpm    ┌─────────────────────────────┐  fetch  │          │
└──────────┘  └───────► │ public/data/tasks.json      │ ──────► │ (fallback)
                sync     │  (buildTasksData → estático)│         └──────────┘
                        └─────────────────────────────┘
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
- Sync: **tsx** (script local); dados em produção via **Pages Function + KV**
- Deploy: **Cloudflare Pages** (wrangler)

## Comandos

| Comando | O quê |
|---|---|
| `pnpm dev` | Vite dev server (http://localhost:5173) |
| `pnpm build` | `tsc -b && vite build` → `dist/` |
| `pnpm typecheck` | `tsc -b --noEmit` |
| `pnpm sync` | Jira → `tasks.json` (precisa `.env`) |
| `pnpm sync:export` | Sem rede: reaplica urgência + reconstrói a escala de sustentação |
| `pnpm run deploy` | build + `wrangler pages deploy` |
| `pnpm run deploy:create` | Cria o projeto Pages `gestor` (1x) |

## Estrutura

```
sync/                 # pipeline de dados (Node/tsx) — ver docs/data-pipeline.md
functions/api/tasks.ts # Pages Function /api/tasks (buildTasksData + cache KV)
src/                  # frontend (React) — ver docs/frontend.md
  components/ui/       # shadcn/ui copiado do backoffice
  features/tasks/      # painel, filtros, urgência, sort, status
  features/sustentacao/ # escala de plantão (página + cálculo do rodízio)
  features/ferias/     # página de férias/ausências (linha do tempo + lista)
  hooks/useTasksData.ts
sync/vacations.json   # férias/ausências que afetam a escala
public/data/          # tasks.json gerado (gitignored)
docs/                 # esta documentação
wrangler.jsonc        # config Cloudflare Pages (vars + KV binding)
```

O arquivo **gerado** `public/data/tasks.json` está no `.gitignore`; regenere com
`pnpm sync` (ou o seed inicial, ver data-pipeline).
