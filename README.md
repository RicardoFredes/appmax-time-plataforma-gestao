# Gestor · Painel de Tarefas Jira

Painel local para me organizar: lista tarefas do Jira **atribuídas a um grupo de
pessoas** e tarefas **dos épicos que eu acompanho**, com filtros por pessoa, board,
status e busca textual.

Em produção o frontend lê a Pages Function `/api/tasks`, que busca no Jira e cacheia
em KV (stale-while-revalidate). A mesma orquestração (`sync/core.ts`) roda no script
local `pnpm sync`, que gera `public/data/tasks.json` — o fallback usado em `pnpm dev`
puro (sem Wrangler).

Stack (igual ao `max-backoffice-frontend`): **React 18 + Vite 5 + TypeScript +
Tailwind v4 + shadcn/ui (new-york, base neutral)**. Sync em **Node + tsx**; backend
dinâmico em **Cloudflare Pages Function + KV**.

```
                        ┌─────────────────────────────┐  fetch   ┌──────────┐
              ┌───────► │ /api/tasks (Function + KV)  │ ───────► │          │
┌──────────┐  │  SWR    │  buildTasksData + cache SWR │          │ Frontend │
│   Jira   │ ─┤         └─────────────────────────────┘          │  (Vite)  │
│ REST API │  │ pnpm    ┌─────────────────────────────┐  fetch   │          │
└──────────┘  └───────► │ public/data/tasks.json      │ ───────► │(fallback)│
                sync     │  (buildTasksData → estático)│          └──────────┘
                        └─────────────────────────────┘
```

## Rodando o frontend

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

Em `pnpm dev` puro o app tenta `/api/tasks` (indisponível sem Wrangler) e cai no
fallback `public/data/tasks.json`. Se ele não existir, o app mostra um aviso pedindo
para rodar `pnpm sync`. Para exercitar a Function localmente com o KV, use `pnpm
dev:cf` (`wrangler pages dev`).

## Sincronizando com o Jira (`pnpm sync`)

1. Gere um **API token** em https://id.atlassian.com/manage-profile/security/api-tokens
2. Copie o `.env`:

   ```bash
   cp .env.sample .env
   # preencha JIRA_EMAIL/JIRA_API_TOKEN e as chaves do Supabase (VITE_SUPABASE_*)
   ```

3. Ajuste `sync/config.json` (quem e quais épicos acompanhar):

   ```jsonc
   {
     "options": { "includeDone": false, "maxResultsPerQuery": 100, "doneWithinDays": 21 },
     "users":  [ { "email": "...", "name": "..." } ],  // tarefas atribuídas a essas pessoas
     "epics":  [ "SEP-358" ]                             // tarefas-filhas desses épicos
   }
   ```

4. Rode:

   ```bash
   pnpm sync              # busca no Jira → gera tasks.json
   pnpm sync:export       # só reaplica o overlay de urgência no JSON (sem rede)
   ```

### O que o sync faz

- **Atribuídas**: `assignee in (<emails>) AND statusCategory != Done`
- **Épicos**: `parent in (<epic keys>) AND statusCategory != Done`
- Mescla por `key` em memória (uma tarefa nas duas consultas fica com `sources: ["assignee","epic"]`).
- Aplica o overlay de urgência e exporta `public/data/tasks.json` no formato de
  `src/features/tasks/types.ts`.

A orquestração (`buildTasksData`, em `sync/core.ts`) é a mesma da Pages Function
`/api/tasks` — os dois caminhos não divergem.

Com `options.includeDone: true`, também traz concluídas atualizadas nos últimos
`doneWithinDays` dias.

### Urgência

`sync/urgency.json` mapeia `key -> alta|media|baixa`. Esse overlay é aplicado no
export (via `apply-urgency.ts`), **sobrevive ao sync** e aparece na coluna
"Urgência" e no filtro de urgência do painel. Edite o arquivo para reclassificar.

## Deploy (Cloudflare Pages)

O deploy publica o frontend estático **+** a Pages Function `/api/tasks`. Em produção
os dados vêm da Function (Jira + cache KV), então não é preciso rodar `pnpm sync` antes
do deploy — o `tasks.json` no bundle é só o fallback.

```bash
pnpm run deploy:create   # 1x: cria o projeto Pages "appmax-time-plataforma-tarefas"
pnpm run deploy          # build + wrangler pages deploy (lê wrangler.jsonc)
```

Config em `wrangler.jsonc` (`name`, `pages_build_output_dir: ./dist`, `vars` do Jira e
o binding KV `TASKS_KV`). O `JIRA_API_TOKEN` é secret:
`wrangler pages secret put JIRA_API_TOKEN`.

> ⚠️ **Dados internos**: o `tasks.json` contém nomes de parceiros e descrições de
> issues internas. A URL padrão do Pages (`*.pages.dev`) é **pública**. Para revisão
> só do time, proteja com **Cloudflare Access** (Zero Trust) restrito aos e-mails
> `@appmax.com.br` antes de compartilhar o link.

## Estrutura

```
sync/
  config.json        # usuários + épicos acompanhados
  urgency.json       # urgência manual por tarefa (key -> alta|media|baixa)
  apply-urgency.ts   # overlay de urgência aplicado no export
  types.ts           # contrato de dados (espelha src/features/tasks/types.ts)
  jira.ts            # cliente REST do Jira (Basic Auth via .env)
  core.ts            # buildTasksData: Jira → TasksData em memória (compartilhado)
  sync.ts            # CLI: buildTasksData → public/data/tasks.json
  seed-from-mcp.ts   # seed inicial a partir de dumps do MCP (one-off, sem token)
functions/
  api/tasks.ts       # Pages Function /api/tasks (buildTasksData + cache KV, SWR)
src/
  App.tsx            # header + cards de métricas + estados de load/erro
  hooks/useTasksData.ts
  features/tasks/
    types.ts         # contrato de dados
    status.ts        # normalização de status → categorias + cores
    TasksPanel.tsx   # estado dos filtros, facets e as abas
    TaskFilters.tsx  # busca + selects (board/status)
    PeopleChips.tsx  # chips de pessoas (multi-seleção)
    StatusTicker.tsx # barra segmentada por status (clicável)
    TasksTable.tsx   # tabela de tarefas
  components/ui/      # shadcn/ui copiado do backoffice
public/data/          # tasks.json gerado (gitignored)
```

## Notas

- `public/data/tasks.json` é **gerado** e ignorado pelo git — regenere com `pnpm sync`.
- O seed inicial (`seed-from-mcp.ts`) foi usado uma vez para popular o painel via
  MCP do Jira sem precisar de token. O fluxo recorrente é `pnpm sync`.
- Comandos: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm sync`, `pnpm sync:export`.
