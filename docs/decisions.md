# Decisões

Registro curto das escolhas de projeto e o porquê.

## Sync híbrido (REST + seed via MCP)
Script Node `pnpm sync` via **API REST** do Jira (token no `.env`) para rodar sozinho,
**+** seed inicial via **MCP do Jira** (sem token) para o painel já funcionar. REST é
robusto/automatizável; o MCP evitou depender de token no dia zero.

## Time por e-mail
O filtro de "meu time" casa por **e-mail** (`data.users`), porque os `displayName` do
Jira não batem com os nomes do `config.json` (ex.: `witerlland blando nogueira silva`
vs `Witerlland Silva`).

## "Não atribuída" pelo rótulo, não pelo e-mail vazio
Detecção de tarefa sem dono usa `assigneeName === "Não atribuída"`. Motivo: alguns
responsáveis (fora do time) vêm com e-mail oculto (vazio); tratá-los como "sem dono"
os faria vazar na lista do time.

## Aba "Tasks" = tudo; "Épicos" = escopo dos épicos
"Atribuídas" virou **"Tasks"** e deixou de filtrar por origem, para as tarefas sem
responsável (que só chegam via consulta de épicos) aparecerem e o chip "Não atribuído"
funcionar nela.

## Urgência como overlay que sobrevive ao sync
Urgência é avaliação manual em `sync/urgency.json`, aplicada no export — não é campo do
Jira. Assim `pnpm sync` não sobrescreve a classificação.

## Concluídas escondidas por padrão
`statusCategory === "done"` fica oculto por padrão (toggle revela). O painel é para
trabalho em aberto; usa o `statusCategory` do Jira (confiável), não a heurística de
nome.

## SQLite removido (era better-sqlite3)
O MVP usava SQLite como cache local entre o Jira e o `tasks.json`. Com o backend
dinâmico (`/api/tasks` + KV), a orquestração passou a viver em `sync/core.ts`
(`buildTasksData`), que monta o `TasksData` inteiro em memória — merge de `sources` e
overlay de urgência incluídos. O SQLite virou intermediário puro e foi removido junto
com a dep nativa `better-sqlite3` (e o `pnpm.onlyBuiltDependencies`): menos superfície,
sem duplicação de lógica de dados. O `pnpm sync` agora chama o mesmo `buildTasksData` da
Function; `pnpm sync:export` reaplica só a urgência no JSON existente (uso offline).

## Escala de sustentação no mesmo pipeline
A escala de plantão poderia ser um arquivo à parte no frontend, mas os grupos já vivem
no `config.json` (`sustentacao_grupo` por pessoa). Para ter **fonte única**, a escala
viaja no mesmo `TasksData` (`buildSustentacao` em `core.ts`, anexado por `buildTasksData`),
então funciona igual nos dois caminhos (JSON estático e Function). O **cálculo da semana
corrente fica no cliente** (`schedule.ts`), a partir do relógio do navegador: o rodízio é
determinístico por data (ancorado em `anchorMonday`), então não depende de quando o JSON
foi gerado nem de recomputar no servidor. Férias são um arquivo separado
(`sync/vacations.json`) porque mudam por conta própria e não são campo do Jira — mesma
filosofia do overlay de urgência. Cobertura de férias substitui pelo próximo do rodízio
(display), sem deslocar a escala inteira, para manter o cálculo determinístico.

Em produção a escala **não passa pelo KV**: a Function calcula `buildSustentacao` no
bundle e anexa em toda resposta (`{ ...data, sustentacao }`), ignorando o que estiver no
cache de tarefas. Motivo: sustentação/férias são arquivos do repo, então basta editar +
redeploy para atualizar na hora — sem esperar o TTL de 15 min nem invalidar o cache. Um
bug real disso: após adicionar `sustentacao` ao contrato, o KV ainda servia um payload
antigo sem o campo e as abas apareciam vazias; calcular no bundle resolve de vez.

## Deploy público no Cloudflare Pages
Escolha explícita do usuário: publicar em `*.pages.dev` público para o time revisar,
ciente de que o `tasks.json` expõe nomes de parceiros e dados internos. Alternativa
recomendada não adotada: Cloudflare Access restrito a `@appmax.com.br`. Ver
`docs/deploy.md`.
