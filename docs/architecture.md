# Arquitetura e boas práticas

Estrutura geral, camadas, organização por feature, naming, limites de tamanho e
anti-padrões. É o doc de referência para "onde ponho isto?" e "como nomeio?".
Contexto de negócio em [overview.md](./overview.md); detalhes por área nos demais docs.

## Visão geral

SPA React 18 + Vite 5 + TypeScript. Painel interno **embed-only** (só renderiza dentro
do iframe do backoffice; ver [deploy.md](./deploy.md) e `src/lib/embed.ts`) com quatro
abas: **Tarefas**, **Projetos**, **Sustentação**, **Férias**. Não há backend próprio —
duas fontes de dados convivem:

```
Tarefas / Sustentação / Férias          Projetos
────────────────────────────           ─────────────────────────
Jira → sync/core.ts (buildTasksData)    Supabase (mesmo do backoffice)
  ├─ prod:  /api/tasks (Function + KV)     └─ supabase-js no cliente
  └─ dev:   public/data/tasks.json            (features/projetos/data.ts)
        ↓ contrato TasksData (JSON)              ↓ realtime + RLS authenticated
              App.tsx (roteamento por hash entre as abas)
                  └─ src/features/<feature>/ (apresentação)
```

- **Tarefas/Sustentação/Férias**: dados **estáticos**, contrato `TasksData` gerado por
  `buildTasksData` (`sync/core.ts`, compartilhado entre o CLI `pnpm sync` e a Function).
  Ver [data-pipeline.md](./data-pipeline.md).
- **Projetos**: dados **dinâmicos** no Supabase, lidos/escritos no cliente com realtime.
  **Não** passa por `sync`/Jira/KV/JSON. Ver [projetos-db-model.md](./projetos-db-model.md)
  e a seção Projetos do `CLAUDE.md`.

Sem React Router (roteamento por `window.location.hash`), sem Zustand, sem TanStack
Query. Estado é `useState` local + **estado na URL** (ver abaixo).

## Camadas

Dentro de cada feature, **separe por responsabilidade em arquivos distintos**:

### 1. Dados

- **Estático** (`sync/core.ts` + `functions/api/tasks.ts`): orquestra as queries do Jira
  e monta o contrato. O `buildTasksData`/`buildSustentacao` é **compartilhado** entre o
  CLI e a Function — nunca duplique a lógica.
- **Supabase** (`features/projetos/data.ts`): funções (não classes) que falam com o
  Supabase e mapeiam **snake_case do banco ↔ camelCase do app**. Não conhecem React.

### 2. Lógica pura (sem React, sem I/O)

Cálculos determinísticos em arquivos próprios: `derive.ts` (projetos), `schedule.ts`
(rodízio de sustentação), `status.ts`/`urgency.ts` (tarefas), `panel-derive.ts`,
`report-metrics.ts`. **Não importam `react`.** Fáceis de ler e de testar isoladamente.

### 3. Hook de dados (`useX.ts`)

Faz o fetch e expõe estado `loading`/`error`/`ready`: `hooks/useTasksData.ts`,
`features/projetos/useProjectsData.ts` (fetch + **realtime** + refetch em `SIGNED_IN`).
Não retorna JSX.

### 4. Apresentação (`*.tsx`)

Componentes-função. Consomem os hooks e a lógica pura.

- Componentes **não chamam o Supabase direto** — sempre via `data.ts`/hook.
- `useState` local só para estado visual (dialog aberto, aba, filtros da página).
- Página magra: orquestra subcomponentes (ex.: `ProjectsPage` → `ProjectsReport`,
  `ProjectRow`, `ProjectDetail`).

## Estrutura de pastas

