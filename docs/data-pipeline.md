# Pipeline de dados (sync)

Tudo em `sync/`. A orquestração das queries vive em `sync/core.ts` (`buildTasksData`),
**compartilhada** por dois consumidores para não divergir:

- **Produção**: a Pages Function `functions/api/tasks.ts` (`/api/tasks`) chama
  `buildTasksData`, cacheia em KV com stale-while-revalidate e serve o frontend.
- **Local/fallback**: `pnpm sync` chama `buildTasksData` e escreve o arquivo estático
  `public/data/tasks.json`, que o frontend lê quando `/api/tasks` não existe (`pnpm
  dev` puro).

## `buildTasksData` (`sync/core.ts`)

1. **Atribuídas**: `assignee in (<emails do time>) AND statusCategory != Done`.
2. **Épicos**: `parent in (<epic keys>) AND statusCategory != Done`.
3. Mescla por `key` em memória: uma tarefa que aparece nas duas consultas fica com
   `sources: ["assignee","epic"]`.
4. Busca metadados dos épicos e aplica o **overlay de urgência**; devolve o `TasksData`.

Roda tanto em `tsx` (script local) quanto no Worker da Function (com `nodejs_compat`
para o `Buffer` do Basic Auth em `jira.ts`). Sem `fs`, sem banco.

JQL usa e-mail no `assignee in (...)` — funciona nesta instância (validado).
Com `options.includeDone: true`, também traz concluídas atualizadas nos últimos
`doneWithinDays` dias.

## Fluxo `pnpm sync` (`sync/sync.ts`)

Carrega `.env` (parser mínimo próprio) + `sync/config.json` + `sync/vacations.json`,
chama `buildTasksData` e escreve `public/data/tasks.json`. `pnpm sync:export`
(`--export-only`) **não toca no Jira**: relê o JSON existente, reaplica o overlay de
urgência e **reconstrói a escala de sustentação** a partir de `config.json`/`vacations.json`
— útil depois de editar `urgency.json`, a escala ou as férias, sem rede.

## Config — `sync/config.json`

```jsonc
{
  "options": { "includeDone": false, "maxResultsPerQuery": 100, "doneWithinDays": 21 },
  "users":  [ { "email": "...", "name": "...", "sustentacao_grupo": 1 } ],  // time (grupo -1 = fora da escala)
  "epics":  [ "SUS-4815", "SUS-1336", "SUS-4623" ],  // épicos acompanhados
  "sustentacao": {                                    // escala de plantão (ver abaixo)
    "anchorMonday": "2026-07-13",                     // segunda em que o `inicio` de cada grupo assume
    "semanasPorEngenheiro": 2,
    "grupos": [ { "grupo": 1, "escopo": "...", "inicio": "<email>" } ]
  }
}
```

Credenciais ficam no `.env` (ver `.env.sample`): `JIRA_BASE_URL`, `JIRA_EMAIL`,
`JIRA_API_TOKEN`. `.env` está no `.gitignore`.

## Escala de sustentação — `config.json` (`sustentacao`) + `vacations.json`

`buildSustentacao` (`sync/core.ts`) monta a escala **sem rede**, anexada em
`TasksData.sustentacao`. Cada grupo tem seus engenheiros a partir de `sustentacao_grupo`
nos `users` (grupo `-1` fica fora); a ordem do rodízio é a ordem dos `users` no grupo,
**girada para começar no `inicio`**. O slot que contém `anchorMonday` é o slot 0 e cabe
ao `inicio`; cada engenheiro cobre `semanasPorEngenheiro` semanas (segunda a domingo).

`sync/vacations.json` lista férias/ausências (`{ email, inicio, fim }`, datas
`YYYY-MM-DD` inclusivas). O cálculo da semana corrente e da cobertura roda **no cliente**
(`src/features/sustentacao/schedule.ts`) a partir do relógio do navegador, então o painel
está sempre certo independentemente de quando o JSON foi gerado. Se o engenheiro do turno
estiver de férias sobrepondo o período, o plantão é coberto pelo próximo disponível do
rodízio.

**Produção não cacheia a escala.** Como os dados vêm de arquivos estáticos do repo
(empacotados no deploy), a Pages Function calcula `buildSustentacao` no bundle e **anexa
em toda resposta**, sobrescrevendo o que houver no cache de tarefas do KV. Só as tarefas
do Jira passam pelo KV; editar `config.json`/`vacations.json` + redeploy atualiza a escala
na hora, sem depender do TTL do cache.

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

Converte os nós do MCP para o mesmo formato, mescla `sources` por `key` em memória e
exporta. O fluxo recorrente é `pnpm sync` (REST).

> Gotcha zsh: ao passar `"$VAR:assignee"`, o zsh interpreta `:a` como modificador de
> parâmetro. Use `"${VAR}:assignee"`.

## Contrato de dados

Definido em `src/features/tasks/types.ts` e **espelhado** em `sync/types.ts` — manter
os dois em sincronia. `TasksData = { generatedAt, tasks[], users[], epics[], boards[],
sustentacao }`. Cada `Task` traz `key, url, summary, description, board, projectKey,
issueType, status, statusCategory, priority, assigneeName, assigneeEmail, epicKey,
epicSummary, labels, created, updated, sources[], urgency`. `sustentacao = { anchorMonday,
semanasPorEngenheiro, grupos[], ferias[] }`, com cada grupo `{ grupo, escopo,
engenheiros[] }` (já na ordem do rodízio) e cada férias `{ email, name, inicio, fim }`.
