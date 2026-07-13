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
Jira nem coluna do SQLite. Assim `pnpm sync` não sobrescreve a classificação.

## Concluídas escondidas por padrão
`statusCategory === "done"` fica oculto por padrão (toggle revela). O painel é para
trabalho em aberto; usa o `statusCategory` do Jira (confiável), não a heurística de
nome.

## SQLite (better-sqlite3)
Cache/fonte local sugerida pelo próprio pedido do MVP. Nativo — liberado no pnpm 10 via
`pnpm.onlyBuiltDependencies`.

## Deploy público no Cloudflare Pages
Escolha explícita do usuário: publicar em `*.pages.dev` público para o time revisar,
ciente de que o `tasks.json` expõe nomes de parceiros e dados internos. Alternativa
recomendada não adotada: Cloudflare Access restrito a `@appmax.com.br`. Ver
`docs/deploy.md`.