```
sync/                      # pipeline de dados (Node/tsx) — ver data-pipeline.md
  core.ts                  # buildTasksData / buildSustentacao (compartilhado c/ a Function)
  jira.ts, sync.ts, types.ts, config.json, urgency.json, vacations.json
functions/api/tasks.ts     # Pages Function /api/tasks (buildTasksData + cache KV/SWR)
src/
  main.tsx                 # Entry: devSignIn (dev) → ConfirmProvider → App
  App.tsx                  # Roteamento por hash entre as abas + guarda de embed
  features/
    tasks/                 # painel, filtros, sort, status, urgência
    projetos/              # controle de projetos (Supabase) — ver CLAUDE.md
    sustentacao/           # escala de plantão (página + cálculo puro)
    ferias/                # linha do tempo + lista de ausências
  components/
    ui/                    # shadcn/ui (new-york) copiado do backoffice
    ui/confirm.tsx         # ConfirmProvider / useConfirm
    logo.tsx
  hooks/useTasksData.ts    # fetch do contrato estático
  lib/                     # utilitários puros + integração
    supabase.ts, embed.ts, route-sync.ts, dev-auth.ts,
    useSupabaseSession.ts, people.ts, utils.ts
  styles/globals.css       # Tailwind v4 (@theme) + tema Appmax
public/data/tasks.json     # gerado (gitignored) — fallback de dev
```

## Onde vai cada coisa

| Tipo de código | Onde |
|---|---|
| Query do Jira / contrato estático | `sync/core.ts` (+ `functions/api/tasks.ts`) |
| Acesso ao Supabase (projetos) | `src/features/projetos/data.ts` |
| Lógica pura de uma feature | `derive.ts` / `schedule.ts` / `*-derive.ts` na feature |
| Hook de dados | `useX.ts` na feature (ou `src/hooks/` se compartilhado) |
| Componente específico da feature | `src/features/<feature>/...` |
| UI compartilhada | `src/components/ui/` (shadcn) ou `src/components/` |
| Helper puro compartilhado | `src/lib/` (nomeado pela responsabilidade) |
| Tipos de um domínio | `types.ts` da feature |

Regra de promoção: nasce na feature; quando surge o segundo consumidor, **promova**
para `src/lib/`, `src/hooks/` ou `src/components/`.

## Estado na URL (padrão do projeto)

- **Rota no hash** (`#/projetos/<id>`); `App.tsx` casa a aba pelo **primeiro segmento**.
- **Filtros no query string** via History API (`replaceState`, não polui o histórico).
- Cada página com filtros tem um `url-state.ts` (`parseXState`/`buildXSearch`) que grava
  **só o que difere do padrão** e **preserva params de fora** (ex.: `chrome`).
- A página lê no mount, reflete num `useEffect` e **re-lê ao ouvir `EXTERNAL_NAV_EVENT`**
  (empurrão do backoffice via `route-sync.ts`).

## File size

- Limite: **≤ 300 linhas por arquivo** (mire ~250). Nenhum arquivo do app deve passar disso.
- Acima, decomponha extraindo: subcomponentes (`.tsx` próprio), lógica pura
  (`*-derive.ts`/`*-metrics.ts`), hooks (`useX.ts`), ações (`*-actions.ts`), helpers
  (`*-helpers.tsx`), átomos de UI (`*-parts.tsx`).
- Exemplo concreto: `ProjectsPage` orquestra `ProjectsReport` + `ProjectRow` +
  `report-{metrics,sections,charts,text}` + `project-actions`; a `ProjetoForms` original
  virou `ProjectFormDialog` + `ReportFormDialog` + `project-form-helpers`.

## Naming

### Por tipo de arquivo

| Padrão | Tipo | Exemplo |
|---|---|---|
| `PascalCase.tsx` | Componente React (**named export**) | `TasksPanel.tsx`, `ProjectDetail.tsx` |
| `useX.ts` (camelCase) | Hook React | `useProjectsData.ts`, `useTasksData.ts` |
| `data.ts` | Acesso a dados (Supabase) | `features/projetos/data.ts` |
| `derive.ts` / `schedule.ts` | Lógica pura | `features/projetos/derive.ts` |
| `*-derive.ts` / `*-metrics.ts` | Lógica pura extraída | `panel-derive.ts`, `report-metrics.ts` |
| `*-helpers.tsx` / `*-parts.tsx` | Helpers / átomos de UI | `project-form-helpers.tsx` |
| `*-actions.ts` | Ações (ex.: deletes com confirmação) | `project-actions.ts` |
| `url-state.ts` | Serialização dos filtros na URL | `features/tasks/url-state.ts` |
| `types.ts` | Tipos do domínio | `features/projetos/types.ts` |

