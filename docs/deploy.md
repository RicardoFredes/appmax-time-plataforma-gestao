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

## Restringir ao time (não adotado)

Para limitar a revisão ao time, colocar **Cloudflare Access** (Zero Trust) no projeto
`gestor`, restrito a e-mails `@appmax.com.br`. Feito no dashboard Zero Trust → Access →
Applications (self-hosted apontando para o domínio do Pages).
