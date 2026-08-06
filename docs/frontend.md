# Frontend

React + Vite. Entrada `src/main.tsx` → `src/App.tsx`. Abas navegadas por **hash**
(`#/onboarding`, `#/tarefas`, `#/projetos`, `#/sustentacao`, `#/ferias`), sem lib de
router. A **raiz** `#/` é o Onboarding, e o que não casa cai nele.

## App shell — `src/App.tsx`

- Carrega `public/data/tasks.json` (ou `/api/tasks`) via `hooks/useTasksData.ts`
  (estados loading/error/ready; erro instrui a rodar `pnpm sync`). O mesmo `TasksData`
  alimenta as duas abas.
- `TopNav` (logo + abas **Onboarding**/**Tarefas**/**Projetos**/**Sustentação**/**Férias**)
  fixo no topo; a aba vem do hash e é linkável/sobrevive ao reload. Onboarding vem
  primeiro por ser a raiz: quem abre o painel sem rota cai nele.
- Aba **Tarefas**: header com 4 cards de métrica — **Tarefas**, **Sem responsável**
  (tarefas com `assigneeName === "Não atribuída"`), **Boards**, **Épicos** — + o painel.
- Aba **Sustentação**: `SustentacaoPage` (ver abaixo), lê `data.sustentacao`.
- Aba **Férias**: `FeriasPage` (ver abaixo), lê `data.sustentacao.ferias`.
- Aba **Onboarding**: `OnboardingPage` (ver abaixo). É a única que **não** lê o `TasksData`.
  Renderiza antes do gate de loading/erro, então funciona mesmo com o `tasks.json` fora.

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
- Coluna **Datas** (`dates.ts`, nas duas tabelas): criação e prazo (`dueDate`, o due
  date do Jira) empilhados, formato `dd MMM yy`; sem prazo mostra "—". O prazo fica
  em rosa quando venceu e em âmbar quando vence em ≤ 2 dias — concluídas nunca alarmam.

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
- **Overrides** (`data.overrides`, trocas pontuais do `config.json`): vencem rodízio e
  cobertura. O slot é **partido** nos trechos do override (`splitSlot`) e o resto volta ao
  plantão natural, então `current`/`upcoming` são **trechos**, não slots inteiros — daí o
  `key` (o `index` repete) e o `override: { replaced, motivo }`. Trechos vizinhos do mesmo
  override são fundidos (`mergeOverrides`), pois um override pode cruzar slots; trechos já
  encerrados são descartados. Overrides sobrepostos: o que começa primeiro ganha.

`SustentacaoPage.tsx` renderiza um card por grupo: responsável da semana em destaque
(com badge "cobrindo …" quando é substituição por férias e "no lugar de …" quando é
override — aí o "semana X de Y" some, que só vale no turno natural) e a sequência dos
próximos plantões. A lista de férias em si vive na aba **Férias** (abaixo).

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

## Onboarding: `src/features/onboarding/`

Página estática de boas-vindas ao time. Serve pra quem acabou de entrar: quem é quem, o
que cada repositório faz, quais contextos sustentamos, qual é a stack e onde ficam as
ferramentas.

**Todo o conteúdo é hardcoded**: não passa por Jira, Supabase nem pelo `sync`. É
documentação versionada, e editar é o fluxo normal de atualização:

| Arquivo | O que guarda |
|---|---|
| `team.ts` | Pessoas, trilhas, cargos e skills. A lista **espelha** `sync/config.json`. |
| `repos.ts` | Repositórios agrupados (Appmax / Max / plataforma compartilhada), com remote e stack. |
| `contexts.ts` | Contextos com N1/N2, vindos da planilha de domínios. |
| `stack.ts` | Tecnologias por categoria + `QUICK_LINKS` (ferramentas externas) + `PANEL_LINKS` (abas do painel). Exporta `chipFor()`, usado pelas outras seções. |

UI: `OnboardingPage` é o shell, com hero fixo no topo, **menu lateral** e **uma seção
por vez** (o conteúdo é longo demais pra uma página corrida). Cada seção mora num arquivo:
`TeamSection` (cards ⇄ organograma), `ReposSection` (**tabela** por grupo, com filtro por
texto), `ContextsSection`, `StackSection` (que também exporta `LinksSection`). Átomos
comuns (`Avatar`, `Section`, `GroupHeading`, `RichText`, `StackChip`) em `parts.tsx`.

A seção aberta é **sub-rota** (`#/onboarding/<seção>`, default `time`), lida por
`useSectionRoute`, mesmo padrão do detalhe de projeto em `ProjectsPage`. `App.tsx` casa
a aba pelo primeiro segmento do hash, então a sub-rota não interfere. Em telas estreitas
o menu vira uma faixa horizontal rolável.

Como esta é a **rota raiz**, `#/` e `#/onboarding` levam ao mesmo lugar (seção `time`).
Navegar pra aba, porém, escreve sempre `#/onboarding`: o backoffice espelha o hash no
path dele (`/time-plataforma/<rota>`) e, sem o segmento, o item do menu não consegue
ficar ativo enquanto se navega pelas seções.

Detalhes que não são óbvios:

- **Cargo/skills não existem no `config.json`**, só aqui. Adicionar alguém ao time é
  editar os dois arquivos.
- **Skills ficam escondidas por padrão** (toggle "Skills" na seção O time): os chips
  competiam com o que o card existe pra responder, que é quem é a pessoa.
- **N1/N2 não precisa estar em `MEMBERS`**: contexto compartilhado pode ter dono de outro
  time (ex.: o Site). Nesses casos o nome é derivado do e-mail.
- **Avatar é foto quando existe, iniciais quando não.** A foto vem do campo `avatar` do
  `Member` (arquivo em `public/img/avatar/<login>.jpg`, 128px); sem ela, o `Avatar` cai
  nas iniciais com cor derivada de um hash do e-mail (`accentFor`), estável quando alguém
  entra ou sai. Quem acaba de entrar não tem foto, então as iniciais são estado normal e
  não erro. Os contextos reaproveitam a foto quando o N1/N2 está em `MEMBERS`.
- **Binários do repo**: fotos em `public/img/avatar/`, logos de tecnologia em
  `public/img/stack/` e de ferramenta em `public/img/tools/`. Logo monocromático escuro
  (GitHub) usa `mono: true` no `QuickLink` pra inverter no dark.

## UI base

`src/components/ui/` são componentes shadcn (new-york) copiados do backoffice. `cn()`
em `src/lib/utils.ts` (clsx + tailwind-merge). Tema (cores/vars) em
`src/styles/globals.css`.
