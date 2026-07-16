# Deploy — Cloudflare Pages

O painel é estático. `vite build` copia `public/data/tasks.json` para `dist/`, então os
dados atuais viajam no bundle. Rode `pnpm sync` antes se quiser dados frescos.

## Config

`wrangler.jsonc`: `name: appmax-time-plataforma-tarefas`, `pages_build_output_dir:
./dist`. Conta autenticada via `wrangler login` (`ricardo.silveira@appmax.com.br`,
escopo `pages:write`).

## Comandos

```bash
pnpm run deploy:create   # 1x: cria o projeto Pages "appmax-time-plataforma-tarefas"
pnpm run deploy          # build + wrangler pages deploy (lê wrangler.jsonc)
```

O subdomínio `*.pages.dev` é atribuído na criação do projeto. (Havia um projeto antigo
`gestor` → `gestor-4tr.pages.dev`, substituído por este novo nome.)

Para atualizar após um `pnpm sync`: `pnpm run deploy` de novo.

## ⚠️ Exposição de dados e bloqueio do modo auto

A URL `*.pages.dev` é **pública**. O `tasks.json` contém nomes de parceiros, e-mails/
nomes de colaboradores e descrições de issues internas.

O passo de publicação (`wrangler pages deploy`) é **bloqueado pelo classificador de
exfiltração do Claude Code em modo auto** (dado sensível → destino público). O
consentimento no chat não libera esse bloqueio: **o usuário precisa rodar o comando**
(ex.: `! pnpm exec wrangler pages deploy`) para ver o prompt de permissão diretamente,
ou restringir o acesso antes.

## Acesso via iframe no backoffice (embed-only)

O painel é consumido **embutido num iframe** dentro do backoffice autenticado
(`backoffice.appmax.com.br`) — o usuário já está logado para chegar na rota, então só
gente autenticada vê o painel. Duas camadas garantem isso:

1. **Header `Content-Security-Policy: frame-ancestors`** (`public/_headers`, vira
   `dist/_headers` no build) — o navegador só deixa embutir o painel a partir dos origins
   listados. É o controle real (não burlável no cliente).
2. **Guarda no boot da SPA** (`src/lib/embed.ts`, usada em `App.tsx`) — se a página for
   aberta **fora de um iframe** (top-level, direto no `*.pages.dev`), mostra "Acesse pelo
   Backoffice" em vez do painel. Em `pnpm dev` a guarda é desligada.

A allowlist de origins vive em **dois lugares em sincronia**: `frame-ancestors` no
`public/_headers` e `ALLOWED_ANCESTORS` em `src/lib/embed.ts`.

Snippet do lado do backoffice (adaptar à estrutura de módulos/cabines de lá):

```tsx
const GESTOR_URL =
  import.meta.env.VITE_GESTOR_URL ??
  "https://appmax-time-plataforma-tarefas.pages.dev";

export function TimePlataformaPage() {
  return (
    <iframe
      src={GESTOR_URL}
      title="Painel do Time Plataforma"
      className="h-[calc(100vh-4rem)] w-full border-0"
    />
  );
}
```

### Caveat: isso protege a UI, não o `/api/tasks`

O iframe é cross-origin ao backoffice, então as chamadas do painel **não carregam a auth
do backoffice**. O `frame-ancestors` + a guarda impedem **renderizar** o painel fora do
backoffice, mas o endpoint `/api/tasks` continua acessível por quem souber a URL (JSON com
dados internos). Se precisar proteger o dado em si: (a) check de `Origin`/`Sec-Fetch-*` na
Function (barra acesso casual por browser, não `curl`), ou (b) **Cloudflare Access** no
projeto Pages (protege UI e API de verdade, mas o login do Access dentro de iframe
cross-origin tem atrito).
