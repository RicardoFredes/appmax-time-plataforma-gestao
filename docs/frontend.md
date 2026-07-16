# Frontend

React + Vite. Entrada `src/main.tsx` → `src/App.tsx`. Duas abas navegadas por **hash**
(`#/sustentacao`; o resto cai em Tarefas) — sem lib de router.

## App shell — `src/App.tsx`

- Carrega `public/data/tasks.json` (ou `/api/tasks`) via `hooks/useTasksData.ts`
  (estados loading/error/ready; erro instrui a rodar `pnpm sync`). O mesmo `TasksData`
  alimenta as duas abas.
- `TopNav` (logo + abas **Tarefas**/**Sustentação**) fixo no topo; a aba vem do hash e
  é linkável/sobrevive ao reload.
- Aba **Tarefas**: header com 4 cards de métrica — **Tarefas**, **Sem responsável**
  (tarefas com `assigneeName === "Não atribuída"`), **Boards**, **Épicos** — + o painel.
- Aba **Sustentação**: `SustentacaoPage` (ver abaixo), lê `data.sustentacao`.

## Painel — `src/features/tasks/TasksPanel.tsx`

Concentra o estado (filtros, categoria do ticker, pessoas, showDone, sort) e deriva
facets + lista filtrada/ordenada.

### Abas (view)
- **Tasks**: todas as tarefas.
- **Épicos**: só as com `sources` incluindo `"epic"`.
- A coluna "Épico" só aparece na aba Épicos.

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
- **Kanban** (`KanbanBoard.tsx`): 4 colunas — Backlog, To Do, Doing, Done — via
  `kanbanLane(status)` (colapsa as 8 categorias; ver status.ts). Cards com chave,
  título/link, urgência, status, responsável (e épico na aba Épicos).
- **Done sempre visível no Kanban**: `includeDone = showDone || layout === "kanban"`.
  O toggle "Mostrar concluídas" só afeta a Tabela; no Kanban ele é substituído pelo
  texto "Done sempre visível".

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
(com badge "cobrindo …" quando é substituição), a sequência dos próximos plantões e, no
rodapé, a lista de férias/ausências.

## Status — `src/features/tasks/status.ts`

Normaliza o status cru do Jira em categorias pt-BR (Backlog, A fazer, Em progresso,
Em revisão, Em teste, Bloqueado, Concluído, Outro) por heurística de regex, com cores
para ticker/badges. `STATUS_ORDER` define a ordem lógica.

## Urgência — `src/features/tasks/urgency.ts`

`URGENCY_META` (label, cor, rank) para os três níveis. Valores vêm do overlay do sync
(`sync/urgency.json`).

## UI base

`src/components/ui/` são componentes shadcn (new-york) copiados do backoffice. `cn()`
em `src/lib/utils.ts` (clsx + tailwind-merge). Tema (cores/vars) em
`src/styles/globals.css`.