### Casing

- **PascalCase** em arquivos de componente e nos componentes exportados.
- **camelCase** em hooks (`useX.ts`), funções e variáveis.
- **kebab-case** em arquivos de lógica/helper com nome composto (`panel-derive.ts`).
- **SCREAMING_SNAKE** em constantes de configuração (`STATUS_META`, `HEALTH_META`,
  `GROUP_ACCENT`, `EXTERNAL_NAV_EVENT`).

## Imports

- Path alias **`@/` → `src/`**. Não use caminhos relativos longos (`../../..`).
- Sem barrels: importe do arquivo direto (`./derive`, `@/lib/people`).
- **`import type`** explícito para tipos.

```ts
// ✅
import { fetchProjects } from "./data";
import { STATUS_META, currentProgress } from "./derive";
import { useConfirm } from "@/components/ui/confirm";
import type { Project } from "./types";
```

## Idioma

- **Código em inglês** (tipos, funções, variáveis, nomes de arquivo). **UI em pt-BR.**
- **Comentários e docstrings em português** (o time lê PT); comente o **porquê**, não o
  *o quê*.
- **Exceções que ficam em PT de propósito** (são contrato, não código livre):
  - Rota `#/projetos` e o id de aba `"projetos"` (linkáveis, espelhados no backoffice).
  - Chaves de query string `por`/`quarter` e seus **valores** (`prioridade`/`engenheiro`/
    `status`).
  - Campos **serializados** de `SustentacaoData` (`grupo`, `escopo`, `ferias`, `inicio`,
    `fim`) — produzidos pelo `sync`/Function e lidos pelo app.

## Bootstrap

1. `main.tsx` chama `devSignIn()` (login de dev, no-op em prod/embed) e monta
   `<ConfirmProvider><App/></ConfirmProvider>`.
2. `App.tsx` roda a **guarda de embed** (`checkEmbed()`; fora do iframe → redireciona ao
   backoffice, desligada em dev), carrega `TasksData` (`useTasksData`) e, quando embutido,
   inicia o `route-sync` (sincroniza rota/filtros com a URL do backoffice via `postMessage`).
3. A sessão do Supabase é **herdada do backoffice** (`type:"auth"` → `setSession`); sem
   sessão, Projetos vem vazio e os botões de escrita somem.

## Anti-padrões

- ❌ Componente que chama `supabase.from(...)` direto — use `data.ts`/hook.
- ❌ Lógica pura (`derive.ts`, `schedule.ts`) importando `react`.
- ❌ Hook que retorna JSX.
- ❌ Duplicar a montagem do contrato — `buildTasksData` é **compartilhado** CLI ↔ Function.
- ❌ Divergir os **dois** `types.ts` do contrato (`src/features/tasks/types.ts` e
  `sync/types.ts`) — mantenha em sincronia.
- ❌ `window.confirm`/`window.prompt` (bloqueados no iframe) — use `useConfirm()`
  (`src/components/ui/confirm.tsx`).
- ❌ Cores hardcoded (`text-gray-*`, `bg-zinc-*`) — use tokens semânticos
  (`text-foreground`, `bg-primary`, `border-border`).
- ❌ Renomear rota/aba/chaves de URL ou os campos serializados da sustentação (quebra
  links salvos e o embed do backoffice).
- ❌ Ler dado de servidor com `useState` + `fetch` avulso — use o hook de dados da feature.
- ❌ `console.log` deixado no código merged.
- ❌ Arquivo `*-utils.ts` genérico — nomeie pela responsabilidade (`people.ts`, `embed.ts`).
- ❌ Comentário explicando *o que* o código faz (só o **porquê**, quando não-óbvio).
