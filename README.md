# Gestor · Painel de Tarefas Jira

Painel local para me organizar: lista tarefas do Jira **atribuídas a um grupo de
pessoas** e tarefas **dos épicos que eu acompanho**, com filtros por pessoa, board,
status e busca textual.

MVP local: um script roda na minha máquina, busca no Jira, guarda em SQLite e gera
um JSON estático que o frontend lê. Sem backend.

Stack (igual ao `max-backoffice-frontend`): **React 18 + Vite 5 + TypeScript +
Tailwind v4 + shadcn/ui (new-york, base neutral)**. Sync em **Node + tsx +
better-sqlite3**.

```
┌──────────┐   pnpm sync    ┌─────────────┐   export   ┌──────────────────────┐   fetch   ┌──────────┐
│   Jira   │ ─────────────► │ SQLite      │ ─────────► │ public/data/tasks.json│ ───────► │ Frontend │
│ REST API │                │ data/*.db   │            │  (estático)           │           │  (Vite)  │
└──────────┘                └─────────────┘            └──────────────────────┘           └──────────┘
```

## Rodando o frontend

```bash
pnpm install
pnpm dev            # http://localhost:5173
```

O app lê `public/data/tasks.json`. Esse arquivo já vem semeado com dados reais.
Se ele não existir, o app mostra um aviso pedindo para rodar `pnpm sync`.

> A primeira instalação compila o `better-sqlite3` (dependência nativa). O pnpm
> pede aprovação de build scripts — já está liberado via `pnpm.onlyBuiltDependencies`
> no `package.json`. Se precisar: `pnpm rebuild better-sqlite3`.

## Sincronizando com o Jira (`pnpm sync`)

1. Gere um **API token** em https://id.atlassian.com/manage-profile/security/api-tokens
2. Copie o `.env`:

   ```bash
   cp .env.example .env
   # preencha JIRA_EMAIL e JIRA_API_TOKEN
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
   pnpm sync              # busca no Jira → atualiza SQLite → gera tasks.json
   pnpm sync:export       # só reexporta o JSON a partir do SQLite (sem rede)
   ```

### O que o sync faz

- **Atribuídas**: `assignee in (<emails>) AND statusCategory != Done`
- **Épicos**: `parent in (<epic keys>) AND statusCategory != Done`
- Faz *upsert* no SQLite (uma tarefa que aparece nos dois cria `sources: ["assignee","epic"]`).
- Remove do banco tarefas que saíram de escopo.
- Exporta `public/data/tasks.json` no formato de `src/features/tasks/types.ts`.

Com `options.includeDone: true`, também traz concluídas atualizadas nos últimos
`doneWithinDays` dias.

### Urgência

`sync/urgency.json` mapeia `key -> alta|media|baixa`. Esse overlay é aplicado no
export (via `apply-urgency.ts`), **sobrevive ao sync** e aparece na coluna
"Urgência" e no filtro de urgência do painel. Edite o arquivo para reclassificar.

## Deploy (Cloudflare Pages)

O painel é estático — o `vite build` copia `public/data/tasks.json` para `dist/`,
então os dados atuais viajam no bundle. Rode `pnpm sync` antes se quiser dados frescos.

```bash
pnpm run deploy:create   # 1x: cria o projeto Pages "appmax-time-plataforma-tarefas"
pnpm run deploy          # build + wrangler pages deploy (lê wrangler.jsonc)
```

Config em `wrangler.jsonc` (`name: appmax-time-plataforma-tarefas`,
`pages_build_output_dir: ./dist`).

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
  db.ts              # SQLite: schema, upsert, prune, leitura
  sync.ts            # orquestrador: fetch → sqlite → json
  seed-from-mcp.ts   # seed inicial a partir de dumps do MCP (one-off, sem token)
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
data/                 # SQLite (gitignored)
public/data/          # tasks.json gerado (gitignored)
```

## Notas

- `data/gestor.db` e `public/data/tasks.json` são **gerados** e ignorados pelo git —
  regenere com `pnpm sync`.
- O seed inicial (`seed-from-mcp.ts`) foi usado uma vez para popular o painel via
  MCP do Jira sem precisar de token. O fluxo recorrente é `pnpm sync`.
- Comandos: `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm sync`, `pnpm sync:export`.
