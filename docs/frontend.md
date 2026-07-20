# Frontend

React + Vite. Entrada `src/main.tsx` → `src/App.tsx`. Três abas navegadas por **hash**
(`#/sustentacao`, `#/ferias`; o resto cai em Tarefas) — sem lib de router.

## App shell — `src/App.tsx`

- Carrega `public/data/tasks.json` (ou `/api/tasks`) via `hooks/useTasksData.ts`
  (estados loading/error/ready; erro instrui a rodar `pnpm sync`). O mesmo `TasksData`
  alimenta as duas abas.
- `TopNav` (logo + abas **Tarefas**/**Sustentação**/**Férias**) fixo no topo; a aba vem
  do hash e é linkável/sobrevive ao reload.
- Aba **Tarefas**: header com 4 cards de métrica — **Tarefas**, **Sem responsável**
  (tarefas com `assigneeName === "Não atribuída"`), **Boards**, **Épicos** — + o painel.
- Aba **Sustentação**: `SustentacaoPage` (ver abaixo), lê `data.sustentacao`.
- Aba **Férias**: `FeriasPage` (ver abaixo), lê `data.sustentacao.ferias`.

## Painel — `src/features/tasks/TasksPanel.tsx`

Concentra o estado (filtros, categoria do ticker, pessoas, showDone, sort) e deriva
facets + lista filtrada/ordenada.

### Abas (view)
- **Tasks**: lista plana de tarefas (tabela ou kanban).
- **Épicos**: as tarefas com `sources` incluindo `"epic"`, **agrupadas por épico** em
  seções colapsáveis (`EpicGroups.tsx`) — cada grupo tem cabeçalho com ícone de épico,
  título/chave do épico, contador e link para o Jira; o corpo é a tabela das tarefas
  daquele épico. A ordem dos grupos segue `data.epics` (épicos sem tarefas são omitidos;
  "Sem épico" por último). O alternador Tabela/Kanban só aparece na aba Tasks.
- **Épicos nunca são listados como linha** em nenhuma aba (`isEpic(issueType)` em
  `issue.ts` os exclui da base) — na aba Épicos eles são só o cabeçalho do grupo.
- Ícone do tipo (`IssueTypeIcon`): épico (roxo, `Zap`) x bug (vermelho) x task (azul).

### Regra base (aplicada nas duas abas)
- Mostra **apenas não-atribuídas ou pessoas do time**. "Não atribuída" é detectada
  pelo rótulo (`assigneeName === "Não atribuída"`), **não** por e-mail vazio — porque
  há casos de responsável real com e-mail oculto que não devem vazar como sem dono.
- Time é casado por **e-mail** (`data.users`), pois os nomes do Jira não batem com os
  do config.
- Concluídas (`statusCategory === "done"`) escondidas por padrão; toggle "Mostrar
  concluídas" as revela.

### Filtros
- Busca textual (título, board, resumo, responsável, épico).
- Selects: board, status, urgência.
- **Chips de pessoas** ("MEU TIME"): membros do time + chip **"Não atribuído"**
  (só quando há tarefas sem dono). Seleção múltipla, lógica **OU** (por e-mail; o
  sentinela `__unassigned__` casa as sem dono).
- **Ticker de status** segmentado e clicável (filtra por categoria).
- Tudo reflete o conjunto visível (facets recalculados sobre a base).

### Ordenação (sort) — `TasksTable`
Colunas clicáveis: **Responsável**, **Urgência**, **Status**. Ciclo asc → desc → sem
ordem. Ordem **lógica**, não alfabética:
- Responsável: alfabético pt-BR.
- Urgência: por severidade (`URGENCY_META.rank`: Alta < Média < Baixa; sem urgência
  por último).
- Status: pela ordem do fluxo (`STATUS_ORDER`), mapeando status → categoria.

### Layout: Tabela / Kanban
Alternador no topo do painel (`layout`: `table` | `kanban`). Ambos consomem o mesmo
conjunto filtrado/ordenado (`sorted`).
- **Kanban** (`KanbanBoard.tsx`, só na aba Tasks): 4 colunas — Backlog, To Do, Doing,
  Done — via `kanbanLane(status)` (colapsa as 8 categorias; ver status.ts). Cards com
  chave, título/link, urgência, status, responsável.
- **Done sempre visível no Kanban**: `includeDone = showDone || kanban` (onde
  `kanban = view === "tasks" && layout === "kanban"`). O toggle "Mostrar concluídas"
  vale nas listas (Tabela e Épicos); no Kanban ele é substituído pelo texto "Done
  sempre visível".

## Sustentação — `src/features/sustentacao/`

Escala de plantão por grupo. `schedule.ts` é o **cálculo puro** do rodízio; a semana
corrente vem do relógio do cliente (`new Date()` no render), então a página está sempre
certa mesmo com o JSON gerado dias antes.

- **Slots**: semanas começam na segunda (`weekStartsOn: 1`); cada engenheiro cobre
  `semanasPorEngenheiro` semanas. O slot que contém `anchorMonday` é o slot 0 e cabe ao
  primeiro engenheiro do grupo (a lista já vem girada para começar no `inicio`).
- **Índice do slot atual**: `floor(semanas_desde_o_anchor / semanasPorEngenheiro)`; o
  engenheiro é `engenheiros[slot % n]`.
- **Férias**: se o turno do engenheiro-base sobrepõe uma ausência (`data.ferias`), o
  slot é coberto pelo **próximo disponível** do rodízio (`effective` ≠ `base`,
  `coveringFor` preenchido); se ninguém puder cobrir, `uncovered`.

`SustentacaoPage.tsx` renderiza um card por grupo: responsável da semana em destaque
(com badge "cobrindo …" quando é substituição) e a sequência dos próximos plantões. A
lista de férias em si vive na aba **Férias** (abaixo).

## Férias — `src/features/ferias/FeriasPage.tsx`

Página dedicada às ausências (`data.sustentacao.ferias`). Classifica cada período por
status contra o relógio do cliente — **Em férias agora**, **A seguir**, **Encerradas** —
com rótulo relativo ("começa em N dias", "termina em N dias", "terminou há N dias") e
duração em dias corridos. Mostra uma **linha do tempo** (gantt) com eixo de meses, uma
barra por ausência e marcador de "hoje", além da lista agrupada por status. Cores por
status; iniciais de avatar via `src/lib/people.ts`.

## Status — `src/features/tasks/status.ts`

Normaliza o status cru do Jira em categorias internas com **chaves em inglês**
(`backlog`, `todo`, `in_progress`, `in_review`, `testing`, `blocked`, `done`, `other`
— padronizadas com Projetos) por heurística de regex, com cores para ticker/badges. O
texto por tarefa exibido é o status **cru do Jira**; as categorias servem à cor/ordenação/
lanes. `STATUS_ORDER` define a ordem lógica.

## Urgência — `src/features/tasks/urgency.ts`

`URGENCY_META` (label, cor, rank) para os três níveis. Valores vêm do overlay do sync
(`sync/urgency.json`).

## UI base

`src/components/ui/` são componentes shadcn (new-york) copiados do backoffice. `cn()`
em `src/lib/utils.ts` (clsx + tailwind-merge). Tema (cores/vars) em
`src/styles/globals.css`.
