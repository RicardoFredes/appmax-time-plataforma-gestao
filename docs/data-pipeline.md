# Pipeline de dados (sync)

Tudo em `sync/`. Fonte de verdade do frontend: `public/data/tasks.json`.

## Fluxo `pnpm sync`

`sync/sync.ts` orquestra:

1. Carrega `.env` (parser mínimo próprio, sem dependência) + `sync/config.json`.
2. **Atribuídas**: `assignee in (<emails do time>) AND statusCategory != Done`.
3. **Épicos**: `parent in (<epic keys>) AND statusCategory != Done`.
4. *Upsert* no SQLite (`sync/db.ts`, `data/gestor.db`). Uma tarefa que aparece nas
   duas consultas fica com `sources: ["assignee","epic"]`.
5. `pruneStale` remove do banco o que não foi tocado neste sync.
6. Aplica o **overlay de urgência** e exporta `public/data/tasks.json`.

JQL usa e-mail no `assignee in (...)` — funciona nesta instância (validado).
Com `options.includeDone: true`, também traz concluídas atualizadas nos últimos
`doneWithinDays` dias.

## Config — `sync/config.json`

```jsonc
{
  "options": { "includeDone": false, "maxResultsPerQuery": 100, "doneWithinDays": 21 },
  "users":  [ { "email": "...", "name": "..." } ],  // o time acompanhado (9 pessoas)
  "epics":  [ "SUS-4815", "SUS-1336", "SUS-4623" ]  // épicos acompanhados
}
```

Credenciais ficam no `.env` (ver `.env.example`): `JIRA_BASE_URL`, `JIRA_EMAIL`,
`JIRA_API_TOKEN`. `.env` está no `.gitignore`.

## SQLite — `sync/db.ts`

Tabela `tasks` com uma linha por issue (labels/sources como JSON, `synced_at` para o
prune). `better-sqlite3` é nativo: o pnpm 10 bloqueia build scripts por padrão —
liberado via `pnpm.onlyBuiltDependencies` no `package.json` (`pnpm rebuild
better-sqlite3` se precisar).

## Overlay de urgência — `sync/urgency.json` + `apply-urgency.ts`

Mapa manual `key -> alta|media|baixa`. Aplicado **no export** (não é coluna do banco),
então **sobrevive ao sync**. Editar o JSON reclassifica. Aparece na coluna "Urgência"
e no filtro do painel.

## Seed inicial (one-off) — `sync/seed-from-mcp.ts`

Como o `.env`/token não estavam configurados, o painel foi semeado a partir de dumps
brutos do **MCP do Jira** (arquivos JSON salvos), sem token:

```
pnpm tsx sync/seed-from-mcp.ts <arquivo>:assignee <arquivo>:epic --epics KEY,KEY
```

Converte os nós do MCP para o mesmo formato, passa pelo SQLite e exporta. Resultado
atual: **256 tarefas**. O fluxo recorrente é `pnpm sync` (REST).

> Gotcha zsh: ao passar `"$VAR:assignee"`, o zsh interpreta `:a` como modificador de
> parâmetro. Use `"${VAR}:assignee"`.

## Contrato de dados

Definido em `src/features/tasks/types.ts` e **espelhado** em `sync/types.ts` — manter
os dois em sincronia. `TasksData = { generatedAt, tasks[], users[], epics[], boards[] }`.
Cada `Task` traz `key, url, summary, description, board, projectKey, issueType, status,
statusCategory, priority, assigneeName, assigneeEmail, epicKey, epicSummary, labels,
created, updated, sources[], urgency`.
