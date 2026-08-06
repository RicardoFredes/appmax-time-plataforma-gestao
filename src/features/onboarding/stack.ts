/**
 * Stack do time e atalhos do dia a dia, hardcoded. Os logos vivem em
 * `public/img/stack/`. Só entram aqui links que dá pra derivar do que já
 * existe no código/repos. Nada de placeholder inventado.
 */
import type { QuickLink, StackCategory, StackItem } from "./types";

export const STACK_CATEGORIES: StackCategory[] = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "mobile", label: "Mobile" },
];

export const STACK: StackItem[] = [
  {
    id: "react",
    label: "React",
    category: "frontend",
    logo: "/img/stack/react.svg",
    description:
      "Stack dos frontends novos. Comece pelo max-backoffice-frontend: é a referência de convenções.",
    ecosystem: [
      { label: "Zustand", purpose: "estado global" },
      { label: "TanStack Query", purpose: "server state" },
      { label: "TanStack Table", purpose: "tabelas" },
      { label: "react-hook-form + Zod", purpose: "formulários e validação" },
      { label: "shadcn/ui", purpose: "componentes" },
      { label: "Vitest + MSW", purpose: "testes" },
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    category: "frontend",
    logo: "/img/stack/typescript.svg",
    description: "Padrão em todo projeto novo de frontend e em tooling.",
  },
  {
    id: "tailwind",
    label: "Tailwind CSS",
    category: "frontend",
    logo: "/img/stack/tailwind.svg",
    description:
      "Estilização utility-first. Nos projetos novos é Tailwind 4, com config CSS-first (sem tailwind.config).",
    ecosystem: [
      { label: "shadcn/ui", purpose: "componentes (React)" },
      { label: "DaisyUI", purpose: "componentes (Astro)" },
    ],
  },
  {
    id: "vue",
    label: "Vue.js",
    category: "frontend",
    logo: "/img/stack/vue.svg",
    description:
      "Base dos apps web mais antigos: client, login, CRM e o site do Max.",
    deprecation: "migrando para React",
    ecosystem: [
      { label: "Pinia", purpose: "estado global" },
      { label: "vue-router", purpose: "roteamento" },
      { label: "Nuxt 3", purpose: "SSG (max-com-br)" },
      { label: "@appmax_npm/ds-prime", purpose: "design system" },
    ],
  },
  {
    id: "astro",
    label: "Astro",
    category: "frontend",
    logo: "/img/stack/astro.svg",
    description: "Sites estáticos e ferramentas internas.",
    ecosystem: [{ label: "i18n custom", purpose: "PT/EN tipado" }],
  },
  {
    id: "node",
    label: "Node.js",
    category: "backend",
    logo: "/img/stack/node.svg",
    description: "Runtime das APIs, BFFs e scripts do time.",
  },
  {
    id: "hono",
    label: "Hono",
    category: "backend",
    logo: "/img/stack/hono.svg",
    description:
      "HTTP leve em TypeScript, geralmente sobre Cloudflare Workers. É o default dos serviços novos.",
    ecosystem: [{ label: "Zod", purpose: "validação de payload" }],
  },
  {
    id: "php",
    label: "PHP",
    category: "backend",
    logo: "/img/stack/php.svg",
    description:
      "Stack legada relevante: o sistema é um monolito Laravel e continua sendo a fonte de verdade de muita coisa.",
    ecosystem: [
      { label: "Laravel", purpose: "framework" },
      { label: "Eloquent", purpose: "ORM" },
    ],
  },
  {
    id: "go",
    label: "Go",
    category: "backend",
    logo: "/img/stack/go.svg",
    description:
      "Serviços onde performance e concorrência pesam, como o banking-router.",
    ecosystem: [
      { label: "Gin", purpose: "HTTP" },
      { label: "OpenTelemetry", purpose: "observabilidade" },
    ],
  },
  {
    id: "postgres",
    label: "PostgreSQL",
    category: "backend",
    logo: "/img/stack/postgres.svg",
    description: "Banco relacional principal dos serviços.",
    ecosystem: [
      { label: "Supabase", purpose: "Postgres hospedado + auth + realtime" },
    ],
  },
  {
    id: "flutter",
    label: "Flutter",
    category: "mobile",
    logo: "/img/stack/flutter.svg",
    description: "Framework dos apps Max e Appmax (Android + iOS).",
    ecosystem: [{ label: "Melos", purpose: "monorepo" }],
  },
  {
    id: "firebase",
    label: "Firebase",
    category: "mobile",
    logo: "/img/stack/firebase.svg",
    description: "Auth, push, analytics e funções auxiliares dos apps mobile.",
  },
];

export const STACK_BY_ID = new Map(STACK.map((s) => [s.id, s]));

/**
 * Coisas que aparecem como chip (skill de alguém, stack de um repo) mas não
 * merecem card próprio na seção Stack, seja porque são ecossistema de outro
 * item, seja porque nem são tecnologia.
 */
const EXTRA_CHIPS: Record<string, { label: string; logo?: string }> = {
  laravel: { label: "Laravel", logo: "/img/stack/laravel.svg" },
  python: { label: "Python", logo: "/img/stack/python.svg" },
  design: { label: "Design" },
  ux: { label: "UX" },
};

/** Rótulo + logo de um id de stack, com fallback pro próprio id. */
export function chipFor(id: string): { label: string; logo?: string } {
  const item = STACK_BY_ID.get(id);
  if (item) return { label: item.label, logo: item.logo };
  return EXTRA_CHIPS[id] ?? { label: id };
}

export const QUICK_LINKS: QuickLink[] = [
  {
    label: "Jira",
    description: "Board tecnologia-appmax. As tarefas da aba Tarefas saem daqui.",
    url: "https://tecnologia-appmax.atlassian.net/jira/projects",
    logo: "/img/tools/jira.svg",
  },
  {
    label: "Confluence",
    description: "Documentação de arquitetura e implementação dos serviços.",
    url: "https://tecnologia-appmax.atlassian.net/wiki",
    logo: "/img/tools/confluence.svg",
  },
  {
    label: "Bitbucket",
    description: "Workspace appmax-space, com quase todos os repositórios do time.",
    url: "https://bitbucket.org/appmax-space/",
    logo: "/img/tools/bitbucket.svg",
  },
  {
    label: "GitHub",
    description: "Organização appmaxbrasil. Hoje só a Central de Ajuda.",
    url: "https://github.com/appmaxbrasil",
    logo: "/img/tools/github.svg",
    mono: true,
  },
  {
    label: "TeamGuide",
    description: "Seu espaço: 1:1s, feedbacks e acompanhamento de carreira.",
    url: "https://login.teamguide.app/my-space",
    logo: "/img/tools/teamguide.png",
  },
  {
    label: "Helpdesk",
    description: "Chamados internos: acessos, equipamento e o que mais travar seu dia.",
    url: "https://helpdesk.appmax.com.br/",
    logo: "/img/tools/helpdesk.ico",
  },
];

/**
 * As outras abas deste painel. `hash` é rota interna; a raiz (`#/`) é este
 * próprio Onboarding, então toda aba daqui tem segmento explícito.
 */
export const PANEL_LINKS: { label: string; hash: string; description: string }[] = [
  {
    label: "Tarefas",
    hash: "#/tarefas",
    description:
      "As issues do Jira do time e dos épicos que acompanhamos, com urgência e filtros.",
  },
  {
    label: "Projetos",
    hash: "#/projetos",
    description:
      "Controle semanal dos projetos do quarter: progresso, saúde e o relatório pra direção.",
  },
  {
    label: "Sustentação",
    hash: "#/sustentacao",
    description:
      "A escala de plantão. Rodízio de 2 semanas por engenheiro, em dois grupos.",
  },
  {
    label: "Férias",
    hash: "#/ferias",
    description: "Quem está fora e quando, o que também move a escala de plantão.",
  },
];
