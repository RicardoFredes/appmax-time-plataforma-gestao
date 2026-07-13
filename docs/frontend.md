# Frontend

React + Vite. Entrada `src/main.tsx` → `src/App.tsx`. Sem router (página única).

## App shell — `src/App.tsx`

- Carrega `public/data/tasks.json` via `hooks/useTasksData.ts` (estados
  loading/error/ready; erro instrui a rodar `pnpm sync`).
- Header com 4 cards de métrica: **Tarefas**, **Sem responsável** (tarefas com
  `assigneeName === "Não atribuída"`), **Boards**, **Épicos**.

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
