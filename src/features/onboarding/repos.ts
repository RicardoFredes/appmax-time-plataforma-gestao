/**
 * Repositórios que o time toca, hardcoded. Nomes, remotes e descrições foram
 * levantados dos clones em `~/Projects/appmax`, do README/CLAUDE.md de cada um.
 * Não há sync automático: ao clonar algo novo, adicione aqui.
 */
import type { Repo, RepoGroup } from "./types";

const BITBUCKET = "https://bitbucket.org/appmax-space";
const GITHUB = "https://github.com/appmaxbrasil";

export const REPO_GROUPS: RepoGroup[] = [
  {
    id: "appmax",
    label: "Appmax",
    description: "Sub-adquirente: painéis, site e jornadas do lojista.",
  },
  {
    id: "max",
    label: "Max",
    description: "Banking: app, backoffice, site e roteamento bancário.",
  },
  {
    id: "plataforma",
    label: "Plataforma compartilhada",
    description: "Serviços que atendem Appmax e Max ao mesmo tempo.",
  },
];

export const REPOS: Repo[] = [
  // Appmax
  {
    name: "sistema",
    group: "appmax",
    description:
      "Monolito Laravel que é o núcleo da Appmax. Stack legada, mas ainda a fonte de verdade de boa parte do negócio.",
    stack: ["php", "laravel"],
    url: `${BITBUCKET}/sistema`,
    host: "bitbucket",
  },
  {
    name: "appmax-backoffice-frontend",
    group: "appmax",
    description:
      "Backoffice interno da Appmax: Help Center (artigos, mídia, editor com presença em tempo real) e Gerenciamento (usuários e permissões). É aqui que este painel roda embutido.",
    stack: ["react", "typescript", "tailwind", "postgres"],
    url: `${BITBUCKET}/appmax-backoffice-frontend`,
    host: "bitbucket",
  },
  {
    name: "appmax-frontend-admin",
    group: "appmax",
    description:
      "Admin da Appmax: o painel operacional novo, reescrito em React sobre Vite.",
    stack: ["react", "typescript", "tailwind"],
    url: `${BITBUCKET}/appmax-frontend-admin`,
    host: "bitbucket",
  },
  {
    name: "appmax-app-frontend",
    group: "appmax",
    description:
      "Protótipo de validação do novo CRM da Appmax. Mesma stack do max-backoffice-frontend, porém sem backend.",
    stack: ["react", "typescript", "tailwind"],
    url: `${BITBUCKET}/appmax-app-frontend`,
    host: "bitbucket",
  },
  {
    name: "appmax-help-center-site",
    group: "appmax",
    description:
      "Central de Ajuda pública. Roda em Cloudflare Workers com Hono fazendo SSR em JSX. Único repo do time no GitHub.",
    stack: ["hono", "typescript", "tailwind"],
    url: `${GITHUB}/appmax-help-center-site`,
    host: "github",
  },
  {
    name: "appmax-site-frontend",
    group: "appmax",
    description:
      "Site institucional da Appmax. Astro estático com i18n tipado (PT/EN) e rotas centralizadas.",
    stack: ["astro", "typescript", "tailwind"],
    url: `${BITBUCKET}/appmax-site-frontend`,
    host: "bitbucket",
  },
  {
    name: "appmax-login",
    group: "appmax",
    description:
      "SPA de autenticação e gestão de sessão da Appmax. Vue 3 com build híbrido Vite + Webpack.",
    stack: ["vue", "typescript"],
    url: `${BITBUCKET}/appmax-login`,
    host: "bitbucket",
  },
  {
    name: "appmax-client-vue3",
    group: "appmax",
    description:
      "Área do cliente Appmax. Composition API com design system próprio (@appmax_npm/ds-prime), nunca PrimeVue direto.",
    stack: ["vue", "typescript", "tailwind"],
    url: `${BITBUCKET}/appmax-client-vue3`,
    host: "bitbucket",
  },
  {
    name: "appmax-frontend-monorepo",
    group: "appmax",
    description:
      "Monorepo que agrupa os frontends mais recentes da Appmax em apps/client e apps/sso.",
    stack: ["typescript"],
    url: `${BITBUCKET}/appmax-frontend-monorepo`,
    host: "bitbucket",
  },

  // Max
  {
    name: "app-flutter",
    group: "max",
    description:
      "App bancário do Max (Android + iOS). Monorepo Flutter gerenciado com Melos, app principal em max_app/.",
    stack: ["flutter", "firebase"],
    url: `${BITBUCKET}/app-flutter`,
    host: "bitbucket",
  },
  {
    name: "max-backoffice-frontend",
    group: "max",
    description:
      "Backoffice do Max, em React 18 + TypeScript. É a referência de stack e convenções para os frontends novos do time.",
    stack: ["react", "typescript", "tailwind"],
    url: `${BITBUCKET}/max-backoffice-frontend`,
    host: "bitbucket",
  },
  {
    name: "banking-router",
    group: "max",
    description:
      "Roteador bancário do Max. A documentação de implementação vive no Confluence, no espaço max.",
    stack: ["go"],
    url: `${BITBUCKET}/banking-router`,
    host: "bitbucket",
  },
  {
    name: "web-security",
    group: "max",
    description:
      "Fluxos de verificação facial e de redefinição de credenciais do usuário Max, mais as URLs de suporte.",
    stack: ["vue", "typescript", "tailwind"],
  },
  {
    name: "max-com-br",
    group: "max",
    description:
      "Site institucional max.com.br. Nuxt 3 gerado como SSG e publicado em buckets S3 (homologação e produção).",
    stack: ["vue", "typescript", "tailwind"],
    url: `${BITBUCKET}/max-com-br`,
    host: "bitbucket",
  },

  // Plataforma compartilhada
  {
    name: "frontend-otel-gateway",
    group: "plataforma",
    description:
      "Gateway de telemetria RUM: recebe eventos do agente Elastic APM dos frontends, autentica por API key, descriptografa o payload e repassa ao APM Server.",
    stack: ["hono", "typescript"],
    url: `${BITBUCKET}/frontend-otel-gateway`,
    host: "bitbucket",
  },
  {
    name: "gateway-facial-sdk",
    group: "plataforma",
    description:
      "Captura biométrica hospedada: o gateway escolhe o provider, guarda a regra de negócio e persiste o resultado, enquanto o front entrega a jornada Documento → Facial.",
    stack: ["typescript", "node"],
    url: `${BITBUCKET}/gateway-facial-sdk`,
    host: "bitbucket",
  },
  {
    name: "appmax-biometric-frontend",
    group: "plataforma",
    description:
      "SPA de validação facial. Uma camada própria isola a UI do SDK do provider ativo (Unico ou outro), então trocar de fornecedor não vaza pra tela.",
    stack: ["react", "typescript", "tailwind"],
    url: `${BITBUCKET}/appmax-biometric-frontend`,
    host: "bitbucket",
  },
  {
    name: "appmax-space.bitbucket.io",
    group: "plataforma",
    description: "Página do workspace no Bitbucket.",
    stack: [],
    url: `${BITBUCKET}/appmax-space.bitbucket.io`,
    host: "bitbucket",
  },
];
